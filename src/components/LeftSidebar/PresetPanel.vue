<template>
  <div class="preset-panel">
    <div class="preset-panel-header">
      <n-input
        :value="presetStore.searchQuery"
        placeholder="搜索预设..."
        clearable
        size="small"
        @update:value="presetStore.setSearchQuery"
      >
        <template #prefix>
          <n-icon><SearchIcon /></n-icon>
        </template>
      </n-input>
    </div>
    <div class="preset-panel-content">
      <n-scrollbar>
        <div v-if="presetStore.filteredPresets.length > 0" class="preset-list">
          <div
            v-for="preset in presetStore.filteredPresets"
            :key="preset.id"
            class="preset-item"
            @click="applyPreset(preset)"
          >
            <div class="preset-name">{{ preset.name }}</div>
            <div v-if="preset.description" class="preset-description">
              {{ preset.description }}
            </div>
            <div class="preset-category">{{ preset.category }}</div>
          </div>
        </div>
        <n-empty v-else description="暂无预设" />
      </n-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput, NIcon, NScrollbar, NEmpty } from 'naive-ui'
import { usePresetStore } from '@/stores/presetStore'
import { useAnimationStore } from '@/stores/animationStore'
import { Search } from '@vicons/ionicons5'

const SearchIcon = Search

const presetStore = usePresetStore()
const animationStore = useAnimationStore()

function applyPreset(preset: any) {
  // 应用预设到当前选中元素
  // TODO: 实现预设应用逻辑
  console.log('Apply preset:', preset)
}
</script>

<style lang="scss" scoped>
.preset-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preset-panel-header {
  padding: 12px;
  border-bottom: 1px solid var(--n-borderColor);
}

.preset-panel-content {
  flex: 1;
  overflow: hidden;
}

.preset-list {
  padding: 8px;
}

.preset-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--n-borderColor);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--n-colorHover);
    border-color: var(--n-colorPrimary);
  }

  .preset-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 12px;
    color: var(--n-textColor2);
    margin-bottom: 4px;
  }

  .preset-category {
    font-size: 11px;
    color: var(--n-textColor3);
  }
}
</style>
