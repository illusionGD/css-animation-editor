<template>
  <div class="timeline-track">
    <div
      class="track-content"
      @click="handleClick"
    >
      <div
        v-for="(keyframe, index) in track.keyframes"
        :key="index"
        class="keyframe"
        :class="{ selected: isKeyframeSelected(index) }"
        :style="{ left: `${keyframe.time * 100}%` }"
        @mousedown.stop="handleKeyframeClick(index, $event)"
        @dblclick.stop="handleKeyframeDoubleClick(index, $event)"
        @contextmenu.stop="handleKeyframeContextMenu(index, $event)"
      >
        <div class="keyframe-handle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import type { AnimationTrack } from '@/types'
import { TIMELINE_DEFAULT_SNAP_INTERVAL } from './constants'
import { useAnimationStore } from '@/stores/animationStore'

interface Props {
  track: AnimationTrack
  currentTime: number
  duration: number
  snapEnabled?: boolean
  snapInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  snapEnabled: false,
  snapInterval: TIMELINE_DEFAULT_SNAP_INTERVAL
})

const emit = defineEmits<{
  'add-keyframe': [property: string, time: number, value: any]
  'remove-keyframe': [property: string, index: number]
  'update-keyframe-time': [property: string, index: number, time: number]
  'edit-keyframe-value': [property: string, index: number]
  'select-keyframe': [property: string, index: number]
}>()

const animationStore = useAnimationStore()

// 检查关键帧是否被选中
function isKeyframeSelected(index: number): boolean {
  return (
    animationStore.selectedKeyframe?.property === props.track.property &&
    animationStore.selectedKeyframe?.keyframeIndex === index
  )
}

// 处理关键帧点击（选中或开始拖拽）
function handleKeyframeClick(index: number, e: MouseEvent) {
  // 选中关键帧
  animationStore.setSelectedKeyframe(props.track.property, index)
  emit('select-keyframe', props.track.property, index)
  
  // 开始拖拽
  startDrag(index, e)
}

function handleClick(e: MouseEvent) {
  // 如果点击的是关键帧，不添加新关键帧
  if ((e.target as HTMLElement).closest('.keyframe')) {
    return
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  let time = (x / rect.width) * props.duration

  // 如果启用吸附，对齐到网格
  if (props.snapEnabled && props.snapInterval) {
    time = Math.round(time / props.snapInterval) * props.snapInterval
  }

  emit('add-keyframe', props.track.property, time, 0)
}

function handleKeyframeDoubleClick(index: number, e: MouseEvent) {
  e.stopPropagation()
  // 双击编辑关键帧值
  emit('edit-keyframe-value', props.track.property, index)
}

function handleKeyframeContextMenu(index: number, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  // 右键菜单删除关键帧（可以后续扩展为完整菜单）
  emit('remove-keyframe', props.track.property, index)
}

let isDragging = false
let dragIndex = -1
let trackContentRef: HTMLElement | null = null
let dragStartX = 0
let dragStartY = 0
const DRAG_THRESHOLD = 5 // 拖拽阈值（像素）

function startDrag(index: number, e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  
  isDragging = false // 先设为 false，等待判断是否真的拖拽
  dragIndex = index
  dragStartX = e.clientX
  dragStartY = e.clientY
  
  // 保存 track-content 元素的引用
  trackContentRef = (e.currentTarget as HTMLElement).closest('.track-content') as HTMLElement

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', stopDrag)
}

function handleDragMove(e: MouseEvent) {
  if (!trackContentRef || dragIndex < 0) return

  // 判断是否真的在拖拽（移动距离超过阈值）
  const deltaX = Math.abs(e.clientX - dragStartX)
  const deltaY = Math.abs(e.clientY - dragStartY)
  
  if (!isDragging && (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)) {
    isDragging = true
  }

  if (isDragging) {
    handleDrag(e)
  }
}

function handleDrag(e: MouseEvent) {
  if (!isDragging || dragIndex < 0 || !trackContentRef) return

  const rect = trackContentRef.getBoundingClientRect()
  const x = e.clientX - rect.left
  
  // 限制在轨道范围内（0 到 width）
  const clampedX = Math.max(0, Math.min(rect.width, x))
  
  // 计算新的相对时间（0-1）
  let newTime = clampedX / rect.width

  // 如果启用吸附，先对齐到网格，再对齐到其他关键帧
  if (props.snapEnabled) {
    // 1. 先吸附到网格
    if (props.snapInterval) {
      const timeMs = newTime * props.duration
      const snappedTimeMs = Math.round(timeMs / props.snapInterval) * props.snapInterval
      newTime = Math.max(0, Math.min(1, snappedTimeMs / props.duration))
    }
    
    // 2. 再吸附到其他关键帧（吸附阈值：5px）
    const snapThreshold = 5 / rect.width // 5像素对应的相对时间
    for (let i = 0; i < props.track.keyframes.length; i++) {
      if (i === dragIndex) continue // 跳过当前拖拽的关键帧
      const otherTime = props.track.keyframes[i].time
      const timeDiff = Math.abs(newTime - otherTime)
      if (timeDiff < snapThreshold) {
        newTime = otherTime
        break
      }
    }
  }

  // 确保不超出范围
  newTime = Math.max(0, Math.min(1, newTime))

  // 更新关键帧时间
  emit('update-keyframe-time', props.track.property, dragIndex, newTime)
}

function stopDrag() {
  if (isDragging) {
    isDragging = false
  }
  dragIndex = -1
  trackContentRef = null
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', stopDrag)
}

onUnmounted(() => {
  stopDrag()
})
</script>

<style lang="scss" scoped>
.timeline-track {
  height: 40px;
  border-bottom: 1px solid var(--color-border);
//   border-top: 1px solid var(--color-border);
  
  &:first-child {
    border-top: none;
  }
}

.track-content {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.keyframe {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: transform 0.1s;

  &:active {
    cursor: grabbing;
  }

  &.selected {
    .keyframe-handle {
      background: #2080f0;
      border-color: #fff;
      transform: rotate(45deg) scale(1.2);
    }
  }

  &:hover {
    .keyframe-handle {
      transform: rotate(45deg) scale(1.1);
    }
  }
}

.keyframe-handle {
  width: 10px;
  height: 10px;
  background: #18a058;
  border: 2px solid #fff;
  transform: rotate(45deg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}
</style>
