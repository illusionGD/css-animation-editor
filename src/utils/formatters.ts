/**
 * 格式化数值，添加单位
 */
export function formatValue(value: number | string, unit: string = 'px'): string {
  if (typeof value === 'string') {
    return value
  }
  return `${value}${unit}`
}

/**
 * 解析带单位的数值
 */
export function parseValue(value: string): { num: number; unit: string } {
  const match = value.match(/^([\d.]+)(\w*)$/)
  if (match) {
    return {
      num: parseFloat(match[1]),
      unit: match[2] || 'px'
    }
  }
  return { num: 0, unit: 'px' }
}

/**
 * 格式化时间（毫秒转字符串）
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const remainingMs = Math.floor(ms % 1000)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(3, '0')}`
}

/**
 * 舍入方式类型
 */
export type RoundingMode = 'ceil' | 'round' | 'floor'

/**
 * 根据舍入方式处理数字
 */
function applyRounding(value: number, decimals: number, mode: RoundingMode): number {
  const factor = Math.pow(10, decimals)
  switch (mode) {
    case 'ceil':
      return Math.ceil(value * factor) / factor
    case 'floor':
      return Math.floor(value * factor) / factor
    case 'round':
    default:
      return Math.round(value * factor) / factor
  }
}

/**
 * 格式化数字，保留指定的小数位数
 * @param value 要格式化的数字
 * @param decimals 保留的小数位数，默认为 2
 * @param mode 舍入方式，默认为 'round'
 * @returns 格式化后的字符串
 */
export function formatDecimal(value: number, decimals: number = 2, mode: RoundingMode = 'round'): string {
  const rounded = applyRounding(value, decimals, mode)
  return rounded.toFixed(decimals)
}

/**
 * 格式化数字，保留指定的小数位数，并移除末尾的零
 * @param value 要格式化的数字
 * @param decimals 最大保留的小数位数，默认为 2
 * @param mode 舍入方式，默认为 'round'
 * @returns 格式化后的字符串（移除末尾零）
 */
export function formatDecimalTrim(value: number, decimals: number = 2, mode: RoundingMode = 'round'): string {
  const rounded = applyRounding(value, decimals, mode)
  return parseFloat(rounded.toFixed(decimals)).toString()
}
