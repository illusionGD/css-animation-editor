import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { ANIMATION_UI_DEFAULT_DURATION } from '@/constants'

// 布局相关常量（只在 UI Store 中使用）
const SIDEBAR_DEFAULT_WIDTH = 300
const SIDEBAR_MIN_WIDTH = 200
const SIDEBAR_MAX_WIDTH = 600
const TIMELINE_DEFAULT_HEIGHT = 200
const TIMELINE_MIN_HEIGHT = 150
const TIMELINE_MAX_HEIGHT = 400

export const useUIStore = defineStore('ui', () => {
  // 状态
  const isDarkMode = ref(true) // 使用布尔值来跟踪主题状态
  const theme = computed<GlobalTheme | null>(() => (isDarkMode.value ? darkTheme : null))
  const leftSidebarWidth = ref(SIDEBAR_DEFAULT_WIDTH)
  const rightSidebarWidth = ref(SIDEBAR_DEFAULT_WIDTH)
  const timelineHeight = ref(TIMELINE_DEFAULT_HEIGHT)
  const leftSidebarTab = ref<'nodeTree' | 'presets'>('nodeTree')
  const settings = ref({
    exportFormat: 'css' as 'css' | 'html' | 'json',
    defaultDuration: ANIMATION_UI_DEFAULT_DURATION,
    autoSave: true
  })
  const autoKeyframe = ref(false) // 自动K帧开关

  // 方法
  function toggleTheme() {
    // 切换暗色/亮色主题
    isDarkMode.value = !isDarkMode.value
    saveToLocalStorage()
  }

  function setTheme(isDark: boolean) {
    isDarkMode.value = isDark
    saveToLocalStorage()
  }

  function setLeftSidebarWidth(width: number) {
    leftSidebarWidth.value = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width))
    saveToLocalStorage()
  }

  function setRightSidebarWidth(width: number) {
    rightSidebarWidth.value = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width))
    saveToLocalStorage()
  }

  function setTimelineHeight(height: number) {
    timelineHeight.value = Math.max(TIMELINE_MIN_HEIGHT, Math.min(TIMELINE_MAX_HEIGHT, height))
    saveToLocalStorage()
  }

  function setLeftSidebarTab(tab: 'nodeTree' | 'presets') {
    leftSidebarTab.value = tab
  }

  function updateSettings(newSettings: Partial<typeof settings.value>) {
    Object.assign(settings.value, newSettings)
    saveToLocalStorage()
  }

  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('css-animation-editor-ui')
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.leftSidebarWidth) leftSidebarWidth.value = parsed.leftSidebarWidth
        if (parsed.rightSidebarWidth) rightSidebarWidth.value = parsed.rightSidebarWidth
        if (parsed.timelineHeight) timelineHeight.value = parsed.timelineHeight
        if (parsed.settings) settings.value = { ...settings.value, ...parsed.settings }
        if (typeof parsed.autoKeyframe === 'boolean') autoKeyframe.value = parsed.autoKeyframe
        // 修复主题加载：确保正确设置主题
        if (parsed.theme === 'light') {
          isDarkMode.value = false
        } else if (parsed.theme === 'dark') {
          isDarkMode.value = true
        }
        // 如果没有保存的主题，使用默认的darkTheme（isDarkMode.value = true）
      }
    } catch (e) {
      console.error('Failed to load UI settings:', e)
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(
        'css-animation-editor-ui',
        JSON.stringify({
          leftSidebarWidth: leftSidebarWidth.value,
          rightSidebarWidth: rightSidebarWidth.value,
          timelineHeight: timelineHeight.value,
          settings: settings.value,
          theme: isDarkMode.value ? 'dark' : 'light',
          autoKeyframe: autoKeyframe.value
        })
      )
    } catch (e) {
      console.error('Failed to save UI settings:', e)
    }
  }

  // 初始化时加载
  loadFromLocalStorage()

  function toggleAutoKeyframe() {
    autoKeyframe.value = !autoKeyframe.value
    saveToLocalStorage()
  }

  return {
    // 状态
    theme,
    leftSidebarWidth,
    rightSidebarWidth,
    timelineHeight,
    leftSidebarTab,
    settings,
    autoKeyframe,
    // 方法
    toggleTheme,
    setTheme,
    setLeftSidebarWidth,
    setRightSidebarWidth,
    setTimelineHeight,
    setLeftSidebarTab,
    updateSettings,
    toggleAutoKeyframe
  }
})
