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
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasElement as CanvasElementType } from '@/types'

interface Props {
  element: CanvasElementType
  selected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [elementId: string, multi: boolean]
  update: [elementId: string, updates: Partial<CanvasElementType>]
}>()

const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

const elementStyle = computed(() => ({
  position: 'absolute',
  left: `${props.element.position.x}px`,
  top: `${props.element.position.y}px`,
  width: `${props.element.size.width}px`,
  height: `${props.element.size.height}px`,
  ...props.element.style
}))

function handleClick(e: MouseEvent) {
  emit('select', props.element.id, e.ctrlKey || e.metaKey)
}

function handleMouseDown(e: MouseEvent) {
  emit('select', props.element.id, e.ctrlKey || e.metaKey)
  // TODO: 实现拖拽移动
}

function startResize(handle: string, e: MouseEvent) {
  e.stopPropagation()
  isResizing.value = true
  resizeHandle.value = handle
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: props.element.size.width,
    height: props.element.size.height
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
    size: { ...props.element.size }
  }

  if (resizeHandle.value.includes('e')) {
    updates.size!.width = Math.max(20, resizeStart.value.width + deltaX)
  }
  if (resizeHandle.value.includes('w')) {
    updates.size!.width = Math.max(20, resizeStart.value.width - deltaX)
    updates.position = { ...props.element.position, x: props.element.position.x + deltaX }
  }
  if (resizeHandle.value.includes('s')) {
    updates.size!.height = Math.max(20, resizeStart.value.height + deltaY)
  }
  if (resizeHandle.value.includes('n')) {
    updates.size!.height = Math.max(20, resizeStart.value.height - deltaY)
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
