<template>
  <div class="node-tree">
    <div class="node-tree-header">
      <div class="header-top">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索节点..."
          clearable
          size="small"
        >
          <template #prefix>
            <n-icon>
              <SearchIcon />
            </n-icon>
          </template>
        </n-input>
        <n-button
          type="primary"
          size="small"
          @click="handleAddElement"
        >
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          {{ hasSelectedElement ? '添加子元素' : '添加元素' }}
        </n-button>
      </div>
    </div>
    <div
      class="node-tree-content"
      @click="handleContentClick"
    >
      <template v-if="filteredNodes.length > 0">
        <div class="normal-tree-wrapper">
          <n-tree
            :data="filteredNodes"
            :selected-keys="selectedKeys"
            :expanded-keys="expandedKeys"
            :render-label="renderTreeLabel"
            selectable
            block-line
            @update:selected-keys="handleSelect"
            @update:expanded-keys="handleExpand"
          />
        </div>
      </template>
      <n-empty
        v-else
        description="暂无节点"
      />
    </div>
    <!-- 重命名弹窗 -->
    <n-modal
      v-model:show="showRenameModal"
      preset="dialog"
      title="重命名"
      positive-text="确定"
      negative-text="取消"
      @positive-click="confirmRename"
      @negative-click="cancelRename"
    >
      <n-input
        v-model:value="editingNodeName"
        placeholder="请输入新名称"
        @keydown.enter="confirmRename"
        @keydown.esc="cancelRename"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { NInput, NIcon, NTree, NEmpty, NButton, NModal, useMessage, useDialog } from 'naive-ui'
import { useNodeTreeStore } from '@/stores/nodeTreeStore'
import { useCanvasStore } from '@/stores/canvasStore'
import { useElementStore } from '@/stores/elementStore'
import { useAnimationStore } from '@/stores/animationStore'
import { Search, Add, Trash, Create } from '@vicons/ionicons5'
import type { TreeNode, CanvasElement } from '@/types'

const SearchIcon = Search
const AddIcon = Add
const TrashIcon = Trash
const CreateIcon = Create

const nodeTreeStore = useNodeTreeStore()
const canvasStore = useCanvasStore()
const elementStore = useElementStore()
const animationStore = useAnimationStore()

const message = useMessage()
const dialog = useDialog()

const searchQuery = ref('')
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const editingNodeId = ref<string | null>(null)
const editingNodeName = ref('')
const showRenameModal = ref(false)

// 是否有选中的元素（用于显示"添加子元素"按钮）
const hasSelectedElement = computed(() => elementStore.hasSelection)

// 将TreeNode转换为Tree组件需要的格式
const treeData = computed(() => {
  function convertNode(node: TreeNode): Record<string, unknown> {
    const result: Record<string, unknown> = {
      key: node.id,
      name: node.name || node.type,
      type: node.type,
      isLeaf: !node.children || node.children.length === 0
    }
    if (node.children && node.children.length > 0) {
      result.children = node.children.map(convertNode)
    }
    return result
  }
  return nodeTreeStore.nodes.map(convertNode)
})

const filteredNodes = computed(() => {
  if (!searchQuery.value) return treeData.value

  const query = searchQuery.value.toLowerCase()
  function filterNodes(nodes: Record<string, unknown>[]): Record<string, unknown>[] {
    return nodes
      .filter(node => {
        const name = String(node.name || node.type || '')
        return name.toLowerCase().includes(query)
      })
      .map(node => {
        const result: Record<string, unknown> = { ...node }
        if (node.children && Array.isArray(node.children)) {
          result.children = filterNodes(node.children as Record<string, unknown>[])
        }
        return result
      })
  }
  return filterNodes(treeData.value)
})

// 渲染树节点标签（使用 render-label 属性）
function renderTreeLabel({ option }: { option: Record<string, unknown> }) {
  return h(
    'div',
    {
      class: 'tree-node-label-wrapper',
      style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
    },
    [
      h('span', { class: 'tree-node-label-text' }, String(option.name || option.type || '')),
      h('div', { class: 'tree-node-actions' }, [
        h(
          NButton,
          {
            quaternary: true,
            size: 'tiny',
            class: 'node-action-btn',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              handleRenameNode(String(option.key || ''))
            }
          },
          {
            icon: () => h(NIcon, { size: 14 }, { default: () => h(CreateIcon) })
          }
        ),
        h(
          NButton,
          {
            quaternary: true,
            size: 'tiny',
            class: 'node-action-btn',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              handleDeleteNode(String(option.key || ''))
            }
          },
          {
            icon: () => h(NIcon, { size: 14 }, { default: () => h(TrashIcon) })
          }
        )
      ])
    ]
  )
}

watch(
  () => nodeTreeStore.selectedNodeId,
  newId => {
    if (newId) {
      selectedKeys.value = [newId]
    } else {
      selectedKeys.value = []
    }
  }
)

// 监听画布选中元素，同步到节点树
watch(
  () => elementStore.selectedElementIds,
  newIds => {
    if (newIds.length > 0) {
      const elementId = newIds[0]
      const nodeId = elementId // 节点ID直接使用元素ID
      const node = nodeTreeStore.findNodeById(nodeId)
      if (node && nodeTreeStore.selectedNodeId !== nodeId) {
        nodeTreeStore.selectNode(nodeId)
      }
    } else {
      // 如果画布没有选中元素，清除节点树选择
      if (nodeTreeStore.selectedNodeId) {
        nodeTreeStore.selectedNodeId = null
        selectedKeys.value = []
      }
    }
  }
)

watch(
  () => nodeTreeStore.expandedNodeIds,
  newSet => {
    expandedKeys.value = Array.from(newSet)
  },
  { deep: true }
)

// 同步画布元素变化
watch(
  () => elementStore.elementsArray,
  () => {
    nodeTreeStore.syncWithCanvas()
  },
  { deep: true }
)

// 初始化
nodeTreeStore.syncWithCanvas()
expandedKeys.value = Array.from(nodeTreeStore.expandedNodeIds)

function handleSelect(keys: string[]) {
  if (keys.length > 0) {
    nodeTreeStore.selectNode(keys[0])
  } else {
    elementStore.clearSelection()
    // 清除选择时，也要清除动画 store 的选中元素
    animationStore.setSelectedElement(null)
  }
}

// 点击内容区域（非节点）时取消选择
function handleContentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const treeNode = target.closest('.n-tree-node')
  if (!treeNode) {
    elementStore.clearSelection()
    animationStore.setSelectedElement(null)
    selectedKeys.value = []
  }
}

function handleExpand(keys: string[]) {
  keys.forEach(key => {
    nodeTreeStore.expandNode(key)
  })
}

/**
 * 添加元素：如果有选中元素则添加子元素，否则添加新的根元素
 */
function handleAddElement() {
  const selectedElement = elementStore.firstSelectedElement

  if (selectedElement) {
    // 添加子元素
    addChildElement(selectedElement)
  } else {
    // 添加根元素
    addRootElement()
  }
}

/**
 * 添加根元素
 */
function addRootElement() {
  const _width = 150
  const _height = 100
  const _x = (canvasStore.canvasConfig.width - _width) / 2
  const _y = (canvasStore.canvasConfig.height - _height) / 2
  const elementId = elementStore.createElement({
    type: 'div',
    position: {
      x: _x,
      y: _y
    },
    name: `元素 ${elementStore.elementCount + 1}`
  })
  // 自动选中新添加的元素
  elementStore.selectElement(elementId)
}

/**
 * 添加子元素
 */
function addChildElement(parentElement: CanvasElement) {
  if (!parentElement) return

  // 获取父元素的位置和尺寸，子元素放在父元素内部
  const parentX = parentElement.position.x
  const parentY = parentElement.position.y
  const parentWidth = parentElement.size.width
  const parentHeight = parentElement.size.height

  const _width = 100
  const _height = 80
  const _x = parentX + (parentWidth - _width) / 2
  const _y = parentY + (parentHeight - _height) / 2

  const elementId = elementStore.createElement({
    type: 'div',
    parentId: parentElement.id,
    position: {
      x: _x,
      y: _y
    },
    size: {
      width: _width,
      height: _height
    },
    name: `${parentElement.name || '元素'}-子元素`
  })

  // 展开父节点以显示子元素
  nodeTreeStore.expandNode(parentElement.id)
  // 自动选中新添加的子元素
  elementStore.selectElement(elementId)
}

// 删除节点
function handleDeleteNode(nodeKey: string) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这个元素吗？删除后无法恢复。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      const element = elementStore.getElement(nodeKey)
      if (element) {
        elementStore.deleteElement(nodeKey)
        message.success('删除成功')
        // 如果删除的是当前选中的元素，清除选择
        if (selectedKeys.value.includes(nodeKey)) {
          elementStore.clearSelection()
          animationStore.setSelectedElement(null)
        }
      }
    }
  })
}

// 重命名节点
function handleRenameNode(nodeKey: string) {
  const element = elementStore.getElement(nodeKey)
  if (!element) return

  editingNodeId.value = nodeKey
  editingNodeName.value = element.name || element.type || ''
  showRenameModal.value = true
}

function confirmRename() {
  if (!editingNodeId.value) {
    showRenameModal.value = false
    return false
  }

  const newName = editingNodeName.value.trim()
  if (!newName) {
    message.warning('名称不能为空')
    return false
  }

  elementStore.updateElement(editingNodeId.value, { name: newName })
  message.success('重命名成功')
  editingNodeId.value = null
  editingNodeName.value = ''
  showRenameModal.value = false
  return true
}

function cancelRename() {
  editingNodeId.value = null
  editingNodeName.value = ''
  showRenameModal.value = false
}
</script>

<style lang="scss" scoped>
.node-tree {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.node-tree-header {
  padding: 12px;
  border-bottom: 1px solid var(--n-borderColor);
}

.header-top {
  display: flex;
  gap: 8px;
  align-items: center;
}

.node-tree-content {
  flex: 1;
  overflow: hidden;
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.normal-tree-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
  @include custom-scrollbar;
}

.node-action-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
  }
}

.tree-node-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.tree-node-label-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-label-wrapper:hover .tree-node-actions {
  opacity: 1;
}
</style>
