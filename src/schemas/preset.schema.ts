import type { PresetSchema, AnimationConfig } from '@/types'

// 默认预设库
export const defaultPresets: PresetSchema[] = [
  {
    id: 'fade-in',
    name: '淡入',
    category: '基础',
    description: '元素淡入效果',
    animation: {
      duration: 1000,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-in-out',
      keyframes: [
        { time: 0, value: 0 },
        { time: 1, value: 1 }
      ]
    },
    tags: ['fade', 'opacity']
  },
  {
    id: 'fade-out',
    name: '淡出',
    category: '基础',
    description: '元素淡出效果',
    animation: {
      duration: 1000,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-in-out',
      keyframes: [
        { time: 0, value: 1 },
        { time: 1, value: 0 }
      ]
    },
    tags: ['fade', 'opacity']
  },
  {
    id: 'slide-in-left',
    name: '从左滑入',
    category: '滑动',
    description: '从左侧滑入',
    animation: {
      duration: 800,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-out',
      keyframes: [
        { time: 0, value: -100 },
        { time: 1, value: 0 }
      ]
    },
    tags: ['slide', 'translate']
  },
  {
    id: 'slide-in-right',
    name: '从右滑入',
    category: '滑动',
    description: '从右侧滑入',
    animation: {
      duration: 800,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-out',
      keyframes: [
        { time: 0, value: 100 },
        { time: 1, value: 0 }
      ]
    },
    tags: ['slide', 'translate']
  },
  {
    id: 'scale-in',
    name: '缩放进入',
    category: '缩放',
    description: '从小到大的缩放效果',
    animation: {
      duration: 600,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-out',
      keyframes: [
        { time: 0, value: 0 },
        { time: 1, value: 1 }
      ]
    },
    tags: ['scale', 'transform']
  },
  {
    id: 'rotate-in',
    name: '旋转进入',
    category: '旋转',
    description: '旋转进入效果',
    animation: {
      duration: 1000,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-out',
      keyframes: [
        { time: 0, value: -180 },
        { time: 1, value: 0 }
      ]
    },
    tags: ['rotate', 'transform']
  },
  {
    id: 'bounce',
    name: '弹跳',
    category: '弹性',
    description: '弹跳效果',
    animation: {
      duration: 1000,
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fillMode: 'both',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      keyframes: [
        { time: 0, value: 0 },
        { time: 0.6, value: 1.2 },
        { time: 1, value: 1 }
      ]
    },
    tags: ['bounce', 'elastic']
  },
  {
    id: 'pulse',
    name: '脉冲',
    category: '效果',
    description: '脉冲动画效果',
    animation: {
      duration: 1500,
      delay: 0,
      iterations: 'infinite',
      direction: 'normal',
      fillMode: 'both',
      easing: 'ease-in-out',
      keyframes: [
        { time: 0, value: 1 },
        { time: 0.5, value: 1.1 },
        { time: 1, value: 1 }
      ]
    },
    tags: ['pulse', 'scale']
  }
]

// 预设分类
export const presetCategories = ['基础', '滑动', '缩放', '旋转', '弹性', '效果']
