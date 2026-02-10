import {
  ANIMATION_DEFAULT_DURATION,
  CANVAS_DEFAULT_BACKGROUND_COLOR,
  CANVAS_DEFAULT_HEIGHT,
  CANVAS_DEFAULT_WIDTH
} from '@/constants'
import { darkTheme } from 'naive-ui'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 全局设置 Store
 * 管理应用级别的全局配置，分为三个类别：布局、导出、主题
 */

// ========== 布局设置常量 ==========
const SIDEBAR_DEFAULT_WIDTH = 300
const SIDEBAR_MIN_WIDTH = 200
const SIDEBAR_MAX_WIDTH = 600
const TIMELINE_DEFAULT_HEIGHT = 200
const TIMELINE_MIN_HEIGHT = 150
const TIMELINE_MAX_HEIGHT = 400

// ========== 导出设置常量 ==========
const EXPORT_FORMAT_DEFAULT = 'css'
const ANIMATION_MIN_DURATION = 100
const ANIMATION_MAX_DURATION = 60000

// 布局设置接口
export interface LayoutSettings {
  canvasBackgroundColor: string
  canvasWidth: number
  canvasHeight: number
  leftSidebarWidth: number
  rightSidebarWidth: number
  timelineHeight: number
}

// 导出设置接口
export interface ExportSettings {
  exportFormat: 'css' | 'html' | 'json'
  defaultDuration: number
  autoSave: boolean
  codeFormat: boolean // 代码格式化
  minifyCode: boolean // 代码压缩
}

// 主题设置接口
export interface ThemeSettings {
  isDarkMode: boolean
  theme: typeof darkTheme | null
}

export const useGlobalStore = defineStore('global', () => {
  const layoutSettings = ref<LayoutSettings>({
    canvasBackgroundColor: CANVAS_DEFAULT_BACKGROUND_COLOR,
    canvasWidth: CANVAS_DEFAULT_WIDTH,
    canvasHeight: CANVAS_DEFAULT_HEIGHT,
    leftSidebarWidth: SIDEBAR_DEFAULT_WIDTH,
    rightSidebarWidth: SIDEBAR_DEFAULT_WIDTH,
    timelineHeight: TIMELINE_DEFAULT_HEIGHT
  })

  const exportSettings = ref<ExportSettings>({
    exportFormat: EXPORT_FORMAT_DEFAULT as 'css' | 'html' | 'json',
    defaultDuration: ANIMATION_DEFAULT_DURATION,
    autoSave: true,
    codeFormat: true,
    minifyCode: false
  })

  const themeSettings = ref<ThemeSettings>({
    isDarkMode: true,
    theme: darkTheme
  })

  let saveLayoutTimer: NodeJS.Timeout
  // 布局设置方法
  function setLayoutSettings(settings: Partial<LayoutSettings>) {
    // 验证画布尺寸
    if (settings.canvasWidth !== undefined) {
      settings.canvasWidth = Math.max(400, settings.canvasWidth)
    }
    if (settings.canvasHeight !== undefined) {
      settings.canvasHeight = Math.max(300, settings.canvasHeight)
    }

    // 验证边栏宽度
    if (settings.leftSidebarWidth !== undefined) {
      settings.leftSidebarWidth = Math.max(
        SIDEBAR_MIN_WIDTH,
        Math.min(SIDEBAR_MAX_WIDTH, settings.leftSidebarWidth)
      )
    }
    if (settings.rightSidebarWidth !== undefined) {
      settings.rightSidebarWidth = Math.max(
        SIDEBAR_MIN_WIDTH,
        Math.min(SIDEBAR_MAX_WIDTH, settings.rightSidebarWidth)
      )
    }

    // 验证时间轴高度
    if (settings.timelineHeight !== undefined) {
      settings.timelineHeight = Math.max(
        TIMELINE_MIN_HEIGHT,
        Math.min(TIMELINE_MAX_HEIGHT, settings.timelineHeight)
      )
    }

    Object.assign(layoutSettings.value, settings)
    // 防抖保存
    clearTimeout(saveLayoutTimer)
    saveLayoutTimer = setTimeout(() => {
      saveToLocalStorage()
    }, 200)
  }

  // 重置布局设置到默认值
  function resetLayoutSettings() {
    layoutSettings.value = {
      canvasWidth: CANVAS_DEFAULT_WIDTH,
      canvasHeight: CANVAS_DEFAULT_HEIGHT,
      leftSidebarWidth: SIDEBAR_DEFAULT_WIDTH,
      rightSidebarWidth: SIDEBAR_DEFAULT_WIDTH,
      timelineHeight: TIMELINE_DEFAULT_HEIGHT,
      canvasBackgroundColor: CANVAS_DEFAULT_BACKGROUND_COLOR
    }
    saveToLocalStorage()
  }
  //  导出设置方法
  function setExportSettings(settings: Partial<ExportSettings>) {
    // 验证动画时长
    if (settings.defaultDuration !== undefined) {
      settings.defaultDuration = Math.max(
        ANIMATION_MIN_DURATION,
        Math.min(ANIMATION_MAX_DURATION, settings.defaultDuration)
      )
    }

    Object.assign(exportSettings.value, settings)
    saveToLocalStorage()
  }
  // 重置导出设置到默认值
  function resetExportSettings() {
    exportSettings.value = {
      exportFormat: EXPORT_FORMAT_DEFAULT as 'css' | 'html' | 'json',
      defaultDuration: ANIMATION_DEFAULT_DURATION,
      autoSave: true,
      codeFormat: true,
      minifyCode: false
    }
    saveToLocalStorage()
  }

  // 主题设置方法
  function setThemeSettings(settings: Partial<ThemeSettings>) {
    Object.assign(themeSettings.value, settings)
    saveToLocalStorage()
  }
  // 切换主题（亮色/暗色）
  function toggleTheme() {
    themeSettings.value.isDarkMode = !themeSettings.value.isDarkMode
    themeSettings.value.theme = themeSettings.value.isDarkMode ? darkTheme : null
    saveToLocalStorage()
  }

  // 加载全局设置从 LocalStorage
  function loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('css-animation-editor-global')
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.layoutSettings) {
          Object.assign(layoutSettings.value, parsed.layoutSettings)
        }
        if (parsed.exportSettings) {
          Object.assign(exportSettings.value, parsed.exportSettings)
        }
        if (parsed.themeSettings) {
          Object.assign(themeSettings.value, parsed.themeSettings)
        }
      }
    } catch (e) {
      console.error('Failed to load global settings:', e)
    }
  }

  // 保存全局设置到 LocalStorage
  function saveToLocalStorage() {
    try {
      localStorage.setItem(
        'css-animation-editor-global',
        JSON.stringify({
          layoutSettings: layoutSettings.value,
          exportSettings: exportSettings.value,
          themeSettings: themeSettings.value
        })
      )
    } catch (e) {
      console.error('Failed to save global settings:', e)
    }
  }

  // 初始化时加载
  loadFromLocalStorage()
  // 重置所有设置到默认值
  function resetAllSettings() {
    resetLayoutSettings()
    resetExportSettings()
    setThemeSettings({ isDarkMode: true }) // 默认深色主题
  }

  return {
    // 状态
    layoutSettings,
    exportSettings,
    themeSettings,

    /**
     * 批量更新布局设置
     * @param settings 新的布局设置（可选字段）
     */
    setLayoutSettings,
    /**
     * 重置布局设置到默认值
     */
    resetLayoutSettings,

    /**
     * 批量更新导出设置
     * @param settings 新的导出设置（可选字段）
     */
    setExportSettings,
    /**
     * 重置导出设置到默认值
     */
    resetExportSettings,

    /**
     * 批量更新主题设置
     * @param settings 新的主题设置（可选字段）
     */
    setThemeSettings,
    /**
     * 切换主题（亮色/暗色）
     */
    toggleTheme,
    /**
     * 保存全局设置到 LocalStorage
     */
    saveToLocalStorage,
    /**
     * 重置所有设置到默认值
     */
    resetAllSettings
  }
})
