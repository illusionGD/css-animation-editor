<template>
  <div class="timeline-ruler">
    <div
      v-for="tick in timeTicks"
      :key="`ruler-tick-${tick.time}`"
      class="ruler-tick"
      :class="{ 'ruler-tick-major': tick.isMajor }"
      :style="{ left: `${tick.position}%` }"
    >
      <div class="ruler-line"></div>
      <span class="ruler-label">{{ tick.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  duration: number // 总时长（毫秒）
  zoom: number // 缩放级别
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

// 根据缩放级别计算合适的时间间隔
const timeInterval = computed(() => {
  const baseInterval = 100
  const adjustedInterval = baseInterval / props.zoom

  const intervals = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  for (const interval of intervals) {
    if (adjustedInterval <= interval) {
      return interval
    }
  }
  return 10000
})

// 主刻度间隔
const majorInterval = computed(() => {
  return timeInterval.value * 5
})

// 生成时间刻度
const timeTicks = computed(() => {
  const ticks: Array<{ time: number; position: number; label: string; isMajor: boolean }> = []

  // 计算每个时间间隔对应的百分比
  const intervalPercent = (timeInterval.value / props.duration) * 100

  // 如果百分比太小（小于1%），不显示次刻度
  const showMinorTicks = intervalPercent >= 1

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
    const wholeSeconds = Math.floor(seconds)
    const msPart = Math.floor((seconds - wholeSeconds) * 1000)
    if (msPart === 0) {
      return `${wholeSeconds}s`
    }
    return `${wholeSeconds}.${Math.floor(msPart / 100)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toFixed(1)}`
}
</script>

<style lang="scss" scoped>
.timeline-ruler {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--n-color);
  border-bottom: 1px solid var(--n-borderColor);
}

.ruler-tick {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.ruler-tick-major {
    .ruler-line {
      height: 100%;
      border-left: 1px solid var(--n-borderColor);
      opacity: 0.8;
    }
    .ruler-label {
      font-weight: 500;
    }
  }

  &:not(.ruler-tick-major) {
    .ruler-line {
      height: 50%;
      border-left: 1px solid var(--n-borderColor);
      opacity: 0.4;
    }
  }
}

.ruler-line {
  width: 1px;
}

.ruler-label {
  position: absolute;
  top: 4px;
  font-size: 10px;
  color: var(--n-textColor2);
  white-space: nowrap;
  background: var(--n-color);
  padding: 0 2px;
  line-height: 1.2;
  user-select: none;
}
</style>
