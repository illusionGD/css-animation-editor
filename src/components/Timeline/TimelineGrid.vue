<template>
  <div class="timeline-grid" :style="gridStyle">
    <div
      v-for="tick in timeTicks"
      :key="`tick-${tick.time}`"
      class="grid-tick"
      :class="{ 'grid-tick-major': tick.isMajor }"
      :style="{ left: `${tick.position}%` }"
    >
      <div class="grid-line"></div>
      <span v-if="tick.isMajor" class="grid-label">{{ tick.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  duration: number // 总时长（毫秒）
  zoom: number // 缩放级别（1 = 100%）
  width: number // 时间轴宽度（像素）
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1,
  width: 1000
})

// 根据缩放级别计算合适的时间间隔
const timeInterval = computed(() => {
  // 基础间隔：100ms
  const baseInterval = 100
  // 根据缩放级别调整间隔
  // zoom 越大，间隔越小（显示更精细）
  // zoom 越小，间隔越大（显示更粗略）
  const adjustedInterval = baseInterval / props.zoom

  // 根据调整后的间隔，选择最接近的标准间隔
  const intervals = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  for (const interval of intervals) {
    if (adjustedInterval <= interval) {
      return interval
    }
  }
  return 10000
})

// 主刻度间隔（通常是次刻度的5倍）
const majorInterval = computed(() => {
  return timeInterval.value * 5
})

// 计算每像素对应的时间（毫秒）
const pixelsPerMs = computed(() => {
  return props.width / props.duration
})

// 计算每个时间间隔对应的像素
const pixelsPerInterval = computed(() => {
  return timeInterval.value * pixelsPerMs.value
})

// 生成时间刻度
const timeTicks = computed(() => {
  const ticks: Array<{ time: number; position: number; label: string; isMajor: boolean }> = []

  // 如果像素间隔太小（小于10px），不显示次刻度
  const showMinorTicks = pixelsPerInterval.value >= 10

  // 生成刻度
  for (let time = 0; time <= props.duration; time += timeInterval.value) {
    const isMajor = Math.abs(time % majorInterval.value) < 0.1
    const position = (time / props.duration) * 100

    // 如果缩放太小，只显示主刻度
    if (!showMinorTicks && !isMajor) {
      continue
    }

    ticks.push({
      time,
      position,
      label: formatTime(time),
      isMajor
    })
  }

  return ticks
})

// 格式化时间显示
function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toFixed(1)}`
}

const gridStyle = computed(() => ({
  width: '100%',
  height: '100%',
  position: 'absolute' as const,
  top: 0,
  left: 0,
  pointerEvents: 'none' as const,
  zIndex: 1
}))
</script>

<style lang="scss" scoped>
.timeline-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.grid-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.grid-tick-major {
    .grid-line {
      background: var(--n-borderColor);
      opacity: 0.6;
    }
  }

  &:not(.grid-tick-major) {
    .grid-line {
      background: var(--n-borderColor);
      opacity: 0.3;
    }
  }
}

.grid-line {
  width: 1px;
  height: 100%;
  background: var(--n-borderColor);
}

.grid-label {
  position: absolute;
  top: 2px;
  font-size: 10px;
  color: var(--n-textColor2);
  white-space: nowrap;
  background: var(--n-color);
  padding: 0 2px;
  line-height: 1.2;
}
</style>
