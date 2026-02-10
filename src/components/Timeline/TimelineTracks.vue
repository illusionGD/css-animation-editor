<template>
  <div class="timeline-tracks" ref="tracksContainer">
    <!-- 标尺 -->
    <div class="timeline-ruler">
      <div 
        v-for="(tick, index) in frameTicks" 
        :key="`ruler-${index}`"
        class="ruler-tick"
        :class="{ major: tick.isMajor }"
        :style="{ left: `${tick.position}px` }"
      >
        <span v-if="tick.isMajor" class="tick-label">{{ tick.label }}</span>
      </div>
    </div>

    <!-- 时间轴网格背景 -->
    <svg class="timeline-grid" :width="Math.max(contentWidth, containerWidth)" :height="Math.max(totalHeight, containerHeight)">
      <!-- 垂直网格线 -->
      <line
        v-for="(tick, index) in frameTicks"
        :key="`frame-${index}`"
        :x1="tick.position"
        :x2="tick.position"
        y1="24"
        :y2="Math.max(totalHeight + 24, containerHeight)"
        :class="['grid-line', { major: tick.isMajor }]"
      />
    </svg>

    <!-- 关键帧轨道列表 -->
    <div class="tracks-list" :style="{ minHeight: `${containerHeight - 24}px` }">
      <div
        v-for="(track, trackIndex) in tracks"
        :key="trackIndex"
        class="track-row"
        :style="{ height: `${trackHeight}px` }"
      >
        <!-- 关键帧点 -->
        <div
          v-for="(keyFrame, keyFrameIndex) in track.keyframes"
          :key="`kf-${trackIndex}-${keyFrameIndex}`"
          class="keyframe-dot"
          :class="{ selected: isKeyFrameSelected(trackIndex, keyFrameIndex) }"
          :style="{ left: `${timeToPixel(keyFrame.time)}px` }"
          @mousedown.stop="startDragKeyFrame(trackIndex, keyFrameIndex, $event)"
        >
          <n-icon :component="Diamond" />
        </div>
      </div>
    </div>

    <!-- 播放头 -->
    <div
      class="playhead"
      :style="{ left: `${playHeadPosition}px` }"
      @mousedown.stop="startDragPlayHead"
    >
      <div class="playhead-line"></div>
      <div class="playhead-handle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { Diamond } from '@vicons/ionicons5'
import type { AnimationTrack } from '@/types'

interface Props {
  tracks: AnimationTrack[]
  currentTime?: number // 当前播放时间（毫秒）
  duration?: number // 总时长（毫秒）
  fps?: number // 帧率
  zoom?: number // 缩放级别（像素/秒）
}

const props = withDefaults(defineProps<Props>(), {
  currentTime: 0,
  duration: 3000,
  fps: 60,
  zoom: 100
})

const emit = defineEmits<{
  'update:currentTime': [time: number]
  'update:zoom': [zoom: number]
  'keyframe-move': [trackIndex: number, keyframeIndex: number, newTime: number]
  'keyframe-add': [trackIndex: number, time: number]
  'keyframe-select': [trackIndex: number, keyframeIndex: number]
}>()

// 常量
const trackHeight = 32 // 每个轨道高度
const rulerHeight = 24 // 标尺高度
const minZoom = 10 // 最小缩放（像素/秒）
const maxZoom = 2000 // 最大缩放（像素/秒）

// 引用
const tracksContainer = ref<HTMLElement>()
const containerWidth = ref(0)
const containerHeight = ref(0)

// 选中的关键帧
const selectedKeyFrame = ref<{ trackIndex: number; keyframeIndex: number } | null>(null)

// 计算属性
const totalHeight = computed(() => props.tracks.length * trackHeight)
const contentWidth = computed(() => (props.duration / 1000) * props.zoom)

// 帧间隔（毫秒）
const frameInterval = computed(() => 1000 / props.fps)

// 时间转像素
const timeToPixel = (time: number) => {
  return (time / 1000) * props.zoom
}

// 像素转时间
const pixelToTime = (pixel: number) => {
  return (pixel / props.zoom) * 1000
}

// 对齐到最近的帧
const snapToFrame = (time: number) => {
  const frame = Math.round(time / frameInterval.value)
  return frame * frameInterval.value
}

// 播放头位置
const playHeadPosition = computed(() => timeToPixel(props.currentTime))

// 生成帧刻度
const frameTicks = computed(() => {
  const ticks: Array<{ position: number; isMajor: boolean; label: string }> = []
  const totalDuration = Math.max(props.duration, pixelToTime(containerWidth.value) || 0)
  const totalFrames = Math.ceil(totalDuration / frameInterval.value)
  
  // 根据缩放级别决定显示的帧间隔
  let frameStep = 1
  if (props.zoom < 30) {
    frameStep = props.fps // 缩放很小时每秒显一个刻度
  } else if (props.zoom < 60) {
    frameStep = 10 // 每10帧
  } else if (props.zoom < 150) {
    frameStep = 5 // 每5帧
  } else {
    frameStep = 1 // 每帧
  }

  for (let i = 0; i <= totalFrames; i += frameStep) {
    const time = i * frameInterval.value
    const position = timeToPixel(time)
    
    // 每秒是主刻度
    const isMajor = i % props.fps === 0
    let label = ''
    if (isMajor) {
      label = `${i / props.fps}s`
    } else if (frameStep >= 5) {
      // 如果间隔较大，显示帧数
      label = `${i % props.fps}f`
    }
    
    ticks.push({ position, isMajor, label })
  }

  return ticks
})

// 判断关键帧是否选中
const isKeyFrameSelected = (trackIndex: number, keyframeIndex: number) => {
  return (
    selectedKeyFrame.value?.trackIndex === trackIndex &&
    selectedKeyFrame.value?.keyframeIndex === keyframeIndex
  )
}

// 更新容器尺寸
const updateContainerSize = () => {
  if (tracksContainer.value) {
    containerWidth.value = tracksContainer.value.clientWidth
    containerHeight.value = tracksContainer.value.clientHeight
  }
}

//#region 拖拽播放头
let isDraggingPlayHead = false

const startDragPlayHead = (e: MouseEvent) => {
  isDraggingPlayHead = true
  document.addEventListener('mousemove', onDragPlayHead)
  document.addEventListener('mouseup', stopDragPlayHead)
}

const onDragPlayHead = (e: MouseEvent) => {
  if (!isDraggingPlayHead || !tracksContainer.value) return

  const rect = tracksContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left + tracksContainer.value.scrollLeft
  const time = pixelToTime(Math.max(0, x))
  const snappedTime = snapToFrame(time)

  emit('update:currentTime', Math.max(0, Math.min(snappedTime, props.duration)))
}

const stopDragPlayHead = () => {
  isDraggingPlayHead = false
  document.removeEventListener('mousemove', onDragPlayHead)
  document.removeEventListener('mouseup', stopDragPlayHead)
}
//#endregion

//#region 拖拽关键帧
let isDraggingKeyFrame = false
let draggingKeyFrame: { trackIndex: number; keyframeIndex: number } | null = null

const startDragKeyFrame = (trackIndex: number, keyframeIndex: number, e: MouseEvent) => {
  isDraggingKeyFrame = true
  draggingKeyFrame = { trackIndex, keyframeIndex }
  selectedKeyFrame.value = { trackIndex, keyframeIndex }
  
  emit('keyframe-select', trackIndex, keyframeIndex)
  
  document.addEventListener('mousemove', onDragKeyFrame)
  document.addEventListener('mouseup', stopDragKeyFrame)
}

const onDragKeyFrame = (e: MouseEvent) => {
  if (!isDraggingKeyFrame || !draggingKeyFrame || !tracksContainer.value) return

  const rect = tracksContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left + tracksContainer.value.scrollLeft
  const time = pixelToTime(Math.max(0, x))
  const snappedTime = snapToFrame(time)

  emit(
    'keyframe-move',
    draggingKeyFrame.trackIndex,
    draggingKeyFrame.keyframeIndex,
    Math.max(0, Math.min(snappedTime, props.duration))
  )
}

const stopDragKeyFrame = () => {
  isDraggingKeyFrame = false
  draggingKeyFrame = null
  document.removeEventListener('mousemove', onDragKeyFrame)
  document.removeEventListener('mouseup', stopDragKeyFrame)
}
//#endregion

//#region 滚轮缩放
const onWheel = (e: WheelEvent) => {
  // 如果按住ctrl，则缩放；否则原生滚动
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(minZoom, Math.min(maxZoom, props.zoom * delta))
    emit('update:zoom', newZoom)
  }
}

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
  tracksContainer.value?.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
  tracksContainer.value?.removeEventListener('wheel', onWheel)
  document.removeEventListener('mousemove', onDragPlayHead)
  document.removeEventListener('mouseup', stopDragPlayHead)
  document.removeEventListener('mousemove', onDragKeyFrame)
  document.removeEventListener('mouseup', stopDragKeyFrame)
})
//#endregion
</script>

<style lang="scss" scoped>
.timeline-tracks {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--bg-color-primary);
  @include custom-scrollbar;
}

.timeline-ruler {
  position: sticky;
  top: 0;
  height: 24px;
  background-color: var(--bg-color-secondary);
  border-bottom: 1px solid var(--color-border);
  z-index: 20;
  pointer-events: none;
}

.ruler-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: var(--color-border);
  
  &.major {
    height: 100%;
    background-color: var(--text-color-tertiary);
  }
  
  &:not(.major) {
    height: 50%;
    bottom: 0;
    top: auto;
  }
}

.tick-label {
  position: absolute;
  left: 4px;
  top: 2px;
  font-size: 10px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.timeline-grid {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.grid-line {
  stroke: var(--color-border);
  stroke-width: 1;
  opacity: 0.5;

  &.major {
    stroke: var(--text-color-tertiary);
    stroke-width: 1;
    opacity: 0.8;
  }
}

.tracks-list {
  position: relative;
  z-index: 1;
  // padding-top: 24px; // 留出标尺位置 - 不需要，因为标尺是sticky且grid有y1=24
}

.track-row {
  position: relative;
  width: 100%;
  border-bottom: 1px solid var(--color-border);
}

.keyframe-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  cursor: grab;
  color: var(--color-primary);
  transition: all 0.2s;
  z-index: 2;

  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }

  &:active {
    cursor: grabbing;
  }

  &.selected {
    color: var(--color-warning);
    transform: translate(-50%, -50%) scale(1.3);
  }

  :deep(.n-icon) {
    font-size: 16px;
  }
}

.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  z-index: 30; // 高于标尺
  pointer-events: none;
}

.playhead-line {
  position: absolute;
  top: 24px; // 避开标尺
  bottom: 0;
  left: 0;
  width: 1px;
  background: var(--color-error);
}

.playhead-handle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 24px;
  background: var(--color-error);
  cursor: ew-resize;
  pointer-events: auto;
  clip-path: polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%);
  
  &:hover {
    background: var(--color-error-hover);
  }
}
</style>
