<template>
  <div class="resizable-layout">
    <div class="layout-container" :style="containerStyle">
      <!-- 左侧边栏 -->
      <div
        v-if="showLeft"
        class="sidebar left-sidebar"
        :class="{ 'dark-theme': isDark }"
        :style="{ width: `${leftWidth}px` }"
      >
        <slot name="left"></slot>
        <div class="resize-handle left-handle" @mousedown="startResize('left', $event)"></div>
      </div>

      <!-- 中间内容区 -->
      <div class="main-content" :class="{ 'dark-theme': isDark }" :style="mainContentStyle">
        <slot name="main"></slot>
      </div>

      <!-- 右侧边栏 -->
      <div
        v-if="showRight"
        class="sidebar right-sidebar"
        :class="{ 'dark-theme': isDark }"
        :style="{ width: `${rightWidth}px` }"
      >
        <div class="resize-handle right-handle" @mousedown="startResize('right', $event)"></div>
        <slot name="right"></slot>
      </div>
    </div>

    <!-- 底部面板 -->
    <div
      v-if="showBottom"
      class="bottom-panel"
      :class="{ 'dark-theme': isDark }"
      :style="{ height: `${bottomHeight}px` }"
    >
      <div class="resize-handle top-handle" @mousedown="startResize('bottom', $event)"></div>
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/uiStore'

const uiStore = useUIStore()
const isDark = computed(() => uiStore.theme !== null)

interface Props {
  showLeft?: boolean
  showRight?: boolean
  showBottom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLeft: true,
  showRight: true,
  showBottom: true
})

const leftWidth = computed({
  get: () => uiStore.leftSidebarWidth,
  set: val => uiStore.setLeftSidebarWidth(val)
})

const rightWidth = computed({
  get: () => uiStore.rightSidebarWidth,
  set: val => uiStore.setRightSidebarWidth(val)
})

const bottomHeight = computed({
  get: () => uiStore.timelineHeight,
  set: val => uiStore.setTimelineHeight(val)
})

const containerStyle = computed(() => ({
  height: props.showBottom ? `calc(100% - ${bottomHeight.value}px)` : '100%'
}))

const mainContentStyle = computed(() => ({
  width:
    props.showLeft && props.showRight
      ? `calc(100% - ${leftWidth.value + rightWidth.value}px)`
      : props.showLeft
        ? `calc(100% - ${leftWidth.value}px)`
        : props.showRight
          ? `calc(100% - ${rightWidth.value}px)`
          : '100%'
}))

let resizing = false
let resizeType: 'left' | 'right' | 'bottom' | null = null
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

function startResize(type: 'left' | 'right' | 'bottom', e: MouseEvent) {
  e.preventDefault()
  resizing = true
  resizeType = type
  startX = e.clientX
  startY = e.clientY

  if (type === 'left' || type === 'right') {
    startWidth = type === 'left' ? leftWidth.value : rightWidth.value
  } else {
    startHeight = bottomHeight.value
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = type === 'bottom' ? 'ns-resize' : 'ew-resize'
  document.body.style.userSelect = 'none'
}

function handleResize(e: MouseEvent) {
  if (!resizing || !resizeType) return

  if (resizeType === 'left') {
    // 左侧边栏：向右拖拽增加宽度
    const diff = e.clientX - startX
    leftWidth.value = Math.max(200, Math.min(600, startWidth + diff))
  } else if (resizeType === 'right') {
    // 右侧边栏：向左拖拽增加宽度
    const diff = startX - e.clientX
    rightWidth.value = Math.max(200, Math.min(600, startWidth + diff))
  } else if (resizeType === 'bottom') {
    // 底部面板：向上拖拽增加高度
    const diff = startY - e.clientY
    bottomHeight.value = Math.max(150, Math.min(400, startHeight + diff))
  }
}

function stopResize() {
  resizing = false
  resizeType = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  stopResize()
})
</script>

<style lang="scss" scoped>
.resizable-layout {
  width: 100%;
  height: calc(100vh - var(--header-height));
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-container {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.sidebar {
  position: relative;
  background: var(--n-color);
  border-right: 1px solid var(--n-borderColor);
  overflow: hidden;

  // 白天主题添加阴影
  &:not(.dark-theme) {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  }

  &.dark-theme {
    box-shadow: none;
  }
}

.right-sidebar {
  border-right: none;
  border-left: 1px solid var(--n-borderColor);

  // 白天主题添加阴影
  &:not(.dark-theme) {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
  }

  &.dark-theme {
    box-shadow: none;
  }
}

.main-content {
  flex: 1;
  overflow: hidden;

  // 白天主题添加边框
  &:not(.dark-theme) {
    border-left: 1px solid rgba(0, 0, 0, 0.08);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
  }

  &.dark-theme {
    border-left: none;
    border-right: none;
  }
}

.bottom-panel {
  position: relative;
  background: var(--n-color);
  border-top: 1px solid var(--n-borderColor);
  overflow: hidden;

  // 白天主题添加阴影
  &:not(.dark-theme) {
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  }

  &.dark-theme {
    box-shadow: none;
  }
}

.resize-handle {
  position: absolute;
  background: transparent;
  z-index: 10;
  transition: background 0.2s;

  &:hover {
    background: var(--n-colorHover);
  }

  &.left-handle {
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
  }

  &.right-handle {
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
  }

  &.top-handle {
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: ns-resize;
  }
}
</style>
