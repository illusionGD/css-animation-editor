import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'

export const useUIStore = defineStore('ui', () => {
  // 状态
  const isDarkMode = ref(true) // 使用布尔值来跟踪主题状态
  const theme = computed<GlobalTheme | null>(() => (isDarkMode.value ? darkTheme : null))
  const leftSidebarWidth = ref(300)
  const rightSidebarWidth = ref(300)
  const timelineHeight = ref(200)
  const leftSidebarTab = ref<'nodeTree' | 'presets'>('nodeTree')
  const settings = ref({
    exportFormat: 'css' as 'css' | 'html' | 'json',
    defaultDuration: 3000,
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
    leftSidebarWidth.value = Math.max(200, Math.min(600, width))
    saveToLocalStorage()
  }

  function setRightSidebarWidth(width: number) {
    rightSidebarWidth.value = Math.max(200, Math.min(600, width))
    saveToLocalStorage()
  }

  function setTimelineHeight(height: number) {
    timelineHeight.value = Math.max(150, Math.min(400, height))
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
