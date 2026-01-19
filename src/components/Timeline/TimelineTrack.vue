<template>
  <div class="timeline-track">
    <div class="track-label">{{ track.property }}</div>
    <div class="track-content" @click="handleClick">
      <div
        v-for="(keyframe, index) in track.keyframes"
        :key="index"
        class="keyframe"
        :style="{ left: `${keyframe.time * 100}%` }"
        @mousedown.stop="startDrag(index, $event)"
        @dblclick.stop="handleKeyframeDoubleClick(index, $event)"
        @contextmenu.stop="handleKeyframeContextMenu(index, $event)"
      >
        <div class="keyframe-handle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import type { AnimationTrack } from '@/types'

interface Props {
  track: AnimationTrack
  currentTime: number
  duration: number
  snapEnabled?: boolean
  snapInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  snapEnabled: false,
  snapInterval: 100
})

const emit = defineEmits<{
  'add-keyframe': [property: string, time: number, value: any]
  'remove-keyframe': [property: string, index: number]
  'update-keyframe-time': [property: string, index: number, time: number]
  'edit-keyframe-value': [property: string, index: number]
}>()

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
let dragStartX = 0
let dragStartTime = 0

function startDrag(index: number, e: MouseEvent) {
  e.stopPropagation()
  isDragging = true
  dragIndex = index
  dragStartX = e.clientX
  dragStartTime = props.track.keyframes[index].time

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

function handleDrag(e: MouseEvent) {
  if (!isDragging || dragIndex < 0) return

  const trackContent = (e.target as HTMLElement).closest('.track-content') as HTMLElement
  if (!trackContent) return

  const rect = trackContent.getBoundingClientRect()
  const x = e.clientX - rect.left
  // 计算新的相对时间（0-1）
  let newTime = Math.max(0, Math.min(1, x / rect.width))

  // 如果启用吸附，对齐到网格
  if (props.snapEnabled && props.snapInterval) {
    const timeMs = newTime * props.duration
    const snappedTimeMs = Math.round(timeMs / props.snapInterval) * props.snapInterval
    newTime = Math.max(0, Math.min(1, snappedTimeMs / props.duration))
  }

  // 更新关键帧时间
  emit('update-keyframe-time', props.track.property, dragIndex, newTime)
}

function stopDrag() {
  if (isDragging) {
    isDragging = false
    dragIndex = -1
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
}

onUnmounted(() => {
  stopDrag()
})
</script>

<style lang="scss" scoped>
.timeline-track {
  display: flex;
  height: 40px;
  border-bottom: 1px solid var(--n-borderColor);
}

.track-label {
  width: 120px;
  padding: 8px;
  font-size: 12px;
  border-right: 1px solid var(--n-borderColor);
  display: flex;
  align-items: center;
}

.track-content {
  flex: 1;
  position: relative;
  cursor: pointer;
}

.keyframe {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;

  &:active {
    cursor: grabbing;
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
