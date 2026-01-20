import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formatDecimal } from '@/utils/formatters'
import { useElementStore } from './elementStore'
import {
  CANVAS_DEFAULT_WIDTH,
  CANVAS_DEFAULT_HEIGHT,
  CANVAS_DEFAULT_BACKGROUND_COLOR,
  CANVAS_DEFAULT_GRID_SIZE,
  CANVAS_DEFAULT_ZOOM,
  CANVAS_DEFAULT_OFFSET_X,
  CANVAS_DEFAULT_OFFSET_Y,
  CANVAS_DEFAULT_SHOW_GRID,
  CANVAS_DEFAULT_SHOW_RULER
} from '@/constants'

export const useCanvasStore = defineStore('canvas', () => {
  const elementStore = useElementStore()

  // 状态
  const canvasConfig = ref({
    width: CANVAS_DEFAULT_WIDTH,
    height: CANVAS_DEFAULT_HEIGHT,
    backgroundColor: CANVAS_DEFAULT_BACKGROUND_COLOR,
    gridSize: CANVAS_DEFAULT_GRID_SIZE,
    showGrid: CANVAS_DEFAULT_SHOW_GRID,
    showRuler: CANVAS_DEFAULT_SHOW_RULER,
    zoom: CANVAS_DEFAULT_ZOOM,
    offsetX: CANVAS_DEFAULT_OFFSET_X,
    offsetY: CANVAS_DEFAULT_OFFSET_Y
  })

  // 计算属性：从 elementStore 获取元素数据（保持向后兼容）
  const elements = computed(() => elementStore.elementsArray)
  const selectedElementIds = computed(() => elementStore.selectedElementIds)
  const selectedElements = computed(() => elementStore.selectedElements)
  const hasSelection = computed(() => elementStore.hasSelection)

  // 方法：代理到 elementStore（保持向后兼容）
  function addElement(element: Parameters<typeof elementStore.createElement>[0]) {
    elementStore.createElement(element)
  }

  function removeElement(elementId: string) {
    elementStore.deleteElement(elementId)
  }

  function updateElement(
    elementId: string,
    updates: Parameters<typeof elementStore.updateElement>[1]
  ) {
    elementStore.updateElement(elementId, updates)
  }

  function selectElement(elementId: string | string[], multi = false) {
    elementStore.selectElement(elementId, multi)
  }

  function deselectElement(elementId: string | string[]) {
    elementStore.deselectElement(elementId)
  }

  function clearSelection() {
    elementStore.clearSelection()
  }

  function updateCanvasConfig(config: Partial<typeof canvasConfig.value>) {
    // 如果更新了 zoom，格式化成一位小数
    if (config.zoom !== undefined) {
      config.zoom = parseFloat(formatDecimal(config.zoom, 2))
    }
    Object.assign(canvasConfig.value, config)
  }

  return {
    // 状态
    elements, // 计算属性：从 elementStore 获取
    selectedElementIds, // 计算属性：从 elementStore 获取
    canvasConfig,
    // 计算属性
    selectedElements, // 计算属性：从 elementStore 获取
    hasSelection, // 计算属性：从 elementStore 获取
    // 方法（代理到 elementStore，保持向后兼容）
    addElement,
    removeElement,
    updateElement,
    selectElement,
    deselectElement,
    clearSelection,
    updateCanvasConfig
  }
})
