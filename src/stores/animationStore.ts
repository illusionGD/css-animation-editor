import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Keyframe, AnimationTrack } from '@/types'

export const useAnimationStore = defineStore('animation', () => {
  // 状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(3000) // 默认3秒
  // 按元素ID存储tracks: elementId -> tracks[]
  const elementTracks = ref<Record<string, AnimationTrack[]>>({})
  const selectedElementId = ref<string | null>(null)

  // 计算属性：当前选中元素的tracks
  const tracks = computed(() => {
    if (!selectedElementId.value) {
      return []
    }
    return elementTracks.value[selectedElementId.value] || []
  })

  const currentProgress = computed(() => {
    return duration.value > 0 ? currentTime.value / duration.value : 0
  })

  // 方法
  function setDuration(newDuration: number) {
    duration.value = Math.max(100, newDuration)
    // 更新所有tracks的duration
    Object.values(elementTracks.value).forEach(tracks => {
      tracks.forEach(track => {
        track.duration = duration.value
      })
    })
  }

  function setSelectedElement(elementId: string | null) {
    // 如果切换元素，初始化该元素的tracks（如果不存在）
    if (elementId && !elementTracks.value[elementId]) {
      elementTracks.value[elementId] = []
    }
    selectedElementId.value = elementId
  }

  function addTrack(property: string) {
    if (!selectedElementId.value) return
    const elementId = selectedElementId.value
    if (!elementTracks.value[elementId]) {
      elementTracks.value[elementId] = []
    }
    if (!elementTracks.value[elementId].find(t => t.property === property)) {
      elementTracks.value[elementId].push({
        property,
        keyframes: [],
        duration: duration.value
      })
    }
  }

  function removeTrack(property: string) {
    if (!selectedElementId.value) return
    const elementId = selectedElementId.value
    const tracks = elementTracks.value[elementId]
    if (!tracks) return
    const index = tracks.findIndex(t => t.property === property)
    if (index >= 0) {
      tracks.splice(index, 1)
    }
  }

  function addKeyframe(property: string, keyframe: Keyframe) {
    if (!selectedElementId.value) return
    const elementId = selectedElementId.value
    const tracks = elementTracks.value[elementId]
    if (!tracks) return
    const track = tracks.find(t => t.property === property)
    if (track) {
      track.keyframes.push(keyframe)
      track.keyframes.sort((a, b) => a.time - b.time)
    }
  }

  function removeKeyframe(property: string, keyframeIndex: number) {
    if (!selectedElementId.value) return
    const elementId = selectedElementId.value
    const tracks = elementTracks.value[elementId]
    if (!tracks) return
    const track = tracks.find(t => t.property === property)
    if (track && keyframeIndex >= 0 && keyframeIndex < track.keyframes.length) {
      track.keyframes.splice(keyframeIndex, 1)
    }
  }

  function updateKeyframe(property: string, keyframeIndex: number, updates: Partial<Keyframe>) {
    if (!selectedElementId.value) return
    const elementId = selectedElementId.value
    const tracks = elementTracks.value[elementId]
    if (!tracks) return
    const track = tracks.find(t => t.property === property)
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

  // 获取指定元素的tracks（用于动画预览）
  function getElementTracks(elementId: string): AnimationTrack[] {
    return elementTracks.value[elementId] || []
  }

  return {
    // 状态
    isPlaying,
    currentTime,
    duration,
    tracks,
    selectedElementId,
    elementTracks,
    // 计算属性
    currentProgress,
    // 方法
    setDuration,
    setSelectedElement,
    addTrack,
    removeTrack,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    play,
    pause,
    stop,
    seek,
    getElementTracks
  }
})
