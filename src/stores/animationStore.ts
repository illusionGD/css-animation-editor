import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Keyframe, AnimationTrack } from '@/types'

export const useAnimationStore = defineStore('animation', () => {
  // 状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(3000) // 默认3秒
  const tracks = ref<AnimationTrack[]>([])
  const selectedElementId = ref<string | null>(null)

  // 计算属性
  const currentProgress = computed(() => {
    return duration.value > 0 ? currentTime.value / duration.value : 0
  })

  // 方法
  function setDuration(newDuration: number) {
    duration.value = Math.max(100, newDuration)
  }

  function addTrack(property: string) {
    if (!tracks.value.find((t) => t.property === property)) {
      tracks.value.push({
        property,
        keyframes: [],
        duration: duration.value
      })
    }
  }

  function removeTrack(property: string) {
    const index = tracks.value.findIndex((t) => t.property === property)
    if (index >= 0) {
      tracks.value.splice(index, 1)
    }
  }

  function addKeyframe(property: string, keyframe: Keyframe) {
    const track = tracks.value.find((t) => t.property === property)
    if (track) {
      track.keyframes.push(keyframe)
      track.keyframes.sort((a, b) => a.time - b.time)
    }
  }

  function removeKeyframe(property: string, keyframeIndex: number) {
    const track = tracks.value.find((t) => t.property === property)
    if (track && keyframeIndex >= 0 && keyframeIndex < track.keyframes.length) {
      track.keyframes.splice(keyframeIndex, 1)
    }
  }

  function updateKeyframe(property: string, keyframeIndex: number, updates: Partial<Keyframe>) {
    const track = tracks.value.find((t) => t.property === property)
    if (track && keyframeIndex >= 0 && keyframeIndex < track.keyframes.length) {
      Object.assign(track.keyframes[keyframeIndex], updates)
      track.keyframes.sort((a, b) => a.time - b.time)
    }
  }

  function play() {
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  function stop() {
    isPlaying.value = false
    currentTime.value = 0
  }

  function seek(time: number) {
    currentTime.value = Math.max(0, Math.min(time, duration.value))
  }

  function setSelectedElement(elementId: string | null) {
    selectedElementId.value = elementId
  }

  return {
    // 状态
    isPlaying,
    currentTime,
    duration,
    tracks,
    selectedElementId,
    // 计算属性
    currentProgress,
    // 方法
    setDuration,
    addTrack,
    removeTrack,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    play,
    pause,
    stop,
    seek,
    setSelectedElement
  }
})
