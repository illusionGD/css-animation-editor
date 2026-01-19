import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formatDecimal } from '@/utils/formatters'
import type { CanvasElement } from '@/types'

export const useCanvasStore = defineStore('canvas', () => {
  // 状态
  const elements = ref<CanvasElement[]>([])
  const selectedElementIds = ref<string[]>([])
  const canvasConfig = ref({
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    gridSize: 20,
    showGrid: true,
    showRuler: true,
    zoom: 1,
    offsetX: 20, // 默认偏移：为垂直标尺留出空间，使画布(0,0)对齐标尺(0,0)
    offsetY: 20  // 默认偏移：为水平标尺留出空间，使画布(0,0)对齐标尺(0,0)
  })

  // 计算属性
  const selectedElements = computed(() => {
    return elements.value.filter((el) => selectedElementIds.value.includes(el.id))
  })

  const hasSelection = computed(() => selectedElementIds.value.length > 0)

  // 方法
  function addElement(element: CanvasElement) {
    elements.value.push(element)
  }

  function removeElement(elementId: string) {
    const index = elements.value.findIndex((el) => el.id === elementId)
    if (index >= 0) {
      elements.value.splice(index, 1)
      deselectElement(elementId)
    }
  }

  function updateElement(elementId: string, updates: Partial<CanvasElement>) {
    const element = elements.value.find((el) => el.id === elementId)
    if (element) {
      Object.assign(element, updates)
    }
  }

  function selectElement(elementId: string, multi = false) {
    if (multi) {
      if (selectedElementIds.value.includes(elementId)) {
        deselectElement(elementId)
      } else {
        selectedElementIds.value.push(elementId)
      }
    } else {
      selectedElementIds.value = [elementId]
    }
  }

  function deselectElement(elementId: string) {
    const index = selectedElementIds.value.indexOf(elementId)
    if (index >= 0) {
      selectedElementIds.value.splice(index, 1)
    }
  }

  function clearSelection() {
    selectedElementIds.value = []
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
    elements,
    selectedElementIds,
    canvasConfig,
    // 计算属性
    selectedElements,
    hasSelection,
    // 方法
    addElement,
    removeElement,
    updateElement,
    selectElement,
    deselectElement,
    clearSelection,
    updateCanvasConfig
  }
})
