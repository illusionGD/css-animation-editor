// 基础类型定义

export interface CSSProperties {
  [key: string]: string | number
}

export interface ElementType {
  id: string
  type: 'div' | 'span' | 'img' | 'custom'
  style: CSSProperties
  animation: AnimationConfig
  name: string
  /** 层级 */
  level: number
  order: number // 同级元素的排序顺序
  visible?: boolean
  locked?: boolean
  parentId?: string // 父元素ID，用于构建树形结构
}

export interface AnimationConfig {
  duration: number
  delay: number
  iterations: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  easing: string
  tracks: AnimationTrack[]
}

export interface Keyframe {
  time: number // 0-1 相对时间
  value: number | string
  easing?: BezierCurve
}

export interface BezierCurve {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface AnimationTrack {
  property: string
  keyframes: Keyframe[]
  duration: number
}

export interface TreeNode {
  id: string
  name: string
  type: 'element' | 'group' | 'folder'
  elementId?: string
  children?: TreeNode[]
  expanded?: boolean
  icon?: string
  visible?: boolean
  locked?: boolean
}

export interface PresetSchema {
  id: string
  name: string
  category: string
  description?: string
  animation: AnimationConfig
  preview?: string
  tags?: string[]
}

export interface Project {
  id: string
  name: string
  description?: string
  thumbnail?: string
  createdAt: number
  updatedAt: number
  createdBy?: string
  updatedBy?: string
  version: number
  data: ProjectData
  collaborators?: string[]
}

export interface ProjectData {
  elements: ElementType[]
  animations: AnimationConfig[]
  settings: ProjectSettings
}

export interface ProjectSettings {
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  gridSize: number
  showGrid: boolean
  showRuler: boolean
}

export interface Change {
  id: string
  type: 'create' | 'update' | 'delete'
  target: string
  value: any
  timestamp: number
  userId?: string
}

/** CSS 属性子项类型 */
export interface CSSProperty {
  /** 属性名 */
  props: string
  /** 中文名称 */
  label: string
  /** 属性值类型 */
  type:  'number' | 'color' | 'string' | 'percentage'
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
}

/** CSS 属性分组类型 */
export interface CSSPropertyGroup {
  /** 分组标签 */
  label: string
  /** 分组属性名 */
  props: string
  /** 是否可以合并书写 */
  mergeable: boolean
  /** 子属性列表 */
  children: CSSProperty[]
}
