/**
 * 可动画的CSS属性配置
 * 定义每个属性的类型、单位、标签等信息
 */

export type PropertyInputType = 'number' | 'color' | 'string' | 'percentage'

export interface AnimatableProperty {
  /** 属性名（CSS属性名，如 translateX, opacity） */
  name: string
  /** 显示标签 */
  label: string
  /** 输入类型 */
  type: PropertyInputType
  /** 单位（如 px, deg, %） */
  unit?: string
  /** 默认值 */
  defaultValue?: number | string
  /** 最小值（仅数字类型） */
  min?: number
  /** 最大值（仅数字类型） */
  max?: number
  /** 步长（仅数字类型） */
  step?: number
  /** 所属分组 */
  group: string
}

/**
 * 所有可动画属性的配置
 */
export const ANIMATABLE_PROPERTIES: AnimatableProperty[] = [
  // Transform 属性
  {
    name: 'translateX',
    label: 'X轴位移',
    type: 'number',
    unit: 'px',
    defaultValue: 0,
    group: 'Transform'
  },
  {
    name: 'translateY',
    label: 'Y轴位移',
    type: 'number',
    unit: 'px',
    defaultValue: 0,
    group: 'Transform'
  },
  {
    name: 'scaleX',
    label: 'X轴缩放',
    type: 'number',
    unit: '',
    defaultValue: 1,
    min: 0,
    step: 0.1,
    group: 'Transform'
  },
  {
    name: 'scaleY',
    label: 'Y轴缩放',
    type: 'number',
    unit: '',
    defaultValue: 1,
    min: 0,
    step: 0.1,
    group: 'Transform'
  },
  {
    name: 'rotate',
    label: '旋转',
    type: 'number',
    unit: 'deg',
    defaultValue: 0,
    step: 1,
    group: 'Transform'
  },
  {
    name: 'skewX',
    label: 'X轴倾斜',
    type: 'number',
    unit: 'deg',
    defaultValue: 0,
    step: 1,
    group: 'Transform'
  },
  {
    name: 'skewY',
    label: 'Y轴倾斜',
    type: 'number',
    unit: 'deg',
    defaultValue: 0,
    step: 1,
    group: 'Transform'
  },
  // Layout 属性
  {
    name: 'width',
    label: '宽度',
    type: 'number',
    unit: 'px',
    defaultValue: 100,
    min: 0,
    step: 1,
    group: 'Layout'
  },
  {
    name: 'height',
    label: '高度',
    type: 'number',
    unit: 'px',
    defaultValue: 100,
    min: 0,
    step: 1,
    group: 'Layout'
  },
  // Color 属性
  {
    name: 'color',
    label: '文字颜色',
    type: 'color',
    defaultValue: '#000000',
    group: 'Color'
  },
  {
    name: 'backgroundColor',
    label: '背景颜色',
    type: 'color',
    defaultValue: '#ffffff',
    group: 'Color'
  },
  {
    name: 'borderColor',
    label: '边框颜色',
    type: 'color',
    defaultValue: '#000000',
    group: 'Color'
  },
  // Effects 属性
  {
    name: 'opacity',
    label: '透明度',
    type: 'number',
    unit: '',
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.01,
    group: 'Effects'
  },
  {
    name: 'borderRadius',
    label: '圆角',
    type: 'number',
    unit: 'px',
    defaultValue: 0,
    min: 0,
    step: 1,
    group: 'Effects'
  },
  {
    name: 'boxShadow',
    label: '阴影',
    type: 'string',
    defaultValue: 'none',
    group: 'Effects'
  },
  {
    name: 'filter',
    label: '滤镜',
    type: 'string',
    defaultValue: 'none',
    group: 'Effects'
  }
]

/**
 * 根据属性名获取属性配置
 */
export function getPropertyConfig(propertyName: string): AnimatableProperty | undefined {
  return ANIMATABLE_PROPERTIES.find(p => p.name === propertyName)
}

/**
 * 根据分组获取属性列表
 */
export function getPropertiesByGroup(group: string): AnimatableProperty[] {
  return ANIMATABLE_PROPERTIES.filter(p => p.group === group)
}

/**
 * 获取所有分组
 */
export function getPropertyGroups(): string[] {
  const groups = new Set(ANIMATABLE_PROPERTIES.map(p => p.group))
  return Array.from(groups)
}

/**
 * 检查属性是否可动画
 */
export function isAnimatableProperty(propertyName: string): boolean {
  return ANIMATABLE_PROPERTIES.some(p => p.name === propertyName)
}
