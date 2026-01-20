/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 计算两点之间的距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * 根据关键帧计算当前时间点的属性值
 * @param keyframes 关键帧数组（已按时间排序）
 * @param currentTime 当前时间（0-1 相对时间）
 * @returns 插值后的值
 */
export function interpolateKeyframes(
  keyframes: Array<{ time: number; value: number | string }>,
  currentTime: number
): number | string | undefined {
  if (keyframes.length === 0) return undefined

  // 如果当前时间小于第一个关键帧，返回第一个关键帧的值
  if (currentTime <= keyframes[0].time) {
    return keyframes[0].value
  }

  // 如果当前时间大于最后一个关键帧，返回最后一个关键帧的值
  if (currentTime >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value
  }

  // 找到当前时间所在的两个关键帧之间
  for (let i = 0; i < keyframes.length - 1; i++) {
    const kf1 = keyframes[i]
    const kf2 = keyframes[i + 1]

    if (currentTime >= kf1.time && currentTime <= kf2.time) {
      // 计算插值比例
      const t = (currentTime - kf1.time) / (kf2.time - kf1.time)

      // 如果两个值都是数字，进行线性插值
      if (typeof kf1.value === 'number' && typeof kf2.value === 'number') {
        return lerp(kf1.value, kf2.value, t)
      }

      // 如果值类型不同或不是数字，返回前一个关键帧的值
      return kf1.value
    }
  }

  return undefined
}

/**
 * 限制值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 将像素坐标转换为时间
 */
export function pixelToTime(pixel: number, width: number, duration: number): number {
  return (pixel / width) * duration
}

/**
 * 将时间转换为像素坐标
 */
export function timeToPixel(time: number, width: number, duration: number): number {
  return (time / duration) * width
}

/**
 * 从 CSS 样式值中解析数值（支持 "100px"、"100" 或数字格式）
 * @param value CSS 样式值（可能是字符串如 "100px"、"100" 或数字）
 * @param defaultValue 如果解析失败时返回的默认值
 * @returns 解析后的数值
 */
export function parseStyleValue(value: string | number | undefined, defaultValue: number): number {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'number') return value
  const num = parseFloat(String(value))
  return isNaN(num) ? defaultValue : num
}
