<template>
  <div class="h-full border-t bg-background flex flex-col">
    <!-- Toolbar -->
    <div class="h-10 border-b flex items-center px-2 gap-2 bg-muted/20">
      <Button variant="ghost" size="icon" class="h-8 w-8" @click="store.togglePlay()">
        <PauseIcon v-if="store.isPlaying" class="w-4 h-4" />
        <PlayIcon v-else class="w-4 h-4" />
      </Button>
      
      <Button variant="ghost" size="icon" class="h-8 w-8" @click="store.setTime(0); store.isPlaying = false">
        <StopIcon class="w-4 h-4" />
      </Button>
      
      <div class="text-xs font-mono text-muted-foreground ml-auto pr-2 w-20 text-right">
        {{ formattedTime }}
      </div>
    </div>

    <!-- Timeline Body -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Track Headers -->
      <div class="w-48 border-r bg-muted/10 flex flex-col text-xs text-muted-foreground shrink-0">
        <div class="h-8 border-b px-2 flex items-center bg-muted/20 font-medium">Tracks</div>
        <div class="h-8 border-b px-2 flex items-center">Animation</div>
      </div>

      <!-- Tracks Area -->
      <div class="flex-1 relative bg-background overflow-hidden flex flex-col">
         
         <!-- Ruler / Scrubber -->
         <div class="h-8 border-b bg-muted/5 relative flex items-center px-0">
            <input 
              type="range" 
              min="0" 
              :max="store.duration" 
              step="10"
              :value="store.currentTime"
              @input="onScrub"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0"
              title="Drag to scrub timeline"
            />
            
            <div class="w-full h-full relative">
               <!-- Playhead -->
               <div 
                 class="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-10 h-[200px]"
                 :style="{ left: `${(store.currentTime / store.duration) * 100}%` }"
               ></div>
            </div>
         </div>
         
         <!-- Keyframes Track -->
         <div class="h-8 border-b relative w-full">
            <div 
              v-for="kf in store.keyframes" 
              :key="kf.id"
              class="absolute top-2.5 w-3 h-3 bg-primary rotate-45 cursor-pointer hover:scale-125 transition-transform z-30"
              :style="{ left: `calc(${kf.offset * 100}% - 6px)` }"
              @click.stop="store.selectedKeyframeId = kf.id"
              :class="{ 'ring-2 ring-white ring-offset-1 ring-offset-background': store.selectedKeyframeId === kf.id }"
              title="Click to select keyframe"
            ></div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/vue/24/solid'
import { Button } from '@/components/ui/button'
import { useAnimationStore } from '@/stores/animation'
import { computed } from 'vue'

const store = useAnimationStore()

// 格式化时间显示为秒 (0.00s)
const formattedTime = computed(() => {
  const s = (store.currentTime / 1000).toFixed(2)
  return `${s}s`
})

// 处理时间轴拖拽事件，更新 store 中的 currentTime
const onScrub = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setTime(Number(target.value))
}
</script>
