/**
 * 时间轴模块专用常量
 * 这些常量只在 Timeline 相关组件中使用，不需要跨模块共享
 */

/** 时间轴基础间隔（毫秒） */
export const TIMELINE_BASE_INTERVAL = 100

/** 时间轴间隔数组（用于刻度显示）- 根据缩放级别动态选择，最小单位 0.1s (100ms) */
export const TIMELINE_INTERVALS = [100, 250, 500, 1000, 2500, 5000, 10000] as const

/** 时间轴默认内容宽度（像素） */
export const TIMELINE_DEFAULT_CONTENT_WIDTH = 1000

/** 时间轴最小时长（毫秒） */
export const TIMELINE_MIN_DURATION = 100

/** 时间轴最大时长（毫秒） */
export const TIMELINE_MAX_DURATION = 10000

/** 时间轴时长步长（毫秒） */
export const TIMELINE_DURATION_STEP = 100

/** 时间轴默认吸附间隔（毫秒） */
export const TIMELINE_DEFAULT_SNAP_INTERVAL = 100

/** 时间轴主刻度倍数（相对于基础间隔） */
export const TIMELINE_MAJOR_INTERVAL_MULTIPLIER = 5
