// 基础类型定义

export interface CSSProperties {
  [key: string]: string | number
}

export interface CanvasElement {
  id: string
  type: 'div' | 'span' | 'img' | 'custom'
  style: CSSProperties
  animation: AnimationConfig
  position: { x: number; y: number }
  name?: string
  visible?: boolean
  locked?: boolean
  parentId?: string // 父元素ID，用于构建树形结构
  order?: number // 同级元素的排序顺序
  tracks?: AnimationTrack[] // 动画轨道数组，每个轨道对应一个CSS属性
}

export interface AnimationConfig {
  duration: number
  delay: number
  iterations: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  easing: string
  keyframes: Keyframe[]
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
  elements: CanvasElement[]
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
