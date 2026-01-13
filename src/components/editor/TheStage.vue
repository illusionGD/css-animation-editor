<script setup lang="ts">
import { useAnimationStore } from '@/stores/animation'
import { computed } from 'vue'

// 引入 Store
const store = useAnimationStore()

// 绑定 Store 中计算出的动态样式 (currentStyle)
// 这将根据 currentTime 自动更新 transform 和 opacity 等属性
const previewStyle = computed(() => store.currentStyle)
</script>

<template>
  <div class="w-full h-full relative overflow-hidden bg-background flex items-center justify-center">
    <!-- Checkerboard Background (棋盘格背景) -->
    <!-- 用于清晰展示元素的透明度变化 -->
    <div class="absolute inset-0 pointer-events-none opacity-10"
         style="background-size: 20px 20px; background-image: conic-gradient(#808080 90deg, transparent 90deg 180deg, #808080 180deg 270deg, transparent 270deg);">
    </div>

    <!-- Preview Element (预览目标元素) -->
    <!-- 样式由 store.currentStyle 驱动 -->
    <div 
      class="w-32 h-32 rounded shadow-lg flex items-center justify-center text-white font-bold select-none bg-primary transition-colors"
      :style="previewStyle"
    >
      Target
    </div>
  </div>
</template>
