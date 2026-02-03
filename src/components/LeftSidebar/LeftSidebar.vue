<template>
  <div class="left-sidebar">
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="nodeTree" tab="节点树">
        <NodeTree />
      </n-tab-pane>
      <n-tab-pane name="presets" tab="预设库">
        <PresetPanel />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import { useUIStore } from '@/stores/uiStore'
import NodeTree from './NodeTree.vue'
import PresetPanel from './PresetPanel.vue'

const uiStore = useUIStore()
const activeTab = computed({
  get: () => uiStore.leftSidebarTab,
  set: val => uiStore.setLeftSidebarTab(val)
})
</script>

<style lang="scss" scoped>
.left-sidebar {
  padding: 0 5px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.n-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column;

    .n-tabs-nav {
      flex-shrink: 0;
    }

    .n-tab-pane {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
