import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formatDecimal } from '@/utils/formatters'
import { useElementStore } from './elementStore'

export const useCanvasStore = defineStore('canvas', () => {
  const elementStore = useElementStore()

  // 状态
  const canvasConfig = ref({
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    gridSize: 20,
    showGrid: true,
    showRuler: true,
    zoom: 1,
    offsetX: 20, // 默认偏移：为垂直标尺留出空间，使画布(0,0)对齐标尺(0,0)
    offsetY: 20 // 默认偏移：为水平标尺留出空间，使画布(0,0)对齐标尺(0,0)
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
