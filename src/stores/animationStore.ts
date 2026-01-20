import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AnimationTrack, Keyframe } from '@/types'
import { useElementStore } from './elementStore'
import { ANIMATION_UI_DEFAULT_DURATION, ANIMATION_MIN_DURATION } from '@/constants'

export const useAnimationStore = defineStore('animation', () => {
  // 状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(ANIMATION_UI_DEFAULT_DURATION)
  const selectedElementId = ref<string | null>(null)
  // 选中的关键帧：{ property: string, keyframeIndex: number } | null
  const selectedKeyframe = ref<{ property: string; keyframeIndex: number } | null>(null)

  // 获取 elementStore
  const elementStore = useElementStore()

  // 计算属性：当前选中元素的tracks（从 elementStore 获取）
  const tracks = computed(() => {
    if (!selectedElementId.value) {
      return []
    }
    return elementStore.getElementTracks(selectedElementId.value)
  })

  const currentProgress = computed(() => {
    return duration.value > 0 ? currentTime.value / duration.value : 0
  })

  // 方法
  function setDuration(newDuration: number) {
    duration.value = Math.max(ANIMATION_MIN_DURATION, newDuration)
  }

  function setSelectedElement(elementId: string | null) {
    selectedElementId.value = elementId
  }

  // ========== 动画轨道管理（业务逻辑） ==========

  /**
   * 添加动画轨道
   */
  function addTrack(property: string) {
    if (!selectedElementId.value) return

    const element = elementStore.getElement(selectedElementId.value)
    if (!element) return

    const tracks = element.tracks || []
    // 检查是否已存在该属性的轨道
    if (tracks.find(t => t.property === property)) {
      return
    }

    const newTrack: AnimationTrack = {
      property,
      keyframes: [],
      duration: duration.value
    }

    // 通过 elementStore 更新元素数据
    elementStore.updateElement(selectedElementId.value, {
      tracks: [...tracks, newTrack]
    })
  }

  /**
   * 删除动画轨道
   */
  function removeTrack(property: string) {
    if (!selectedElementId.value) return

    const element = elementStore.getElement(selectedElementId.value)
    if (!element) return

    const tracks = element.tracks || []
    const filteredTracks = tracks.filter(t => t.property !== property)

    elementStore.updateElement(selectedElementId.value, {
      tracks: filteredTracks
    })
  }

  /**
   * 添加关键帧
   */
  function addKeyframe(property: string, keyframe: Keyframe) {
    if (!selectedElementId.value) return

    const element = elementStore.getElement(selectedElementId.value)
    if (!element) return

    const tracks = element.tracks || []
    const track = tracks.find(t => t.property === property)
    if (!track) return

    const newKeyframes = [...track.keyframes, keyframe]
    newKeyframes.sort((a, b) => a.time - b.time)

    const updatedTracks = tracks.map(t =>
      t.property === property ? { ...t, keyframes: newKeyframes } : t
    )

    elementStore.updateElement(selectedElementId.value, {
      tracks: updatedTracks
    })
  }

  /**
   * 删除关键帧
   */
  function removeKeyframe(property: string, keyframeIndex: number) {
    if (!selectedElementId.value) return

    const element = elementStore.getElement(selectedElementId.value)
    if (!element) return

    const tracks = element.tracks || []
    const track = tracks.find(t => t.property === property)
    if (!track || keyframeIndex < 0 || keyframeIndex >= track.keyframes.length) return

    const newKeyframes = track.keyframes.filter((_, index) => index !== keyframeIndex)
    const updatedTracks = tracks.map(t =>
      t.property === property ? { ...t, keyframes: newKeyframes } : t
    )

    elementStore.updateElement(selectedElementId.value, {
      tracks: updatedTracks
    })
  }

  /**
   * 更新关键帧
   */
  function updateKeyframe(property: string, keyframeIndex: number, updates: Partial<Keyframe>) {
    if (!selectedElementId.value) return

    const element = elementStore.getElement(selectedElementId.value)
    if (!element) return

    const tracks = element.tracks || []
    const track = tracks.find(t => t.property === property)
    if (!track || keyframeIndex < 0 || keyframeIndex >= track.keyframes.length) return

    const newKeyframes = track.keyframes.map((kf, index) =>
      index === keyframeIndex ? { ...kf, ...updates } : kf
    )
    newKeyframes.sort((a, b) => a.time - b.time)

    const updatedTracks = tracks.map(t =>
      t.property === property ? { ...t, keyframes: newKeyframes } : t
    )

    elementStore.updateElement(selectedElementId.value, {
      tracks: updatedTracks
    })
  }

  /**
   * 更新轨道时长
   */
  function updateTrackDuration(property: string, newDuration: number) {
    if (!selectedElementId.value) return

    const element = elementStore.getElement(selectedElementId.value)
    if (!element) return

    const tracks = element.tracks || []
    const updatedTracks = tracks.map(t =>
      t.property === property ? { ...t, duration: newDuration } : t
    )

    elementStore.updateElement(selectedElementId.value, {
      tracks: updatedTracks
    })
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

  // 获取指定元素的tracks（用于动画预览，从 elementStore 获取）
  function getElementTracks(elementId: string): AnimationTrack[] {
    return elementStore.getElementTracks(elementId)
  }

  /**
   * 设置选中的关键帧
   */
  function setSelectedKeyframe(property: string | null, keyframeIndex: number | null) {
    if (property !== null && keyframeIndex !== null) {
      selectedKeyframe.value = { property, keyframeIndex }
    } else {
      selectedKeyframe.value = null
    }
  }

  /**
   * 清除选中的关键帧
   */
  function clearSelectedKeyframe() {
    selectedKeyframe.value = null
  }

  return {
    // 状态
    isPlaying,
    currentTime,
    duration,
    tracks,
    selectedElementId,
    selectedKeyframe,
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
    getElementTracks,
    setSelectedKeyframe,
    clearSelectedKeyframe
  }
})
