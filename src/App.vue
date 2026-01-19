<template>
  <n-config-provider :theme="uiStore.theme">
    <n-message-provider>
      <n-dialog-provider>
        <div :data-theme="isDark ? 'dark' : 'light'" :class="{ 'dark-theme': isDark }">
          <n-layout class="app-layout">
            <Header />
            <ResizableLayout>
              <template #left>
                <LeftSidebar />
              </template>
              <template #main>
                <Canvas />
              </template>
              <template #right>
                <PropertyPanel />
              </template>
              <template #bottom>
                <Timeline />
              </template>
            </ResizableLayout>
          </n-layout>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider, NLayout, NMessageProvider, NDialogProvider } from 'naive-ui'
import { useUIStore } from '@/stores/uiStore'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import Header from '@/components/Header/Header.vue'
import ResizableLayout from '@/components/ResizableLayout/ResizableLayout.vue'
import LeftSidebar from '@/components/LeftSidebar/LeftSidebar.vue'
import Canvas from '@/components/Canvas/Canvas.vue'
import PropertyPanel from '@/components/PropertyPanel/PropertyPanel.vue'
import Timeline from '@/components/Timeline/Timeline.vue'

const uiStore = useUIStore()
const isDark = computed(() => uiStore.theme !== null)
useKeyboardShortcuts()
</script>

<style lang="scss" scoped>
.app-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
