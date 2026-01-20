<template>
  <div class="timeline">
    <div class="timeline-body">
      <!-- 左侧（20%）：顶部控制按钮 + 通道列表 -->
      <div class="timeline-left">
        <!-- 顶部控制按钮区域 -->
        <div class="timeline-left-header">
          <div class="playback-controls">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  size="small"
                  @click="togglePlay"
                >
                  {{ isPlaying ? '⏸' : '▶' }}
                </n-button>
              </template>
              {{ isPlaying ? '暂停' : '播放' }}
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  size="small"
                  @click="stop"
                >
                  <template #icon>
                    <n-icon><RefreshIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              重置
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  size="small"
                  type="primary"
                  @click="showAddChannelDialog = true"
                >
                  <template #icon>
                    <n-icon><AddIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              添加通道
            </n-tooltip>
          </div>
          <div class="timeline-info">
            <span>{{ formatTime(currentTime) }} / </span>
            <n-input-number
              v-model:value="duration"
              :min="TIMELINE_MIN_DURATION"
              :max="TIMELINE_MAX_DURATION"
              :step="TIMELINE_DURATION_STEP"
              size="small"
              :show-button="false"
              style="width: 80px"
            />
          </div>
          <div class="timeline-settings">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  size="small"
                  :type="uiStore.autoKeyframe ? 'primary' : 'default'"
                  @click="uiStore.toggleAutoKeyframe"
                >
                  <template #icon>
                    <n-icon><FlashIcon /></n-icon>
                  </template>
                </n-button>
              </template>
              自动K帧
            </n-tooltip>
          </div>
        </div>
        <!-- 通道列表 -->
        <TimelineChannels
          ref="channelsRef"
          :tracks="(tracks as AnimationTrack[])"
          :current-time="currentTime"
          :duration="duration"
          @add-keyframe="handleAddKeyframeFromChannel"
        />
      </div>
      
      <div class="timeline-right">
        <!-- 时间轴标尺（与左侧顶部高度对齐） -->
        <div
          class="timeline-ruler-wrapper"
          @click="handleRulerClick"
        >
          <div class="timeline-ruler-box">
            <TimelineRuler
              :duration="duration"
              :zoom="zoom"
            />
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
          <!-- 播放头（在标尺上） -->
          <div
            class="timeline-playhead timeline-playhead-ruler"
            :style="{ left: `${(currentTime / duration) * 100}%` }"
            @mousedown.stop="startPlayheadDrag($event, 'ruler')"
          />
        </div>
        <!-- 时间刻度网格 -->
        <div
          ref="tracksWrapperRef"
          class="timeline-tracks-wrapper"
          @wheel="handleWheel"
          @click="handleTracksClick"
        >
          <TimelineGrid
            :duration="duration"
            :zoom="zoom"
            :width="contentWidth"
          />
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
              @select-keyframe="handleSelectKeyframe"
            />
            <n-empty
              v-if="tracks.length === 0"
              description="请先选择一个元素，然后添加通道"
              style="padding: 40px"
            />
          </div>
          <!-- 播放头（在网格上） -->
          <div
            class="timeline-playhead timeline-playhead-grid"
            :style="{ left: `${(currentTime / duration) * 100}%` }"
            @mousedown.stop="startPlayheadDrag($event, 'grid')"
          />
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
      <div
        v-if="editingKeyframe"
        class="keyframe-edit-form"
      >
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
import { computed, onUnmounted, ref, onMounted, watch, nextTick } from 'vue'
import { NButton, NInputNumber, NEmpty, NIcon, NModal, NSelect, NInput, NTooltip } from 'naive-ui'
import { Add, Refresh, Flash } from '@vicons/ionicons5'
import { useAnimationStore } from '@/stores/animationStore'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore } from '@/stores/uiStore'
import TimelineTrack from './TimelineTrack.vue'
import TimelineGrid from './TimelineGrid.vue'
import TimelineRuler from './TimelineRuler.vue'
import TimelineChannels from './TimelineChannels.vue'
import {
  TIMELINE_BASE_INTERVAL,
  TIMELINE_INTERVALS,
  TIMELINE_DEFAULT_CONTENT_WIDTH,
  TIMELINE_MIN_DURATION,
  TIMELINE_MAX_DURATION,
  TIMELINE_DURATION_STEP,
  TIMELINE_MAJOR_INTERVAL_MULTIPLIER
} from './constants'
import type { AnimationTrack } from '@/types'

const animationStore = useAnimationStore()
const canvasStore = useCanvasStore()
const uiStore = useUIStore()

const AddIcon = Add
const RefreshIcon = Refresh
const FlashIcon = Flash
const showAddChannelDialog = ref(false)
const selectedProperty = ref<string | null>(null)
const showKeyframeEditDialog = ref(false)
const editingKeyframe = ref<{
  property: string
  index: number
  value: number | string
} | null>(null)

const channelsRef = ref<InstanceType<typeof TimelineChannels>>()
const tracksWrapperRef = ref<HTMLElement>()
const zoom = ref(1)
const snapEnabled = ref(true)
const contentWidth = ref(TIMELINE_DEFAULT_CONTENT_WIDTH)

const isPlaying = computed(() => animationStore.isPlaying)
const currentTime = computed(() => animationStore.currentTime)
const duration = computed({
  get: () => animationStore.duration,
  set: val => animationStore.setDuration(val)
})
const tracks = computed(() => animationStore.tracks)

// 计算吸附间隔（根据缩放级别动态调整）
const snapInterval = computed(() => {
  return TIMELINE_BASE_INTERVAL / zoom.value
})

// 计算时间刻度格子
const timeGridTicks = computed(() => {
  const ticks: Array<{ time: number; position: number; isMajor: boolean }> = []
  const adjustedInterval = TIMELINE_BASE_INTERVAL / zoom.value

  let timeInterval = TIMELINE_INTERVALS[TIMELINE_INTERVALS.length - 1]
  for (const interval of TIMELINE_INTERVALS) {
    if (adjustedInterval <= interval) {
      timeInterval = interval
      break
    }
  }

  const majorInterval = timeInterval * TIMELINE_MAJOR_INTERVAL_MULTIPLIER

  for (let time = 0; time <= duration.value; time += timeInterval) {
    const isMajor = Math.abs(time % majorInterval) < 0.1
    const position = (time / duration.value) * 100
    ticks.push({ time, position, isMajor })
  }

  return ticks
})

// 更新内容宽度
function updateContentWidth() {
  if (tracksWrapperRef.value) {
    contentWidth.value = tracksWrapperRef.value.clientWidth
  }
}

function handleWheel(e: WheelEvent) {
  // 滚轮缩放时间轴（不需要按Ctrl/Cmd）
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newZoom = zoom.value * delta
  // 限制缩放范围，确保最小间隔不会小于 100ms (0.1s)
  // TIMELINE_BASE_INTERVAL / zoom 应该 >= 100，所以 zoom <= TIMELINE_BASE_INTERVAL / 100 = 1
  // 最大缩放：确保最小间隔不会太小，这里限制最大 zoom 为 10
  zoom.value = Math.max(0.1, Math.min(10, newZoom))
  updateContentWidth()
  // 缩放后，自动将播放头对齐到最近的0.1s刻度
  alignPlayheadToNearestTick()
}

// 将播放头对齐到最近的0.1s刻度
function alignPlayheadToNearestTick() {
  const PLAYHEAD_ALIGN_INTERVAL = 100 // 0.1s
  const currentTimeValue = currentTime.value
  const alignedTime = Math.round(currentTimeValue / PLAYHEAD_ALIGN_INTERVAL) * PLAYHEAD_ALIGN_INTERVAL
  animationStore.seek(Math.max(0, Math.min(duration.value, alignedTime)))
}

// 处理 Delete 键删除选中的关键帧
function handleKeyDown(e: KeyboardEvent) {
  // 如果焦点在输入框等元素上，不处理
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    (e.target as HTMLElement).isContentEditable
  ) {
    return
  }

  // Delete 或 Backspace 键删除选中的关键帧
  // 如果有关键帧被选中，优先删除关键帧，并阻止事件传播到全局处理（避免删除元素）
  if ((e.key === 'Delete' || e.key === 'Backspace') && animationStore.selectedKeyframe) {
    e.preventDefault()
    e.stopPropagation() // 阻止事件传播，避免触发全局的删除元素功能
    const { property, keyframeIndex } = animationStore.selectedKeyframe
    handleRemoveKeyframe(property, keyframeIndex)
    return
  }
}

onMounted(() => {
  updateContentWidth()
  window.addEventListener('resize', updateContentWidth)
  window.addEventListener('keydown', handleKeyDown)
  // 同步滚动：通道列表和时间轴区域
  nextTick(() => {
    syncScroll()
  })
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
  window.removeEventListener('keydown', handleKeyDown)
  stopAnimation()
  stopPlayheadDrag()
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

function handleSelectKeyframe(_property: string, _index: number) {
  // 选中关键帧（已在 TimelineTrack 中设置，这里可以添加额外逻辑）
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

// 播放头拖拽功能
let isPlayheadDragging = false
let playheadDragContainer: HTMLElement | null = null
let dragStartX = 0
let dragStartTime = 0

function startPlayheadDrag(e: MouseEvent, type: 'ruler' | 'grid') {
  e.stopPropagation()
  e.preventDefault()
  
  isPlayheadDragging = true
  dragStartX = e.clientX
  dragStartTime = currentTime.value
  
  // 根据类型选择容器
  if (type === 'ruler') {
    const rulerWrapper = (e.currentTarget as HTMLElement).closest('.timeline-ruler-wrapper') as HTMLElement | null
    playheadDragContainer = rulerWrapper
  } else {
    playheadDragContainer = tracksWrapperRef.value ?? null
  }
  
  if (playheadDragContainer) {
    // 添加拖拽中的样式类
    playheadDragContainer.classList.add('playhead-dragging')
  }
  
  document.addEventListener('mousemove', handlePlayheadDrag)
  document.addEventListener('mouseup', stopPlayheadDrag)
}

function handlePlayheadDrag(e: MouseEvent) {
  if (!isPlayheadDragging || !playheadDragContainer) return
  updatePlayheadTime(e)
}

function updatePlayheadTime(e: MouseEvent) {
  if (!playheadDragContainer) return
  
  const rect = playheadDragContainer.getBoundingClientRect()
  const pixelWidth = rect.width
  
  // 计算鼠标移动的像素距离
  const deltaX = e.clientX - dragStartX
  
  // 根据当前缩放级别，计算每个像素对应的时间（毫秒）
  // 总时长 / 像素宽度 = 每像素对应的时间
  const timePerPixel = duration.value / pixelWidth
  
  // 计算移动的时间距离
  const timeDelta = deltaX * timePerPixel
  
  // 将时间增量对齐到0.1s（100ms）的倍数
  const PLAYHEAD_DRAG_INTERVAL = 100 // 0.1s
  const alignedTimeDelta = Math.round(timeDelta / PLAYHEAD_DRAG_INTERVAL) * PLAYHEAD_DRAG_INTERVAL
  
  // 计算新的时间位置（从起始时间开始，按0.1s单位移动）
  const newTime = dragStartTime + alignedTimeDelta
  
  // 限制在有效范围内
  const clampedTime = Math.max(0, Math.min(duration.value, newTime))
  
  animationStore.seek(clampedTime)
}

function stopPlayheadDrag() {
  if (isPlayheadDragging) {
    isPlayheadDragging = false
    if (playheadDragContainer) {
      playheadDragContainer.classList.remove('playhead-dragging')
    }
    playheadDragContainer = null
    document.removeEventListener('mousemove', handlePlayheadDrag)
    document.removeEventListener('mouseup', stopPlayheadDrag)
  }
}

// 点击时间轴跳转
function handleRulerClick(e: MouseEvent) {
  // 如果点击的是播放头，不处理（由拖拽处理）
  if ((e.target as HTMLElement).closest('.timeline-playhead')) {
    return
  }
  
  const container = e.currentTarget as HTMLElement
  const rect = container.getBoundingClientRect()
  const x = e.clientX - rect.left
  const clampedX = Math.max(0, Math.min(rect.width, x))
  let newTime = (clampedX / rect.width) * duration.value
  
  // 点击跳转时，如果启用吸附，对齐到网格；否则对齐到0.1s
  if (snapEnabled.value && snapInterval.value) {
    newTime = Math.round(newTime / snapInterval.value) * snapInterval.value
  } else {
    // 未启用吸附时，也按照0.1s对齐
    const PLAYHEAD_CLICK_INTERVAL = 100 // 0.1s
    newTime = Math.round(newTime / PLAYHEAD_CLICK_INTERVAL) * PLAYHEAD_CLICK_INTERVAL
  }
  
  animationStore.seek(Math.max(0, Math.min(duration.value, newTime)))
}

function handleTracksClick(e: MouseEvent) {
  // 如果点击的是关键帧或播放头，不处理
  if (
    (e.target as HTMLElement).closest('.keyframe') ||
    (e.target as HTMLElement).closest('.timeline-playhead')
  ) {
    return
  }
  
  if (!tracksWrapperRef.value) return
  
  const rect = tracksWrapperRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const clampedX = Math.max(0, Math.min(rect.width, x))
  let newTime = (clampedX / rect.width) * duration.value
  
  // 点击跳转时，如果启用吸附，对齐到网格；否则对齐到0.1s
  if (snapEnabled.value && snapInterval.value) {
    newTime = Math.round(newTime / snapInterval.value) * snapInterval.value
  } else {
    // 未启用吸附时，也按照0.1s对齐
    const PLAYHEAD_CLICK_INTERVAL = 100 // 0.1s
    newTime = Math.round(newTime / PLAYHEAD_CLICK_INTERVAL) * PLAYHEAD_CLICK_INTERVAL
  }
  
  animationStore.seek(Math.max(0, Math.min(duration.value, newTime)))
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

.timeline-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧（20%）：顶部控制按钮 + 通道列表 */
.timeline-left {
  width: 20%;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  border-right: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  overflow: hidden;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  position: relative;
}

.timeline-left-header {
  padding: 8px 12px;
  border-bottom: 2px solid var(--color-border);
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background: var(--n-color);
  height: 38px;
  min-height: 38px;
  box-sizing: border-box;
}

.playback-controls {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
  
  :deep(.n-button) {
    margin: 2px 0;
  }
}

.timeline-info {
  font-size: 11px;
  color: var(--n-textColor2);
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.timeline-settings {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 11px;
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
  
  :deep(.n-button) {
    margin: 2px 0;
  }
}

.auto-keyframe-switch {
  display: flex;
  align-items: center;
}

/* 右侧（80%）：时间轴标尺 + 时间刻度网格 */
.timeline-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: var(--n-color);
}

.timeline-ruler-wrapper {
  height: 38px;
  min-height: 38px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  background: var(--n-color);
  border-left: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.timeline-ruler-box {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  overflow: visible;
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
      background: var(--color-border);
      opacity: 0.4;
    }
  }

  &:not(.time-grid-tick-major) {
    .time-grid-line {
      height: 50%;
      background: var(--color-border);
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
  background: var(--n-color);
}

.timeline-tracks {
  position: relative;
  min-height: 100%;
  z-index: 2;
}

.timeline-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #18a058;
  pointer-events: auto;
  z-index: 20;
  box-shadow: 0 0 4px rgba(24, 160, 88, 0.5);
  cursor: ew-resize;
  transition: width 0.1s, background 0.1s;

  &:hover {
    width: 3px;
    background: #36ad6a;
    box-shadow: 0 0 6px rgba(24, 160, 88, 0.7);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #18a058;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    cursor: grab;
  }

  &:hover::before {
    border-top-color: #36ad6a;
  }

  &:active {
    cursor: grabbing;

    &::before {
      cursor: grabbing;
      transform: translateX(-50%) scale(1.1);
    }
  }
}

.timeline-playhead-ruler {
  z-index: 10;
}

.timeline-playhead-grid {
  z-index: 20;
}

/* 拖拽中的样式 */
.playhead-dragging {
  user-select: none;
  
  .timeline-playhead {
    width: 3px;
    background: #36ad6a;
    box-shadow: 0 0 8px rgba(24, 160, 88, 0.8);
    
    &::before {
      transform: translateX(-50%) scale(1.1);
      border-top-color: #36ad6a;
    }
  }
}

/* 确保左右两侧顶部高度对齐 */
</style>
