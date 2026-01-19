import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types'
import { useElementStore } from './elementStore'
import { useAnimationStore } from './animationStore'

export const useNodeTreeStore = defineStore('nodeTree', () => {
  const elementStore = useElementStore()
  const animationStore = useAnimationStore()
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

  /**
   * 从元素构建树形结构（性能优化：只构建可见节点）
   * @param maxDepth 最大深度限制，防止无限递归（默认10层）
   */
  function buildTreeFromElements(maxDepth = 10) {
    // 获取根元素
    const rootElements = elementStore.getRootElements()

    /**
     * 递归构建树节点
     * @param element 元素
     * @param depth 当前深度
     * @returns 树节点
     */
    function buildNode(
      element: ReturnType<typeof elementStore.getElement>,
      depth: number
    ): TreeNode | null {
      if (!element || depth > maxDepth) return null

      const node: TreeNode = {
        id: element.id,
        name: element.name || element.type,
        type: 'element' as const,
        elementId: element.id,
        expanded: expandedNodeIds.value.has(element.id),
        visible: element.visible !== false,
        locked: element.locked || false
      }

      // 只构建展开节点的子节点（性能优化：懒加载）
      if (node.expanded || depth === 0) {
        const children = elementStore.getChildren(element.id)
        if (children.length > 0) {
          node.children = children
            .map(child => buildNode(child, depth + 1))
            .filter((n): n is TreeNode => n !== null)
        }
      }

      return node
    }

    // 构建根节点
    nodes.value = rootElements
      .map(element => buildNode(element, 0))
      .filter((n): n is TreeNode => n !== null)
  }

  /**
   * 展开节点时，加载其子节点（懒加载优化）
   * @param nodeId 节点ID
   */
  function expandNode(nodeId: string) {
    toggleExpand(nodeId)
    // 重新构建树以加载子节点
    buildTreeFromElements()
  }

  function selectNode(nodeId: string) {
    selectedNodeId.value = nodeId
    const node = findNodeById(nodeId)
    if (node?.elementId) {
      elementStore.selectElement(node.elementId)
      // 同步设置动画 store 的选中元素
      animationStore.setSelectedElement(node.elementId)
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
    expandNode,
    selectNode,
    toggleExpand,
    updateNode,
    syncWithCanvas
  }
})
