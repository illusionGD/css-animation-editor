import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types'
import { useCanvasStore } from './canvasStore'

export const useNodeTreeStore = defineStore('nodeTree', () => {
  const canvasStore = useCanvasStore()
  const nodes = ref<TreeNode[]>([])
  const selectedNodeId = ref<string | null>(null)
  const expandedNodeIds = ref<Set<string>>(new Set())

  // 计算属性
  const selectedNode = computed(() => {
    return findNodeById(selectedNodeId.value)
  })

  // 方法
  function findNodeById(id: string | null): TreeNode | null {
    if (!id) return null
    function search(nodes: TreeNode[]): TreeNode | null {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = search(node.children)
          if (found) return found
        }
      }
      return null
    }
    return search(nodes.value)
  }

  function buildTreeFromElements() {
    const elements = canvasStore.elements
    nodes.value = elements.map((el) => ({
      id: `node-${el.id}`,
      name: el.name || el.type,
      type: 'element' as const,
      elementId: el.id,
      expanded: expandedNodeIds.value.has(`node-${el.id}`),
      visible: el.visible !== false,
      locked: el.locked || false
    }))
  }

  function selectNode(nodeId: string) {
    selectedNodeId.value = nodeId
    const node = findNodeById(nodeId)
    if (node?.elementId) {
      canvasStore.selectElement(node.elementId)
    }
  }

  function toggleExpand(nodeId: string) {
    if (expandedNodeIds.value.has(nodeId)) {
      expandedNodeIds.value.delete(nodeId)
    } else {
      expandedNodeIds.value.add(nodeId)
    }
  }

  function updateNode(nodeId: string, updates: Partial<TreeNode>) {
    const node = findNodeById(nodeId)
    if (node) {
      Object.assign(node, updates)
    }
  }

  // 监听画布元素变化，同步更新节点树
  function syncWithCanvas() {
    buildTreeFromElements()
  }

  return {
    // 状态
    nodes,
    selectedNodeId,
    expandedNodeIds,
    // 计算属性
    selectedNode,
    // 方法
    findNodeById,
    buildTreeFromElements,
    selectNode,
    toggleExpand,
    updateNode,
    syncWithCanvas
  }
})
