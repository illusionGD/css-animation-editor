import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRafFn } from '@vueuse/core'

/**
 * 关键帧接口定义
 * @interface Keyframe
 */
export interface Keyframe {
  /** 唯一标识符 */
  id: string
  /** 偏移量，表示动画进度 (0.0 - 1.0) */
  offset: number 
  /** 属性集合，目前仅支持数字类型的值以便于插值计算 */
  props: Record<string, number> 
}

/**
 * 动画编辑器核心 Store
 * 负责管理时间轴、关键帧数据以及实时样式的计算
 */
export const useAnimationStore = defineStore('animation', () => {
  // --- State (状态) ---
  
  /** 动画总时长 (毫秒) */
  const duration = ref(2000) 
  
  /** 当前播放时间 (毫秒) */
  const currentTime = ref(0) 
  
  /** 是否正在播放 */
  const isPlaying = ref(false)
  
  /** 
   * 关键帧列表
   * 初始化包含起始(0%)、中间(50%)和结束(100%)三个关键帧作为示例
   */
  const keyframes = ref<Keyframe[]>([
    { id: 'start', offset: 0, props: { opacity: 100, scale: 100, rotate: 0 } },
    { id: 'mid', offset: 0.5, props: { opacity: 80, scale: 120, rotate: 180 } },
    { id: 'end', offset: 1, props: { opacity: 50, scale: 150, rotate: 360 } }
  ])
  
  /** 当前选中的关键帧 ID */
  const selectedKeyframeId = ref<string | null>(null)

  // --- Actions (动作) ---

  /** 切换播放/暂停状态 */
  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  /**
   * 跳转到指定时间
   * @param time 目标时间 (ms)
   */
  const setTime = (time: number) => {
    // 限制时间在 0 到 duration 之间
    currentTime.value = Math.max(0, Math.min(time, duration.value))
  }

  // --- Animation Loop (动画循环) ---
  
  // 使用 VueUse 的 useRafFn 创建 requestAnimationFrame 循环
  const { pause, resume } = useRafFn(({ delta }) => {
    if (!isPlaying.value) return
    
    // 累加时间增量
    let nextTime = currentTime.value + delta
    
    // 循环播放逻辑：如果超过总时长，重置回 0
    if (nextTime > duration.value) {
      nextTime = 0 
    }
    currentTime.value = nextTime
  }, { immediate: false })

  // 监听播放状态，控制 Raf 循环的启停
  watch(isPlaying, (v) => {
    if (v) resume()
    else pause()
  })

  // --- Getters (计算属性) ---

  /**
   * 计算当前时间点对应的样式对象
   * 核心逻辑：找到当前时间前后的关键帧，进行线性插值
   */
  const currentStyle = computed(() => {
    // 计算当前进度百分比 (0.0 - 1.0)
    const progress = currentTime.value / duration.value
    
    // 确保关键帧按 offset 排序
    const sorted = [...keyframes.value].sort((a, b) => a.offset - b.offset)
    
    // 寻找区间：prev (前一个关键帧) 和 next (后一个关键帧)
    let prev = sorted[0]
    let next = sorted[sorted.length - 1]
    
    for (let i = 0; i < sorted.length - 1; i++) {
      // 如果当前进度在两个关键帧之间
      if (progress >= sorted[i].offset && progress <= sorted[i+1].offset) {
        prev = sorted[i]
        next = sorted[i+1]
        break
      }
    }

    // 处理边界情况：如果进度小于第一个或大于最后一个
    if (progress < sorted[0].offset) {
       prev = sorted[0]; next = sorted[0]
    }
    if (progress > sorted[sorted.length-1].offset) {
       prev = sorted[sorted.length-1]; next = sorted[sorted.length-1]
    }

    // 计算区间内的相对进度 t (0.0 - 1.0)
    const range = next.offset - prev.offset
    const t = range === 0 ? 0 : (progress - prev.offset) / range
    
    const result: Record<string, string> = {}
    let transformString = ''
    
    // 需要插值的属性列表
    const propKeys = ['opacity', 'scale', 'rotate']
    
    propKeys.forEach(key => {
      // 获取属性值，如果没有定义则使用默认值
      const startVal = prev.props[key] ?? (key === 'scale' ? 100 : 0)
      const endVal = next.props[key] ?? (key === 'scale' ? 100 : 0)
      
      // 线性插值公式: start + (end - start) * t
      const currentVal = startVal + (endVal - startVal) * t
      
      // 根据属性类型生成 CSS 字符串
      if (key === 'opacity') {
        result.opacity = String(currentVal / 100)
      } else if (key === 'rotate') {
        transformString += `rotate(${currentVal}deg) `
      } else if (key === 'scale') {
        transformString += `scale(${currentVal / 100}) `
      }
    })
    
    // 合并 transform 属性
    if (transformString) {
      result.transform = transformString.trim()
    }
    
    return result
  })

  /**
   * 生成最终的 CSS 代码字符串
   * 包含 @keyframes 规则和 .target 类定义
   */
  const cssCode = computed(() => {
    // 1. 生成 @keyframes
    const sorted = [...keyframes.value].sort((a, b) => a.offset - b.offset)
    
    const keyframeRules = sorted.map(kf => {
      const percentage = Math.round(kf.offset * 100) + '%'
      
      // 简单合并 transform (如果同时存在 scale 和 rotate，需要合并在同一个 transform 属性中)
      let transform = ''
      let otherProps = ''
      
      if (kf.props.rotate !== undefined) transform += `rotate(${kf.props.rotate}deg) `
      if (kf.props.scale !== undefined) transform += `scale(${kf.props.scale / 100}) `
      
      if (kf.props.opacity !== undefined) otherProps += `opacity: ${kf.props.opacity / 100}; `
      
      return `  ${percentage} { ${otherProps}${transform ? `transform: ${transform.trim()};` : ''} }`
    }).join('\n')

    const keyframesCss = `@keyframes my-animation {\n${keyframeRules}\n}`

    // 2. 生成 usage class
    const durationSec = (duration.value / 1000).toFixed(2) + 's'
    const usageCss = `.target {\n  animation: my-animation ${durationSec} linear infinite;\n}`

    return `${keyframesCss}\n\n${usageCss}`
  })

  return {
    duration,
    currentTime,
    cssCode, // 导出 CSS 代码
    isPlaying,
    keyframes,
    selectedKeyframeId,
    togglePlay,
    setTime,
    currentStyle
  }
})
