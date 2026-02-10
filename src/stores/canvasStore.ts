import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { formatDecimal } from '@/utils/formatters'
import { useElementStore } from './elementStore'
import {
  CANVAS_DEFAULT_GRID_SIZE,
  CANVAS_DEFAULT_ZOOM,
  CANVAS_DEFAULT_OFFSET_X,
  CANVAS_DEFAULT_OFFSET_Y,
  CANVAS_DEFAULT_SHOW_GRID,
  CANVAS_DEFAULT_SHOW_RULER
} from '@/constants'
import { ElementType, CSSProperties } from '@/types'
interface NodeType {
  id: string
  style: CSSProperties
  children: NodeType[]
  order: number
  parentId?: string
}

export const useCanvasStore = defineStore('canvas', () => {
  const elementStore = useElementStore()

  // 状态
  const canvasConfig = ref({
    gridSize: CANVAS_DEFAULT_GRID_SIZE,
    showGrid: CANVAS_DEFAULT_SHOW_GRID,
    showRuler: CANVAS_DEFAULT_SHOW_RULER,
    zoom: CANVAS_DEFAULT_ZOOM,
    offsetX: CANVAS_DEFAULT_OFFSET_X,
    offsetY: CANVAS_DEFAULT_OFFSET_Y
  })

  const elements = ref<NodeType[]>([])

  // 计算属性：从 elementStore 获取元素数据（保持向后兼容）
  const selectedElementIds = computed(() => elementStore.selectedElementIds)
  const selectedElements = computed(() => elementStore.selectedElements)
  const hasSelection = computed(() => elementStore.hasSelection)

  watch(
    () => elementStore.elementsArray.length,
    () => {
      buildElementTree()
    }
  )

  // 构建树形结构
  function buildElementTree() {
    let maxLevel = 0
    const levelMap: Record<number, NodeType[]> = {}
    elementStore.elements.forEach(el => {
      maxLevel = Math.max(maxLevel, el.level)
      if (!levelMap[el.level]) {
        levelMap[el.level] = []
      }
      levelMap[el.level].push({
        id: el.id,
        style: el.style,
        parentId: el.parentId,
        order: el.order,
        children: [] // 子元素将在后续构建树形结构时填充
      })
    })

    for (let index = 0; index < maxLevel; index++) {
      const currentLevelElements = levelMap[index] || []
      currentLevelElements.forEach(el => {
        const children: NodeType[] = []
        levelMap[index + 1]?.forEach(child => {
          if (child.parentId === el.id) {
            children.push(child)
          }
        })
        el.children = children
        return el
      })
    }
    elements.value = levelMap[0] || []
    return elements.value
  }

  function getElementById(id: string): NodeType | null {
    function search(nodes: NodeType[]): NodeType | null {
      for (const node of nodes) {
        if (node.id === id) return node
        const foundInChildren = search(node.children)
        if (foundInChildren) return foundInChildren
      }
      return null
    }
    return search(elements.value)
  }

  //   更新元素样式
  function updateElementStyle(id: string, style: CSSProperties) {
    const element = getElementById(id)
    if (element) {
      element.style = { ...element.style, ...style }
    }
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
    updateCanvasConfig,
    /**
     * 构建元素树形结构
     */
    buildElementTree,

    updateElementStyle
  }
})
