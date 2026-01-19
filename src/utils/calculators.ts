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
