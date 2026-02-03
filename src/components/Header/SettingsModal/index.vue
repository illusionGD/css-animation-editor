<template>
  <n-modal
    :show="show"
    preset="dialog"
    title="设置"
    style="width: 900px; height: 600px"
    @update:show="val => emit('update:show', val)"
  >
    <div class="settings-container">
      <!-- 左侧导航菜单 -->
      <div class="settings-sidebar">
        <div
          v-for="item in settingMenus"
          :key="item.id"
          class="settings-menu-item"
          :class="{ active: activeCategory === item.id }"
          @click="activeCategory = item.id"
        >
          <n-icon class="menu-icon">
            <component :is="item.icon" />
          </n-icon>
          <span>{{ item.label }}</span>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="settings-content">
        <div class="settings-section">
          <!-- 布局设置 -->
          <template v-if="activeCategory === 'layout'">
            <h3>布局设置</h3>
            <LayoutSettings
              :settings="layoutSettings"
              @on-reset="onLayoutReset"
              @on-change="onLayoutChange"
            />
          </template>

          <!-- 导出设置 -->
          <template v-else-if="activeCategory === 'export'">
            <h3>导出设置</h3>
            <ExportSettings
              :settings="exportSettings"
              @on-reset="onExportReset"
              @on-change="onExportChange"
            />
          </template>

          <!-- 主题设置 -->
          <template v-else-if="activeCategory === 'theme'">
            <h3>主题设置</h3>
            <ThemeSettings
              :settings="themeSettings"
              @on-reset="onThemeReset"
              @on-change="onThemeChange"
            />
          </template>
        </div>
      </div>
    </div>

    <template #action>
      <n-space>
        <n-button @click="handleCancel"> 取消 </n-button>
        <n-button type="primary" @click="handleConfirm"> 确定 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NButton, NSpace, NIcon, darkTheme } from 'naive-ui'
import {
  GridOutline as LayoutIcon,
  SwapHorizontalOutline as ExportIcon,
  ColorPaletteOutline as ThemeIcon
} from '@vicons/ionicons5'
import { useGlobalStore } from '@/stores/globalStore'
import LayoutSettings from './LayoutSettings.vue'
import ExportSettings from './ExportSettings.vue'
import ThemeSettings from './ThemeSettings.vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const globalStore = useGlobalStore()

// 设置菜单项
const settingMenus = [
  {
    id: 'layout' as const,
    label: '布局设置',
    icon: LayoutIcon
  },
  {
    id: 'export' as const,
    label: '导出设置',
    icon: ExportIcon
  },
  {
    id: 'theme' as const,
    label: '主题设置',
    icon: ThemeIcon
  }
]

type ActiveCategory = 'layout' | 'export' | 'theme'
const activeCategory = ref<ActiveCategory>('layout')

// 本地副本，用于临时编辑
const layoutSettings = ref({ ...globalStore.layoutSettings })
const exportSettings = ref({ ...globalStore.exportSettings })
const themeSettings = ref({ ...globalStore.themeSettings })

watch(
  () => props.show,
  newVal => {
    if (newVal) {
      // 打开时重新同步
      layoutSettings.value = { ...globalStore.layoutSettings }
      exportSettings.value = { ...globalStore.exportSettings }
      themeSettings.value = { ...globalStore.themeSettings }
    }
  }
)

function onLayoutChange(type: keyof typeof layoutSettings.value, value: number) {
  layoutSettings.value[type] = value
}

function onLayoutReset() {
  layoutSettings.value = { ...globalStore.layoutSettings }
}

function onExportChange(type: keyof typeof exportSettings.value, value: string | number | boolean) {
  exportSettings.value[type] = value as never
}

function onExportReset() {
  exportSettings.value = { ...globalStore.exportSettings }
}

function onThemeChange(type: 'isDarkMode', value: boolean) {
  themeSettings.value[type] = value
  themeSettings.value.theme = value ? darkTheme : null
}

function onThemeReset() {
  themeSettings.value = { ...globalStore.themeSettings }
}

function handleConfirm() {
  if (activeCategory.value === 'theme') {
    // 更新主题设置
    globalStore.setThemeSettings(themeSettings.value)
  }

  if (activeCategory.value === 'export') {
    // 更新导出设置
    globalStore.setExportSettings(exportSettings.value)
  }

  if (activeCategory.value === 'layout') {
    // 更新布局设置
    globalStore.setLayoutSettings(layoutSettings.value)
  }

  emit('update:show', false)
}

function handleCancel() {
  emit('update:show', false)
}
</script>

<style lang="scss" scoped>

.settings-container {
  display: flex;
  gap: 10px;
  height: 100%;

  .settings-sidebar {
    flex-shrink: 0;
    width: 150px;
    border-right: 1px solid var(--n-border-color);
    display: flex;
    flex-direction: column;

    .settings-menu-item {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      border-right: 3px solid transparent;
      transition: all 0.2s ease;
      color: var(--n-text-color-2);

      .menu-icon {
        font-size: 18px;
      }

      &:hover {
        background-color: var(--n-color-hover);
        color: var(--n-text-color);
      }

      &.active {
        background-color: var(--n-color-hover);
        color: var(--n-primary-color);
        border-right-color: var(--n-primary-color);
      }
    }
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    height: 470px;
    padding-right: 10px;

    .settings-section {
      h3 {
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--n-text-color);
      }

      :deep(.n-form) {
        .n-form-item {
          margin-bottom: 18px;
        }
      }
    }
  }
}

// 滚动条美化
.settings-content::-webkit-scrollbar {
  width: 6px;
}

.settings-content::-webkit-scrollbar-track {
  background: transparent;
}

.settings-content::-webkit-scrollbar-thumb {
  background-color: var(--n-scrollbar-color);
  border-radius: 3px;

  &:hover {
    background-color: var(--n-scrollbar-color-hover);
  }
}
</style>
