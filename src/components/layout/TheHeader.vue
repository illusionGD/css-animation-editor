<template>
  <header class="h-14 border-b bg-background px-4 flex items-center justify-between shrink-0 z-50">
    <div class="font-bold text-lg flex items-center gap-2">
      <span class="text-primary">CSS Animation Editor</span>
    </div>
    
    <div class="flex items-center gap-2">
      <!-- Theme Toggle -->
      <Button 
        variant="ghost" 
        size="icon" 
        @click="toggleDark()"
        title="Toggle Theme"
      >
        <SunIcon v-if="isDark" class="w-5 h-5" />
        <MoonIcon v-else class="w-5 h-5" />
      </Button>
      
      <!-- Export Button -->
      <Button variant="outline" size="sm" @click="handleExport">
        {{ copied ? 'Copied!' : 'Export CSS' }}
      </Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { Button } from '@/components/ui/button'
import { useAnimationStore } from '@/stores/animation'

const isDark = ref(false)

onMounted(() => {
  // 从 localStorage 获取主题状态
  const savedTheme = localStorage.getItem('vueuse-color-scheme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

const toggleDark = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('vueuse-color-scheme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('vueuse-color-scheme', 'light')
  }
}

const store = useAnimationStore()
const { copy, copied } = useClipboard()

// 导出 CSS 代码到剪贴板
const handleExport = () => {
  copy(store.cssCode)
}
</script>
