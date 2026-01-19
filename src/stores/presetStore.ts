import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PresetSchema } from '@/types'
import { storageAdapter } from '@/services/storage'

export const usePresetStore = defineStore('preset', () => {
  const presets = ref<PresetSchema[]>([])
  const categories = ref<string[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)

  // 计算属性
  const filteredPresets = computed(() => {
    let result = presets.value

    // 按分类过滤
    if (selectedCategory.value) {
      result = result.filter(p => p.category === selectedCategory.value)
    }

    // 按搜索关键词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return result
  })

  // 方法
  async function loadPresets() {
    try {
      presets.value = await storageAdapter.listPresets()
      updateCategories()
    } catch (error) {
      console.error('Failed to load presets:', error)
    }
  }

  async function savePreset(preset: PresetSchema) {
    try {
      await storageAdapter.savePreset(preset)
      await loadPresets()
    } catch (error) {
      console.error('Failed to save preset:', error)
    }
  }

  async function deletePreset(presetId: string) {
    try {
      await storageAdapter.deletePreset(presetId)
      await loadPresets()
    } catch (error) {
      console.error('Failed to delete preset:', error)
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setSelectedCategory(category: string | null) {
    selectedCategory.value = category
  }

  function updateCategories() {
    const cats = new Set<string>()
    presets.value.forEach(p => {
      if (p.category) {
        cats.add(p.category)
      }
    })
    categories.value = Array.from(cats).sort()
  }

  // 初始化 - 加载默认预设
  async function initDefaultPresets() {
    const existingPresets = await storageAdapter.listPresets()
    if (existingPresets.length === 0) {
      // 导入默认预设
      const { defaultPresets } = await import('@/schemas/preset.schema')
      for (const preset of defaultPresets) {
        await storageAdapter.savePreset(preset)
      }
    }
    await loadPresets()
  }

  initDefaultPresets()

  return {
    // 状态
    presets,
    categories,
    searchQuery,
    selectedCategory,
    // 计算属性
    filteredPresets,
    // 方法
    loadPresets,
    savePreset,
    deletePreset,
    setSearchQuery,
    setSelectedCategory
  }
})
