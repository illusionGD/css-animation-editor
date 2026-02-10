import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AnimationTrack, Keyframe } from '@/types'
import { useElementStore } from './elementStore'
import { ANIMATION_DEFAULT_DURATION, ANIMATION_MIN_DURATION } from '@/constants'

export const useAnimationStore = defineStore('animation', () => {
  // 状态
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(ANIMATION_DEFAULT_DURATION)
  // 选中的关键帧：{ property: string, keyframeIndex: number } | null
  const selectedKeyframe = ref<{ property: string; keyframeIndex: number } | null>(null)

  // 获取 elementStore
  const elementStore = useElementStore()

  const animationConfig = computed(() => {
    return elementStore.selectedElements[0].animation 
  })

  // 计算属性：当前选中元素的tracks（从 elementStore 获取）
  const tracks = computed(() => {
    if (elementStore.selectedElements.length === 0) {
        return []
    }
    return elementStore.selectedElements[0].animation.tracks
  })

  const currentProgress = computed(() => {
    return duration.value > 0 ? currentTime.value / duration.value : 0
  })

  // 方法
  function setDuration(newDuration: number) {
    duration.value = Math.max(ANIMATION_MIN_DURATION, newDuration)
  }

  // ========== 动画轨道管理（业务逻辑） ==========
  /**
   * 添加动画轨道
   */
  function addTrack(property: string) {
    const currentElement = elementStore.selectedElements[0]
    if (!currentElement) {
        return
    }
    const frames = currentElement.animation.tracks

    const defaultVal = currentElement.style[property]
    frames.push({
      property,
      keyframes: [
        {
            time: 0,
            value: defaultVal
        }
      ],
      duration: duration.value
    })
    const newAnimation = {
        ...currentElement.animation,
        keyframes: frames
    }
    elementStore.updateElement(currentElement.id, {
        animation: newAnimation
    })
  }

  /**
   * 删除动画轨道
   */
  function removeTrack(property: string) {
    const currentElement = elementStore.selectedElements[0]
    if (!currentElement) {
        return
    }
    const frames = currentElement.animation.tracks.filter(track => track.property !== property)
    const newAnimation = {
        ...currentElement.animation,
        tracks: frames
    }
    elementStore.updateElement(currentElement.id, {
        animation: newAnimation
    })
  }

  /**
   * 添加关键帧
   */
  function addKeyframe(property: string, keyframe: Keyframe) {

  }

  /**
   * 删除关键帧
   */
  function removeKeyframe(property: string, keyframeIndex: number) {}

  /**
   * 更新关键帧
   */
  function updateKeyframe(property: string, keyframeIndex: number, updates: Partial<Keyframe>) {}

  /**
   * 更新轨道时长
   */
  function updateTrackDuration(property: string, newDuration: number) {}

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
  function getElementTracks(elementId: string) {}

  /**
   * 设置选中的关键帧
   */
  function setSelectedKeyframe(property: string | null, keyframeIndex: number | null) {}

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
    selectedKeyframe,
    // 计算属性
    currentProgress,
    animationConfig,
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
    getElementTracks,
    setSelectedKeyframe,
    clearSelectedKeyframe
  }
})
