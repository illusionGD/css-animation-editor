<template>
  <div ref="containerRef" class="canvas-container">
    <div class="canvas-ruler-wrapper">
      <CanvasRuler
        v-if="canvasConfig.showRuler"
        type="horizontal"
        :zoom="canvasConfig.zoom"
        :offset-x="canvasConfig.offsetX"
        :offset-y="canvasConfig.offsetY"
      />
    </div>
    <div class="canvas-content-wrapper">
      <CanvasRuler
        v-if="canvasConfig.showRuler"
        type="vertical"
        :zoom="canvasConfig.zoom"
        :offset-x="canvasConfig.offsetX"
        :offset-y="canvasConfig.offsetY"
      />
      <div class="canvas-wrapper" @wheel="handleWheel" @contextmenu.prevent>
        <CanvasGrid
          v-if="canvasConfig.showGrid"
          :grid-size="canvasConfig.gridSize"
          :zoom="canvasConfig.zoom"
          :offset-x="canvasConfig.offsetX"
          :offset-y="canvasConfig.offsetY"
          :canvas-width="canvasConfig.width"
          :canvas-height="canvasConfig.height"
        />
        <div
          class="canvas"
          :style="canvasStyle"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @click="handleClick"
        >
          <CanvasElement
            v-for="element in elements"
            :key="element.id"
            :element="element"
            :selected="isSelected(element.id)"
            :canvas-zoom="canvasConfig.zoom"
            :canvas-offset-x="canvasConfig.offsetX"
            :canvas-offset-y="canvasConfig.offsetY"
            :canvas-width="canvasConfig.width"
            :canvas-height="canvasConfig.height"
            @select="handleElementSelect"
            @update="handleElementUpdate"
          />
          <SelectionBox v-if="selectionBox" :box="selectionBox" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import { useUIStore } from '@/stores/uiStore'
import { useAnimationStore } from '@/stores/animationStore'
import { clamp } from '@/utils/calculators'
import CanvasRuler from './CanvasRuler.vue'
import CanvasGrid from './CanvasGrid.vue'
import CanvasElement from './CanvasElement.vue'
import SelectionBox from './SelectionBox.vue'
import type { CanvasElement as CanvasElementType } from '@/types'

const canvasStore = useCanvasStore()
const uiStore = useUIStore()
const animationStore = useAnimationStore()

const containerRef = ref<HTMLElement>()
const selectionBox = ref<{ x: number; y: number; width: number; height: number } | null>(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
const isInitialized = ref(false)

const canvasConfig = computed(() => canvasStore.canvasConfig)
const elements = computed(() => canvasStore.elements)
const isDark = computed(() => {
  // 通过检查theme是否为null来判断是否为暗色主题
  return uiStore.theme !== null
})

const canvasStyle = computed(() => ({
  width: `${canvasConfig.value.width}px`,
  height: `${canvasConfig.value.height}px`,
  backgroundColor: canvasConfig.value.backgroundColor,
  transform: `translate(${canvasConfig.value.offsetX}px, ${canvasConfig.value.offsetY}px) scale(${canvasConfig.value.zoom})`,
  transformOrigin: 'top left' // 画布左上角为原点
}))

function isSelected(elementId: string) {
  return canvasStore.selectedElementIds.includes(elementId)
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = clamp(canvasConfig.value.zoom + delta, 0.1, 3)
  canvasStore.updateCanvasConfig({ zoom: newZoom })
}

// 处理画布上的鼠标按下事件
function handleCanvasMouseDown(e: MouseEvent) {
  // 中键或 Ctrl+左键：平移画布
  if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
    e.preventDefault()
    isPanning.value = true
    panStart.value = {
      x: e.clientX,
      y: e.clientY,
      offsetX: canvasConfig.value.offsetX,
      offsetY: canvasConfig.value.offsetY
    }
    document.addEventListener('mousemove', handleCanvasPanMove)
    document.addEventListener('mouseup', handleCanvasPanUp)
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    return
  }

  // 左键：选择框
  if (e.button === 0) {
    const canvasElement = (e.target as HTMLElement).closest('.canvas')
    if (!canvasElement) return

    const rect = canvasElement.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    // 转换为画布坐标
    const canvasX = (startX - canvasConfig.value.offsetX) / canvasConfig.value.zoom
    const canvasY = (startY - canvasConfig.value.offsetY) / canvasConfig.value.zoom

    isDragging.value = true
    dragStart.value = { x: canvasX, y: canvasY }
    selectionBox.value = { x: canvasX, y: canvasY, width: 0, height: 0 }

    document.addEventListener('mousemove', handleSelectionDrag)
    document.addEventListener('mouseup', handleSelectionEnd)
  }
}

function handleMouseMove(e: MouseEvent) {
  // 处理选择框拖拽
  if (isDragging.value && selectionBox.value) {
    const canvasElement = (e.target as HTMLElement).closest('.canvas')
    if (!canvasElement) return

    const rect = canvasElement.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    // 转换为画布坐标
    const canvasX = (currentX - canvasConfig.value.offsetX) / canvasConfig.value.zoom
    const canvasY = (currentY - canvasConfig.value.offsetY) / canvasConfig.value.zoom

    selectionBox.value = {
      x: Math.min(dragStart.value.x, canvasX),
      y: Math.min(dragStart.value.y, canvasY),
      width: Math.abs(canvasX - dragStart.value.x),
      height: Math.abs(canvasY - dragStart.value.y)
    }
  }
}

function handleMouseUp(e: MouseEvent) {
  if (isDragging.value) {
    isDragging.value = false
    document.removeEventListener('mousemove', handleSelectionDrag)
    document.removeEventListener('mouseup', handleSelectionEnd)
  }
}

function handleClick(e: MouseEvent) {
  // 如果点击的是画布空白区域，清除选择
  if ((e.target as HTMLElement).classList.contains('canvas')) {
    canvasStore.clearSelection()
  }
}

function handleSelectionDrag(e: MouseEvent) {
  handleMouseMove(e)
}

function handleSelectionEnd(e: MouseEvent) {
  handleMouseUp(e)
}

function handleElementSelect(elementId: string, multi: boolean) {
  canvasStore.selectElement(elementId, multi)
  // 同步设置动画 store 的选中元素
  if (!multi) {
    animationStore.setSelectedElement(elementId)
  }
}

function handleElementUpdate(elementId: string, updates: Partial<CanvasElementType>) {
  canvasStore.updateElement(elementId, updates)
}

// 初始化画布缩放，使其适应视图
function initializeCanvasZoom() {
  if (!containerRef.value || isInitialized.value) return

  const container = containerRef.value.querySelector('.canvas-wrapper') as HTMLElement
  if (!container) return

  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const canvasWidth = canvasConfig.value.width
  const canvasHeight = canvasConfig.value.height

  // 计算适合的缩放比例
  const scaleX = (containerWidth - 40) / canvasWidth // 减去标尺空间
  const scaleY = (containerHeight - 40) / canvasHeight
  const scale = Math.min(scaleX, scaleY, 1) // 不超过1，不放大

  // 计算居中位置
  const scaledWidth = canvasWidth * scale
  const scaledHeight = canvasHeight * scale
  const offsetX = (containerWidth - scaledWidth) / 2
  const offsetY = (containerHeight - scaledHeight) / 2

  canvasStore.updateCanvasConfig({
    zoom: scale,
    offsetX: Math.max(20, offsetX), // 至少为标尺留出空间
    offsetY: Math.max(20, offsetY)
  })

  isInitialized.value = true
}

onMounted(() => {
  nextTick(() => {
    initializeCanvasZoom()
  })
  window.addEventListener('resize', initializeCanvasZoom)
})

onUnmounted(() => {
  window.removeEventListener('resize', initializeCanvasZoom)
})

// 拖动画布
function handleCanvasPanMove(e: MouseEvent) {
  if (isPanning.value) {
    const deltaX = e.clientX - panStart.value.x
    const deltaY = e.clientY - panStart.value.y
    canvasStore.updateCanvasConfig({
      offsetX: panStart.value.offsetX + deltaX,
      offsetY: panStart.value.offsetY + deltaY
    })
  }
}

function handleCanvasPanUp(_e: MouseEvent) {
  if (isPanning.value) {
    isPanning.value = false
    document.removeEventListener('mousemove', handleCanvasPanMove)
    document.removeEventListener('mouseup', handleCanvasPanUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
}
</script>

<style lang="scss" scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: v-bind('isDark ? "#1a1a1a" : "#f5f5f5"');
  transition: background-color 0.3s;
  display: flex;
  flex-direction: column;
}

.canvas-ruler-wrapper {
  position: relative;
  flex-shrink: 0;
  z-index: 20;
  display: flex;
  height: 20px;
  margin-left: 20px; // 为垂直标尺留出空间

  .ruler-corner {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    background: v-bind('isDark ? "#2d2d2d" : "#e8e8e8"');
    border-right: 1px solid v-bind('isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"');
    border-bottom: 1px solid v-bind('isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"');
  }
}

.canvas-content-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.canvas {
  position: absolute;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  transform-origin: top left;
  cursor: default;
  background: v-bind('canvasConfig.backgroundColor');
  z-index: 1;
}
</style>
