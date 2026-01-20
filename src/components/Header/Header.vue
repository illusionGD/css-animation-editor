<template>
  <n-layout-header
    class="header"
    :class="{ 'dark-theme': isDark }"
    bordered
  >
    <div class="header-content">
      <div class="header-left">
        <h1 class="title">
          CSS动画可视化编辑器
        </h1>
      </div>
      <div class="header-right">
        <n-space>
          <n-button
            quaternary
            @click="toggleTheme"
          >
            <template #icon>
              <n-icon>
                <SunIcon v-if="isDark" />
                <MoonIcon v-else />
              </n-icon>
            </template>
          </n-button>
          <n-button
            quaternary
            @click="showSettings = true"
          >
            <template #icon>
              <n-icon><SettingsIcon /></n-icon>
            </template>
            设置
          </n-button>
        </n-space>
      </div>
    </div>
    <SettingsModal v-model:show="showSettings" />
  </n-layout-header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NLayoutHeader, NButton, NSpace, NIcon } from 'naive-ui'
import { useUIStore } from '@/stores/uiStore'
import SettingsModal from './SettingsModal.vue'
import { SunnyOutline, MoonOutline, SettingsOutline } from '@vicons/ionicons5'

const SunIcon = SunnyOutline
const MoonIcon = MoonOutline
const SettingsIcon = SettingsOutline

const uiStore = useUIStore()
const showSettings = ref(false)

const isDark = computed(() => {
  // 通过检查theme是否为null来判断是否为暗色主题
  return uiStore.theme !== null
})

function toggleTheme() {
  uiStore.toggleTheme()
}
</script>

<style lang="scss" scoped>
.header {
  height: 60px;
  min-height: 60px;
  max-height: 60px;
  flex-shrink: 0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background: var(--n-color);

  // 白天主题添加阴影
  &:not(.dark-theme) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
