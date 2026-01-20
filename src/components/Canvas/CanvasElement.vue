<template>
  <div
    class="canvas-element"
    :class="{ selected: selected }"
    :style="elementStyle"
    @mousedown.stop="handleMouseDown"
    @click.stop="handleClick"
  >
    <div class="element-content">
      <slot>{{ element.type }}</slot>
    </div>
    <div
      v-if="selected"
      class="element-handles"
    >
      <div
        v-for="handle in handles"
        :key="handle"
        class="element-handle"
        :class="`handle-${handle}`"
        @mousedown.stop="startResize(handle, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAnimationStore } from '@/stores/animationStore'
import { useElementStore } from '@/stores/elementStore'
import { interpolateKeyframes, parseStyleValue } from '@/utils/calculators'
import {
  ELEMENT_DEFAULT_WIDTH,
  ELEMENT_DEFAULT_HEIGHT,
  ELEMENT_MIN_SIZE,
  ELEMENT_DEFAULT_WIDTH_PX,
  ELEMENT_DEFAULT_HEIGHT_PX,
  CANVAS_DEFAULT_WIDTH,
  CANVAS_DEFAULT_HEIGHT
} from '@/constants'
import type { CanvasElement as CanvasElementType } from '@/types'

interface Props {
  element: CanvasElementType
  selected: boolean
  canvasZoom?: number
  canvasOffsetX?: number
  canvasOffsetY?: number
  canvasWidth?: number
  canvasHeight?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [elementId: string, multi: boolean]
  update: [elementId: string, updates: Partial<CanvasElementType>]
}>()

const animationStore = useAnimationStore()
const elementStore = useElementStore()

const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, elementX: 0, elementY: 0 })

// 获取元素的宽高（从 style 中读取）
const elementWidth = computed(() => parseStyleValue(props.element.style.width, ELEMENT_DEFAULT_WIDTH))
const elementHeight = computed(() => parseStyleValue(props.element.style.height, ELEMENT_DEFAULT_HEIGHT))

// 计算动画样式（根据当前播放时间应用）
const animationStyle = computed(() => {
  // 如果不在播放状态，不应用动画样式
  if (!animationStore.isPlaying) {
    return {}
  }

  const progress = animationStore.currentProgress
  const style: Record<string, string | number> = {}

  // 遍历当前元素的 tracks，计算当前时间点的属性值（从 elementStore 获取）
  const elementTracks = elementStore.getElementTracks(props.element.id)
  let transformStr = ''
  elementTracks.forEach(track => {
    if (track.keyframes.length > 0) {
      const value = interpolateKeyframes(track.keyframes, progress)
      if (value !== undefined) {
        // 根据属性类型设置样式
        if (
          ['translateX', 'translateY', 'scaleX', 'scaleY', 'rotate', 'skewX', 'skewY'].includes(
            track.property
          )
        ) {
          // Transform 属性需要组合
          const unit =
            track.property === 'rotate' || track.property === 'skewX' || track.property === 'skewY'
              ? 'deg'
              : track.property === 'scaleX' || track.property === 'scaleY'
                ? ''
                : 'px'
          transformStr += `${track.property}(${value}${unit}) `
        } else {
          // 其他属性直接设置
          style[track.property] = typeof value === 'number' ? `${value}px` : String(value)
        }
      }
    }
  })

  // 设置 transform
  if (transformStr) {
    style.transform = transformStr.trim()
  }

  return style
})

const elementStyle = computed(() => {
  // 从 style 中获取宽高，如果没有则使用默认值
  const width = props.element.style.width || ELEMENT_DEFAULT_WIDTH_PX
  const height = props.element.style.height || ELEMENT_DEFAULT_HEIGHT_PX
  
  // 确保宽高是字符串格式（如果是数字则添加 px）
  const widthStr = typeof width === 'number' ? `${width}px` : String(width)
  const heightStr = typeof height === 'number' ? `${height}px` : String(height)
  
  return {
    position: 'absolute' as const,
    left: `${props.element.position.x}px`,
    top: `${props.element.position.y}px`,
    width: widthStr,
    height: heightStr,
    ...props.element.style,
    ...animationStyle.value
  }
})

function handleClick(e: MouseEvent) {
  emit('select', props.element.id, e.ctrlKey || e.metaKey)
}

function handleMouseDown(e: MouseEvent) {
  // 如果点击的是调整大小的手柄，不触发拖拽
  if ((e.target as HTMLElement).classList.contains('element-handle')) {
    return
  }

  emit('select', props.element.id, e.ctrlKey || e.metaKey)

  // 开始拖拽
  isDragging.value = true
  const canvasElement = (e.target as HTMLElement).closest('.canvas') as HTMLElement
  if (!canvasElement) return

  // 先保存拖拽开始时的状态
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    elementX: props.element.position.x,
    elementY: props.element.position.y
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

function handleDrag(e: MouseEvent) {
  if (!isDragging.value) return

  const canvasElement = document.querySelector('.canvas') as HTMLElement
  if (!canvasElement) return

  const rect = canvasElement.getBoundingClientRect()
  const zoom = props.canvasZoom || 1
  const offsetX = props.canvasOffsetX || 0
  const offsetY = props.canvasOffsetY || 0

  // 计算当前鼠标在画布坐标系中的位置
  const currentCanvasX = (e.clientX - rect.left - offsetX) / zoom
  const currentCanvasY = (e.clientY - rect.top - offsetY) / zoom

  // 计算拖拽开始时鼠标在画布坐标系中的位置
  const startCanvasX = (dragStart.value.x - rect.left - offsetX) / zoom
  const startCanvasY = (dragStart.value.y - rect.top - offsetY) / zoom

  // 计算移动距离
  const deltaX = currentCanvasX - startCanvasX
  const deltaY = currentCanvasY - startCanvasY

  // 更新元素位置
  const newX = dragStart.value.elementX + deltaX
  const newY = dragStart.value.elementY + deltaY

  // 限制在画布范围内
  const maxX = (props.canvasWidth || CANVAS_DEFAULT_WIDTH) - elementWidth.value
  const maxY = (props.canvasHeight || CANVAS_DEFAULT_HEIGHT) - elementHeight.value

  emit('update', props.element.id, {
    position: {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }
  })
}

function stopDrag() {
  if (isDragging.value) {
    isDragging.value = false
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
}

function startResize(handle: string, e: MouseEvent) {
  e.stopPropagation()
  isResizing.value = true
  resizeHandle.value = handle
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: elementWidth.value,
    height: elementHeight.value
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e: MouseEvent) {
  if (!isResizing.value || !resizeHandle.value) return

  // 获取canvas的缩放比例
  const canvasElement = (e.target as HTMLElement).closest('.canvas') as HTMLElement
  let zoom = 1
  if (canvasElement) {
    const transform = getComputedStyle(canvasElement).transform
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/)
      if (matrix) {
        const values = matrix[1].split(',').map(parseFloat)
        zoom = values[0] || 1
      }
    }
  }

  const deltaX = (e.clientX - resizeStart.value.x) / zoom
  const deltaY = (e.clientY - resizeStart.value.y) / zoom

  const updates: Partial<CanvasElementType> = {
    style: { ...props.element.style }
  }

  if (resizeHandle.value.includes('e')) {
    const newWidth = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.width + deltaX)
    updates.style!.width = `${newWidth}px`
  }
  if (resizeHandle.value.includes('w')) {
    const newWidth = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.width - deltaX)
    updates.style!.width = `${newWidth}px`
    updates.position = { ...props.element.position, x: props.element.position.x + deltaX }
  }
  if (resizeHandle.value.includes('s')) {
    const newHeight = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.height + deltaY)
    updates.style!.height = `${newHeight}px`
  }
  if (resizeHandle.value.includes('n')) {
    const newHeight = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.height - deltaY)
    updates.style!.height = `${newHeight}px`
    updates.position = { ...props.element.position, y: props.element.position.y + deltaY }
  }

  emit('update', props.element.id, updates)
}

function stopResize() {
  isResizing.value = false
  resizeHandle.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style lang="scss" scoped>
.canvas-element {
  position: absolute;
  border: 2px solid transparent;
  cursor: move;

  &.selected {
    border-color: #18a058;
    box-shadow: 0 0 0 1px #18a058;
  }
}

.element-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(24, 160, 88, 0.1);
  border: 1px dashed #18a058;
}

.element-handles {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  pointer-events: none;
}

.element-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #18a058;
  border: 1px solid #fff;
  pointer-events: all;
  cursor: nwse-resize;

  &.handle-nw {
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }

  &.handle-ne {
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }

  &.handle-sw {
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }

  &.handle-se {
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
  }

  &.handle-n {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  &.handle-s {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    cursor: ns-resize;
  }

  &.handle-e {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: ew-resize;
  }

  &.handle-w {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: ew-resize;
  }
}
</style>
