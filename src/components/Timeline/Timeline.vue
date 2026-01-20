<template>
  <div class="timeline">
    <div class="timeline-header">
      <div class="playback-controls">
        <n-button size="small" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </n-button>
        <n-button size="small" @click="stop"> 停止 </n-button>
      </div>
      <div class="timeline-info">
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      <div class="timeline-settings">
        <div class="auto-keyframe-switch">
          <span style="font-size: 12px; margin-right: 8px">自动K帧</span>
          <n-switch v-model:value="uiStore.autoKeyframe" size="small" />
        </div>
        <n-button size="small" type="primary" @click="showAddChannelDialog = true">
          <template #icon>
            <n-icon><AddIcon /></n-icon>
          </template>
          添加通道
        </n-button>
        <n-input-number
          v-model:value="duration"
          :min="100"
          :max="10000"
          :step="100"
          size="small"
          style="width: 100px"
        />
        <span style="margin-left: 8px; font-size: 12px">ms</span>
      </div>
    </div>
    <div ref="contentRef" class="timeline-content">
      <div class="timeline-body">
        <!-- 左侧通道列表 -->
        <TimelineChannels
          ref="channelsRef"
          :tracks="tracks as AnimationTrack[]"
          :current-time="currentTime"
          :duration="duration"
          @add-keyframe="handleAddKeyframeFromChannel"
        />
        <!-- 右侧时间轴区域 -->
        <div class="timeline-main">
          <div class="timeline-ruler-wrapper">
            <div class="timeline-ruler">
              <TimelineRuler :duration="duration" :zoom="zoom" />
            </div>
            <!-- 时间刻度格子 -->
            <div class="timeline-time-grid">
              <div
                v-for="tick in timeGridTicks"
                :key="`grid-${tick.time}`"
                class="time-grid-tick"
                :class="{ 'time-grid-tick-major': tick.isMajor }"
                :style="{ left: `${tick.position}%` }"
              >
                <div class="time-grid-line" />
              </div>
            </div>
          </div>
          <div ref="tracksWrapperRef" class="timeline-tracks-wrapper" @wheel="handleWheel">
            <TimelineGrid :duration="duration" :zoom="zoom" :width="contentWidth" />
            <div class="timeline-tracks">
              <TimelineTrack
                v-for="track in tracks"
                :key="track.property"
                :track="track"
                :current-time="currentTime"
                :duration="duration"
                :snap-enabled="snapEnabled"
                :snap-interval="snapInterval"
                @add-keyframe="handleAddKeyframe"
                @remove-keyframe="handleRemoveKeyframe"
                @update-keyframe-time="handleUpdateKeyframeTime"
                @edit-keyframe-value="handleEditKeyframeValue"
              />
              <n-empty
                v-if="tracks.length === 0"
                description="请先选择一个元素，然后添加通道"
                style="padding: 40px"
              />
            </div>
            <div
              class="timeline-playhead"
              :style="{ left: `${(currentTime / duration) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
    <n-modal
      v-model:show="showAddChannelDialog"
      preset="dialog"
      title="添加通道"
      positive-text="确定"
      negative-text="取消"
      @positive-click="handleAddChannel"
    >
      <n-select
        v-model:value="selectedProperty"
        :options="availableProperties"
        placeholder="选择CSS属性"
        filterable
      />
    </n-modal>
    <!-- 关键帧值编辑对话框 -->
    <n-modal
      v-model:show="showKeyframeEditDialog"
      preset="dialog"
      title="编辑关键帧值"
      positive-text="确定"
      negative-text="取消"
      @positive-click="handleSaveKeyframeValue"
    >
      <div v-if="editingKeyframe" class="keyframe-edit-form">
        <div class="form-item">
          <label>属性：</label>
          <span>{{ getPropertyLabel(editingKeyframe.property) }}</span>
        </div>
        <div class="form-item">
          <label>值：</label>
          <n-input-number
            v-if="typeof editingKeyframe.value === 'number'"
            v-model:value="editingKeyframe.value"
            :min="undefined"
            :max="undefined"
            :step="1"
            style="width: 100%"
          />
          <n-input
            v-else
            v-model:value="editingKeyframe.value"
            placeholder="输入值"
            style="width: 100%"
          />
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, onMounted, watch } from 'vue'
import { NButton, NInputNumber, NEmpty, NIcon, NModal, NSelect, NInput, NSwitch } from 'naive-ui'
import { Add } from '@vicons/ionicons5'
import { useAnimationStore } from '@/stores/animationStore'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore } from '@/stores/uiStore'
import TimelineTrack from './TimelineTrack.vue'
import TimelineGrid from './TimelineGrid.vue'
import TimelineRuler from './TimelineRuler.vue'
import TimelineChannels from './TimelineChannels.vue'
import type { AnimationTrack } from '@/types'

const animationStore = useAnimationStore()
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

const AddIcon = Add
const showAddChannelDialog = ref(false)
const selectedProperty = ref<string | null>(null)
const showKeyframeEditDialog = ref(false)
const editingKeyframe = ref<{
  property: string
  index: number
  value: number | string
} | null>(null)

const contentRef = ref<HTMLElement>()
const channelsRef = ref<InstanceType<typeof TimelineChannels>>()
const tracksWrapperRef = ref<HTMLElement>()
const zoom = ref(1)
const snapEnabled = ref(true)
const contentWidth = ref(1000)

const isPlaying = computed(() => animationStore.isPlaying)
const currentTime = computed(() => animationStore.currentTime)
const duration = computed({
  get: () => animationStore.duration,
  set: val => animationStore.setDuration(val)
})
const tracks = computed(() => animationStore.tracks)

// 计算吸附间隔（根据缩放级别动态调整）
const snapInterval = computed(() => {
  // 基础间隔：100ms
  const baseInterval = 100
  return baseInterval / zoom.value
})

// 计算时间刻度格子
const timeGridTicks = computed(() => {
  const ticks: Array<{ time: number; position: number; isMajor: boolean }> = []
  const baseInterval = 100
  const adjustedInterval = baseInterval / zoom.value

  const intervals = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  let timeInterval = 10000
  for (const interval of intervals) {
    if (adjustedInterval <= interval) {
      timeInterval = interval
      break
    }
  }

  const majorInterval = timeInterval * 5

  for (let time = 0; time <= duration.value; time += timeInterval) {
    const isMajor = Math.abs(time % majorInterval) < 0.1
    const position = (time / duration.value) * 100
    ticks.push({ time, position, isMajor })
  }

  return ticks
})

// 更新内容宽度
function updateContentWidth() {
  if (contentRef.value) {
    const tracksWrapper = contentRef.value.querySelector('.timeline-tracks-wrapper') as HTMLElement
    if (tracksWrapper) {
      contentWidth.value = tracksWrapper.clientWidth
    }
  }
}

function handleWheel(e: WheelEvent) {
  // 滚轮缩放时间轴（不需要按Ctrl/Cmd）
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.1, Math.min(10, zoom.value * delta))
  updateContentWidth()
}

onMounted(() => {
  updateContentWidth()
  window.addEventListener('resize', updateContentWidth)
  // 同步滚动：通道列表和时间轴区域
  syncScroll()
})

// 同步滚动功能
function syncScroll() {
  if (!channelsRef.value || !tracksWrapperRef.value) return

  const channelsList = channelsRef.value.$el?.querySelector('.channels-list') as HTMLElement
  if (!channelsList) return

  // 监听通道列表滚动，同步到时间轴区域
  channelsList.addEventListener('scroll', () => {
    if (tracksWrapperRef.value) {
      tracksWrapperRef.value.scrollTop = channelsList.scrollTop
    }
  })

  // 监听时间轴区域滚动，同步到通道列表
  tracksWrapperRef.value.addEventListener('scroll', () => {
    if (channelsList) {
      channelsList.scrollTop = tracksWrapperRef.value!.scrollTop
    }
  })
}

onUnmounted(() => {
  window.removeEventListener('resize', updateContentWidth)
  stopAnimation()
})

let animationFrame: number | null = null
let startTime = 0

function togglePlay() {
  if (isPlaying.value) {
    animationStore.pause()
    stopAnimation()
  } else {
    animationStore.play()
    startAnimation()
  }
}

function stop() {
  animationStore.stop()
  stopAnimation()
}

function startAnimation() {
  startTime = performance.now() - currentTime.value
  function animate() {
    if (isPlaying.value) {
      const elapsed = performance.now() - startTime
      if (elapsed >= duration.value) {
        animationStore.stop()
        stopAnimation()
      } else {
        animationStore.seek(elapsed)
        animationFrame = requestAnimationFrame(animate)
      }
    }
  }
  animationFrame = requestAnimationFrame(animate)
}

function stopAnimation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const remainingMs = Math.floor(ms % 1000)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0')}`
}

function handleAddKeyframe(property: string, time: number, value: number | string) {
  // 如果 value 为 0 或未提供，尝试从选中元素获取当前值
  let keyframeValue = value
  if (value === 0 || value === undefined || value === null) {
    const selectedElement = canvasStore.selectedElements[0]
    if (selectedElement) {
      // 尝试从 style 中获取属性值
      const styleValue = selectedElement.style[property]
      if (styleValue !== undefined && styleValue !== null && styleValue !== '') {
        // 如果是数字字符串，转换为数字
        const numValue = parseFloat(String(styleValue))
        if (!isNaN(numValue)) {
          keyframeValue = numValue
        } else {
          keyframeValue = styleValue
        }
      } else {
        // 如果没有值，使用默认值
        keyframeValue = 0
      }
    }
  }

  // 确保 track 存在
  if (!animationStore.tracks.find(t => t.property === property)) {
    animationStore.addTrack(property)
  }

  animationStore.addKeyframe(property, {
    time: time / duration.value,
    value: keyframeValue
  })
}

function handleRemoveKeyframe(property: string, index: number) {
  animationStore.removeKeyframe(property, index)
  // 如果删除的是选中的关键帧，清除选中状态
  if (
    animationStore.selectedKeyframe &&
    animationStore.selectedKeyframe.property === property &&
    animationStore.selectedKeyframe.keyframeIndex === index
  ) {
    animationStore.clearSelectedKeyframe()
  }
}

function handleUpdateKeyframeTime(property: string, index: number, time: number) {
  animationStore.updateKeyframe(property, index, { time })
}

function handleEditKeyframeValue(property: string, index: number) {
  const track = animationStore.tracks.find(t => t.property === property)
  if (!track || index < 0 || index >= track.keyframes.length) return

  // 设置选中的关键帧（用于属性面板显示）
  animationStore.setSelectedKeyframe(property, index)

  const keyframe = track.keyframes[index]
  editingKeyframe.value = {
    property,
    index,
    value: keyframe.value
  }
  showKeyframeEditDialog.value = true
}

function handleAddKeyframeFromChannel(property: string, time: number) {
  handleAddKeyframe(property, time, 0)
}

// 可用的CSS属性列表
const availableProperties = computed(() => {
  const allProperties = [
    { label: 'translateX (X轴位移)', value: 'translateX' },
    { label: 'translateY (Y轴位移)', value: 'translateY' },
    { label: 'scaleX (X轴缩放)', value: 'scaleX' },
    { label: 'scaleY (Y轴缩放)', value: 'scaleY' },
    { label: 'rotate (旋转)', value: 'rotate' },
    { label: 'skewX (X轴倾斜)', value: 'skewX' },
    { label: 'skewY (Y轴倾斜)', value: 'skewY' },
    { label: 'width (宽度)', value: 'width' },
    { label: 'height (高度)', value: 'height' },
    { label: 'opacity (透明度)', value: 'opacity' },
    { label: 'background-color (背景色)', value: 'backgroundColor' },
    { label: 'border-radius (圆角)', value: 'borderRadius' },
    { label: 'left (左边距)', value: 'left' },
    { label: 'top (上边距)', value: 'top' }
  ]
  return allProperties.filter(prop => !tracks.value.find(t => t.property === prop.value))
})

function handleAddChannel() {
  if (!selectedProperty.value) {
    return false
  }
  if (!animationStore.selectedElementId) {
    return true
  }
  animationStore.addTrack(selectedProperty.value)
  selectedProperty.value = null
  showAddChannelDialog.value = false
  return true
}

function handleSaveKeyframeValue() {
  if (!editingKeyframe.value) return false

  const { property, index, value } = editingKeyframe.value
  animationStore.updateKeyframe(property, index, { value })
  // 保持关键帧选中状态，以便在属性面板中继续编辑
  animationStore.setSelectedKeyframe(property, index)
  editingKeyframe.value = null
  showKeyframeEditDialog.value = false
  return true
}

// 监听对话框关闭，清除选中状态（如果对话框被取消）
watch(showKeyframeEditDialog, isOpen => {
  if (!isOpen && editingKeyframe.value === null) {
    // 对话框关闭且没有编辑中的关键帧，清除选中状态
    animationStore.clearSelectedKeyframe()
  }
})

function getPropertyLabel(property: string): string {
  const labels: Record<string, string> = {
    translateX: 'X位移',
    translateY: 'Y位移',
    scaleX: 'X缩放',
    scaleY: 'Y缩放',
    rotate: '旋转',
    skewX: 'X倾斜',
    skewY: 'Y倾斜',
    width: '宽度',
    height: '高度',
    opacity: '透明度',
    backgroundColor: '背景色',
    borderRadius: '圆角',
    left: '左边距',
    top: '上边距'
  }
  return labels[property] || property
}
</script>

<style lang="scss" scoped>
.timeline {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-header {
  padding: 12px;
  border-bottom: 1px solid var(--n-borderColor);
  display: flex;
  align-items: center;
  gap: 16px;
}

.playback-controls {
  display: flex;
  gap: 8px;
}

.timeline-info {
  flex: 1;
  font-size: 12px;
  color: var(--n-textColor2);
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.timeline-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.timeline-ruler-wrapper {
  height: 30px;
  border-bottom: 1px solid var(--n-borderColor);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  background: var(--n-color);
}

.timeline-ruler {
  height: 100%;
  position: relative;
  z-index: 2;
}

.timeline-time-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.time-grid-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  display: flex;
  align-items: flex-end;

  &.time-grid-tick-major {
    .time-grid-line {
      height: 100%;
      background: var(--n-borderColor);
      opacity: 0.4;
    }
  }

  &:not(.time-grid-tick-major) {
    .time-grid-line {
      height: 50%;
      background: var(--n-borderColor);
      opacity: 0.2;
    }
  }
}

.time-grid-line {
  width: 1px;
}

.timeline-tracks-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
  @include custom-scrollbar;
}

.timeline-tracks {
  position: relative;
  min-height: 100%;
}

.timeline-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #18a058;
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 0 4px rgba(24, 160, 88, 0.5);
}
</style>
