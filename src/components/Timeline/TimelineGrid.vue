<template>
  <div
    class="timeline-grid"
    :style="gridStyle"
  >
    <div
      v-for="tick in timeTicks"
      :key="`tick-${tick.time}`"
      class="grid-tick"
      :class="{ 'grid-tick-major': tick.isMajor }"
      :style="{ left: `${tick.position}%` }"
    >
      <div class="grid-line" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  TIMELINE_BASE_INTERVAL,
  TIMELINE_INTERVALS,
  TIMELINE_DEFAULT_CONTENT_WIDTH
} from './constants'

interface Props {
  duration: number // 总时长（毫秒）
  zoom: number // 缩放级别（1 = 100%）
  width: number // 时间轴宽度（像素）
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1,
  width: TIMELINE_DEFAULT_CONTENT_WIDTH
})

// 根据缩放级别计算合适的时间间隔
const timeInterval = computed(() => {
  // 根据缩放级别调整间隔
  // zoom 越大，间隔越小（显示更精细）
  // zoom 越小，间隔越大（显示更粗略）
  const adjustedInterval = TIMELINE_BASE_INTERVAL / props.zoom

  // 根据调整后的间隔，选择最接近的标准间隔
  for (const interval of TIMELINE_INTERVALS) {
    if (adjustedInterval <= interval) {
      return interval
    }
  }
  return TIMELINE_INTERVALS[TIMELINE_INTERVALS.length - 1]
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
  const ticks: Array<{ time: number; position: number; isMajor: boolean }> = []

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
      isMajor
    })
  }

  return ticks
})

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
      background: var(--color-border);
      opacity: 0.6;
    }
  }

  &:not(.grid-tick-major) {
    .grid-line {
      background: var(--color-border);
      opacity: 0.3;
    }
  }
}

.grid-line {
  width: 1px;
  height: 100%;
  background: var(--color-border);
}
</style>
