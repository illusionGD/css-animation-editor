/**
 * 元素相关常量
 * 这些常量在多个模块中使用（Element、Canvas、PropertyPanel 等），需要保证一致性
 */

import { CSSProperty, CSSPropertyGroup } from "@/types"

/** 元素默认宽度（像素） */
export const ELEMENT_DEFAULT_WIDTH = 100

/** 元素默认高度（像素） */
export const ELEMENT_DEFAULT_HEIGHT = 100

/** 元素最小尺寸（像素）- 调整大小时的限制 */
export const ELEMENT_MIN_SIZE = 20

/** 元素默认 X 坐标（像素） */
export const ELEMENT_DEFAULT_POSITION_X = 0

/** 元素默认 Y 坐标（像素） */
export const ELEMENT_DEFAULT_POSITION_Y = 0

/** 元素默认宽度（带单位，用于 style） */
export const ELEMENT_DEFAULT_WIDTH_PX = '100px'

/** 元素默认高度（带单位，用于 style） */
export const ELEMENT_DEFAULT_HEIGHT_PX = '100px'

/** 解析样式值时的默认值（像素） */
export const PARSE_STYLE_DEFAULT_VALUE = 100

/** 支持的 CSS 属性列表 */
export const SUPPORTED_CSS_PROPERTIES: CSSPropertyGroup[] = [
  {
    label: '变换属性',
    props: 'transform',
    mergeable: true,
    children: [
      { props: 'translateX', label: 'X轴位移', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'translateY', label: 'Y轴位移', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'translateZ', label: 'Z轴位移', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'scaleX', label: 'X轴缩放', type: 'number', unit: '', defaultValue: 1 },
      { props: 'scaleY', label: 'Y轴缩放', type: 'number', unit: '', defaultValue: 1 },
      { props: 'scale', label: '整体缩放', type: 'number', unit: '', defaultValue: 1 },
      { props: 'rotate', label: '旋转', type: 'number', unit: 'deg', defaultValue: 0 },
      { props: 'rotateX', label: 'X轴旋转', type: 'number', unit: 'deg', defaultValue: 0 },
      { props: 'rotateY', label: 'Y轴旋转', type: 'number', unit: 'deg', defaultValue: 0 },
      { props: 'rotateZ', label: 'Z轴旋转', type: 'number', unit: 'deg', defaultValue: 0 },
      { props: 'skewX', label: 'X轴倾斜', type: 'number', unit: 'deg', defaultValue: 0 },
      { props: 'skewY', label: 'Y轴倾斜', type: 'number', unit: 'deg', defaultValue: 0 }
    ]
  },
  {
    label: '尺寸属性',
    props: 'size',
    mergeable: false,
    children: [
      { props: 'width', label: '宽度', type: 'number', unit: 'px', defaultValue: 100 },
      { props: 'height', label: '高度', type: 'number', unit: 'px', defaultValue: 100 }
    ]
  },
  {
    label: '定位属性',
    props: 'position',
    mergeable: false,
    children: [
      { props: 'left', label: '左边距', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'top', label: '上边距', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'right', label: '右边距', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'bottom', label: '下边距', type: 'number', unit: 'px', defaultValue: 0 }
    ]
  },
  {
    label: '边距属性',
    props: 'spacing',
    mergeable: false,
    children: [
      { props: 'marginTop', label: '外边距-上', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'marginRight', label: '外边距-右', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'marginBottom', label: '外边距-下', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'marginLeft', label: '外边距-左', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'paddingTop', label: '内边距-上', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'paddingRight', label: '内边距-右', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'paddingBottom', label: '内边距-下', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'paddingLeft', label: '内边距-左', type: 'number', unit: 'px', defaultValue: 0 }
    ]
  },
  {
    label: '颜色属性',
    props: 'color',
    mergeable: false,
    children: [
      { props: 'opacity', label: '透明度', type: 'number', unit: '', defaultValue: 1 },
      { props: 'backgroundColor', label: '背景色', type: 'color', defaultValue: '#ffffff' },
      { props: 'color', label: '文字颜色', type: 'color', defaultValue: '#000000' },
      { props: 'borderColor', label: '边框颜色', type: 'color', defaultValue: '#000000' }
    ]
  },
  {
    label: '边框属性',
    props: 'border',
    mergeable: false,
    children: [
      { props: 'borderRadius', label: '圆角', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'borderWidth', label: '边框宽度', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'borderTopLeftRadius', label: '左上圆角', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'borderTopRightRadius', label: '右上圆角', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'borderBottomLeftRadius', label: '左下圆角', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'borderBottomRightRadius', label: '右下圆角', type: 'number', unit: 'px', defaultValue: 0 }
    ]
  },
  {
    label: '滤镜效果',
    props: 'filter',
    mergeable: true,
    children: [
      { props: 'blur', label: '模糊', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'brightness', label: '亮度', type: 'number', unit: '', defaultValue: 1 },
      { props: 'contrast', label: '对比度', type: 'number', unit: '', defaultValue: 1 },
      { props: 'saturate', label: '饱和度', type: 'number', unit: '', defaultValue: 1 },
      { props: 'hueRotate', label: '色相旋转', type: 'number', unit: 'deg', defaultValue: 0 },
      { props: 'grayscale', label: '灰度', type: 'number', unit: '', defaultValue: 0 },
      { props: 'sepia', label: '褐色', type: 'number', unit: '', defaultValue: 0 },
      { props: 'invert', label: '反色', type: 'number', unit: '', defaultValue: 0 }
    ]
  },
  {
    label: '文字属性',
    props: 'text',
    mergeable: false,
    children: [
      { props: 'fontSize', label: '字体大小', type: 'number', unit: 'px', defaultValue: 16 },
      { props: 'letterSpacing', label: '字间距', type: 'number', unit: 'px', defaultValue: 0 },
      { props: 'lineHeight', label: '行高', type: 'number', unit: '', defaultValue: 1.2 },
      { props: 'wordSpacing', label: '词间距', type: 'number', unit: 'px', defaultValue: 0 }
    ]
  },
  {
    label: '阴影属性',
    props: 'shadow',
    mergeable: false,
    children: [
      { props: 'boxShadow', label: '盒阴影', type: 'string', defaultValue: 'none' },
      { props: 'textShadow', label: '文字阴影', type: 'string', defaultValue: 'none' }
    ]
  }
]

/** 根据 props 查找 CSS 属性对象 */
export function getCSSPropertyByProps(props: string): CSSProperty | undefined {
  for (const group of SUPPORTED_CSS_PROPERTIES) {
    const found = group.children.find(item => item.props === props)
    if (found) return found
  }
  return undefined
}

/** 根据 label 查找 CSS 属性对象 */
export function getCSSPropertyByLabel(label: string): CSSProperty | undefined {
  for (const group of SUPPORTED_CSS_PROPERTIES) {
    const found = group.children.find(item => item.label === label)
    if (found) return found
  }
  return undefined
}


