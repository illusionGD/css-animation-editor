<template>
  <div class="timeline">
    <div class="timeline-header">
      <div class="playback-controls">
        <n-button size="small" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </n-button>
        <n-button size="small" @click="stop">停止</n-button>
      </div>
      <div class="timeline-info">
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      <div class="timeline-settings">
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
    <div class="timeline-content">
      <div class="timeline-tracks">
        <TimelineTrack
          v-for="track in tracks"
          :key="track.property"
          :track="track"
          :current-time="currentTime"
          :duration="duration"
          @add-keyframe="handleAddKeyframe"
          @remove-keyframe="handleRemoveKeyframe"
        />
      </div>
      <div class="timeline-playhead" :style="{ left: `${(currentTime / duration) * 100}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { NButton, NInputNumber } from 'naive-ui'
import { useAnimationStore } from '@/stores/animationStore'
import TimelineTrack from './TimelineTrack.vue'

const animationStore = useAnimationStore()

const isPlaying = computed(() => animationStore.isPlaying)
const currentTime = computed(() => animationStore.currentTime)
const duration = computed({
  get: () => animationStore.duration,
  set: (val) => animationStore.setDuration(val)
})
const tracks = computed(() => animationStore.tracks)

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

function handleAddKeyframe(property: string, time: number, value: any) {
  animationStore.addKeyframe(property, {
    time: time / duration.value,
    value
  })
}

function handleRemoveKeyframe(property: string, index: number) {
  animationStore.removeKeyframe(property, index)
}

onUnmounted(() => {
  stopAnimation()
})
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
  position: relative;
  overflow: auto;
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
  z-index: 10;
}
</style>
