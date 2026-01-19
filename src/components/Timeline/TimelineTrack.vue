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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-keyframe': [property: string, time: number, value: any]
  'remove-keyframe': [property: string, index: number]
}>()

function handleClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const time = (x / rect.width) * props.duration
  emit('add-keyframe', props.track.property, time, 0)
}

let isDragging = false
let dragIndex = -1
let dragStart = 0

function startDrag(index: number, e: MouseEvent) {
  isDragging = true
  dragIndex = index
  dragStart = e.clientX

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

function handleDrag(e: MouseEvent) {
  if (!isDragging || dragIndex < 0) return
  // TODO: 实现关键帧拖拽
}

function stopDrag() {
  isDragging = false
  dragIndex = -1
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
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
  width: 12px;
  height: 12px;
  background: #18a058;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}
</style>
