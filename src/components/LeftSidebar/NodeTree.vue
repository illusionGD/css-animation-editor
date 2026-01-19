<template>
  <div class="node-tree">
    <div class="node-tree-header">
      <n-input
        v-model:value="searchQuery"
        placeholder="搜索节点..."
        clearable
        size="small"
      >
        <template #prefix>
          <n-icon><SearchIcon /></n-icon>
        </template>
      </n-input>
    </div>
    <div class="node-tree-content">
      <n-tree
        v-if="filteredNodes.length > 0"
        :data="filteredNodes"
        :selected-keys="selectedKeys"
        :expanded-keys="expandedKeys"
        selectable
        block-line
        @update:selected-keys="handleSelect"
        @update:expanded-keys="handleExpand"
      />
      <n-empty v-else description="暂无节点" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NIcon, NTree, NEmpty } from 'naive-ui'
import { useNodeTreeStore } from '@/stores/nodeTreeStore'
import { useCanvasStore } from '@/stores/canvasStore'
import { Search } from '@vicons/ionicons5'

const SearchIcon = Search

const nodeTreeStore = useNodeTreeStore()
const canvasStore = useCanvasStore()

const searchQuery = ref('')
const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// 将TreeNode转换为Tree组件需要的格式
const treeData = computed(() => {
  function convertNode(node: any): any {
    return {
      key: node.id,
      label: node.name,
      children: node.children?.map(convertNode),
      isLeaf: !node.children || node.children.length === 0
    }
  }
  return nodeTreeStore.nodes.map(convertNode)
})

const filteredNodes = computed(() => {
  if (!searchQuery.value) return treeData.value

  const query = searchQuery.value.toLowerCase()
  function filterNodes(nodes: any[]): any[] {
    return nodes
      .filter((node) => node.label.toLowerCase().includes(query))
      .map((node) => ({
        ...node,
        children: node.children ? filterNodes(node.children) : undefined
      }))
  }
  return filterNodes(treeData.value)
})

watch(
  () => nodeTreeStore.selectedNodeId,
  (newId) => {
    if (newId) {
      selectedKeys.value = [newId]
    } else {
      selectedKeys.value = []
    }
  }
)

watch(
  () => nodeTreeStore.expandedNodeIds,
  (newSet) => {
    expandedKeys.value = Array.from(newSet)
  },
  { deep: true }
)

// 同步画布元素变化
watch(
  () => canvasStore.elements,
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
    canvasStore.clearSelection()
  }
}

function handleExpand(keys: string[]) {
  keys.forEach((key) => nodeTreeStore.toggleExpand(key))
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

.node-tree-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}
</style>
