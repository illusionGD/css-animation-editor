<template>
  <div class="h-full border-l bg-background flex flex-col w-80 shrink-0">
    <!-- Header -->
    <div class="h-10 border-b flex items-center px-4 gap-2 font-medium text-sm text-muted-foreground bg-muted/20">
      <AdjustmentsHorizontalIcon class="w-4 h-4" />
      Properties
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Global Settings (全局设置) -->
      <div class="space-y-2">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Animation Settings</h3>
        <div class="grid grid-cols-2 gap-2 items-center">
          <label class="text-sm">Duration (ms)</label>
          <input 
            type="number" 
            v-model.number="store.duration" 
            class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <!-- Keyframe Properties (关键帧属性) -->
      <div v-if="selectedKeyframe" class="space-y-4">
        <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Keyframe Properties
          <!-- 显示当前选中关键帧的 ID 和 百分比位置 -->
          <span class="text-[10px] bg-muted px-1.5 py-0.5 rounded">{{ selectedKeyframe.id }} @ {{ Math.round(selectedKeyframe.offset * 100) }}%</span>
        </h3>
        
        <div class="space-y-3">
          <!-- Opacity Control -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <label>Opacity (%)</label>
              <span>{{ selectedKeyframe.props.opacity }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model.number="selectedKeyframe.props.opacity" 
              class="w-full"
            />
          </div>

          <!-- Scale Control -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <label>Scale (%)</label>
              <span>{{ selectedKeyframe.props.scale }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="300" 
              v-model.number="selectedKeyframe.props.scale" 
              class="w-full"
            />
          </div>

          <!-- Rotate Control -->
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <label>Rotate (deg)</label>
              <span>{{ selectedKeyframe.props.rotate }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              v-model.number="selectedKeyframe.props.rotate" 
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-sm text-muted-foreground text-center py-8">
        Click a keyframe in the timeline to edit properties
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import { useAnimationStore } from '@/stores/animation'
import { computed } from 'vue'

const store = useAnimationStore()

// 根据 store.selectedKeyframeId 获取当前选中的关键帧对象
// 用于在模板中绑定和编辑属性
const selectedKeyframe = computed(() => {
  return store.keyframes.find(k => k.id === store.selectedKeyframeId)
})
</script>
