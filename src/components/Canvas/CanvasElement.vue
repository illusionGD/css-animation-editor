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
    <div v-if="selected" class="element-handles">
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


// 获取元素的宽高（从 style 中读取）
const elementWidth = computed(() =>
  parseStyleValue(props.element.style.width, ELEMENT_DEFAULT_WIDTH)
)
const elementHeight = computed(() =>
  parseStyleValue(props.element.style.height, ELEMENT_DEFAULT_HEIGHT)
)

const elementStyle = computed(() => {
  // 从 style 中获取宽高，如果没有则使用默认值
  const width = props.element.style.width || ELEMENT_DEFAULT_WIDTH_PX
  const height = props.element.style.height || ELEMENT_DEFAULT_HEIGHT_PX

  // 确保宽高是字符串格式（如果是数字则添加 px）
  const widthStr = typeof width === 'number' ? `${width}px` : String(width)
  const heightStr = typeof height === 'number' ? `${height}px` : String(height)
  const style = {
    ...props.element.style,
    position: 'absolute' as const,
    left: `${props.element.position.x}px`,
    top: `${props.element.position.y}px`,
    width: widthStr,
    height: heightStr
  }
  return style
})

function handleClick(e: MouseEvent) {
  emit('select', props.element.id, e.ctrlKey || e.metaKey)
}

//#region 拖拽逻辑
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, elementX: 0, elementY: 0 })

function handleMouseDown(e: MouseEvent) {
  // 如果点击的是调整大小的手柄，不触发拖拽
  if (isResizing.value) {
    return
  }

  emit('select', props.element.id, e.ctrlKey || e.metaKey)

  // 开始拖拽
  isDragging.value = true
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
  if (!isDragging.value || isResizing.value) return

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
//#endregion

//#region 调整大小逻辑
const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 })

function startResize(handle: string, e: MouseEvent) {
  e.stopPropagation()
  isResizing.value = true
  resizeHandle.value = handle
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: elementWidth.value,
    height: elementHeight.value,
    elementX: props.element.position.x,
    elementY: props.element.position.y
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e: MouseEvent) {
  if (!isResizing.value || !resizeHandle.value) return

  // 使用传入的画布缩放比例（与拖拽逻辑保持一致）
  const zoom = props.canvasZoom || 1

  const deltaX = (e.clientX - resizeStart.value.x) / zoom
  const deltaY = (e.clientY - resizeStart.value.y) / zoom

  const updates: Partial<CanvasElementType> = {
    style: { ...props.element.style }
  }

  const newPosition = {
    x: resizeStart.value.elementX,
    y: resizeStart.value.elementY
  }

  if (resizeHandle.value.includes('e')) {
    const newWidth = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.width + deltaX)
    updates.style!.width = `${newWidth}px`
  }

  if (resizeHandle.value.includes('w')) {
    const newWidth = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.width - deltaX)
    const actualDeltaX = resizeStart.value.width - newWidth
    updates.style!.width = `${newWidth}px`
    newPosition.x = resizeStart.value.elementX + actualDeltaX
  }

  if (resizeHandle.value.includes('s')) {
    const newHeight = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.height + deltaY)
    updates.style!.height = `${newHeight}px`
  }

  if (resizeHandle.value.includes('n')) {
    const newHeight = Math.max(ELEMENT_MIN_SIZE, resizeStart.value.height - deltaY)
    const actualDeltaY = resizeStart.value.height - newHeight
    updates.style!.height = `${newHeight}px`
    newPosition.y = resizeStart.value.elementY + actualDeltaY
  }

  if (resizeHandle.value.includes('w') || resizeHandle.value.includes('n')) {
    updates.position = newPosition
  }

  emit('update', props.element.id, updates)
}

function stopResize() {
  isResizing.value = false
  resizeHandle.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
//#endregion
</script>

<style lang="scss" scoped>
.canvas-element {
  position: absolute;
  border: 2px solid transparent;
  cursor: move;

  &.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
  }
}
.selected {
  .element-content {
    background: rgba(24, 160, 88, 0.1);
    border: 1px dashed var(--color-primary);
  }
}
.element-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: var(--color-primary);
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
