/**
 * 动画相关常量
 * 这些常量在多个模块中使用（Animation、Element、Preset 等），需要保证一致性
 */

/** 动画默认时长（毫秒） */
export const ANIMATION_DEFAULT_DURATION = 3000

/** 动画默认延迟（毫秒） */
export const ANIMATION_DEFAULT_DELAY = 0

/** 动画默认迭代次数 */
export const ANIMATION_DEFAULT_ITERATIONS = 1

/** 动画默认方向 */
export const ANIMATION_DEFAULT_DIRECTION = 'normal' as const

/** 动画默认填充模式 */
export const ANIMATION_DEFAULT_FILL_MODE = 'forwards' as const

/** 动画默认缓动函数 */
export const ANIMATION_DEFAULT_EASING = 'ease-in-out'

/** 动画最小时长（毫秒） */
export const ANIMATION_MIN_DURATION = 100

/** 动画最大时长（毫秒） */
export const ANIMATION_MAX_DURATION = 10000

