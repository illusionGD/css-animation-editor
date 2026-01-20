<template>
  <div class="timeline-ruler">
    <div
      v-for="tick in timeTicks"
      :key="`ruler-tick-${tick.time}`"
      class="ruler-tick"
      :class="{ 'ruler-tick-major': tick.isMajor }"
      :style="{ left: `${tick.position}%` }"
    >
      <div class="ruler-line" />
      <span
        class="ruler-label"
      >{{ tick.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  TIMELINE_BASE_INTERVAL,
  TIMELINE_INTERVALS
} from './constants'

interface Props {
  duration: number // 总时长（毫秒）
  zoom: number // 缩放级别
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

// 根据缩放级别计算合适的时间间隔
const timeInterval = computed(() => {
  const adjustedInterval = TIMELINE_BASE_INTERVAL / props.zoom
  
  // 确保最小间隔不会小于 100ms (0.1s)
  const minInterval = 100
  const clampedInterval = Math.max(minInterval, adjustedInterval)

  for (const interval of TIMELINE_INTERVALS) {
    if (clampedInterval <= interval) {
      return interval
    }
  }
  // 如果计算出的间隔小于最小间隔，返回最小间隔
  return Math.max(minInterval, TIMELINE_INTERVALS[0])
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
    // 判断是否为主刻度：时间能被主刻度间隔整除（允许小的浮点误差）
    const isMajor = Math.abs(time % majorInterval.value) < 0.1 || time === 0 || time === props.duration
    const position = (time / props.duration) * 100

    // 如果缩放太小，只显示主刻度
    if (!showMinorTicks && !isMajor) {
      continue
    }

    // 所有刻度都显示标签
    ticks.push({
      time,
      position,
      label: formatTime(time),
      isMajor
    })
  }

  return ticks
})

// 格式化时间显示（参考图片格式：0.0s, 0.2s, 0.3s 等）
function formatTime(ms: number): string {
  const seconds = ms / 1000
  // 保留一位小数，如 0.0s, 0.2s, 0.3s
  return `${seconds.toFixed(1)}s`
}
</script>

<style lang="scss" scoped>
.timeline-ruler {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--n-color);
  border-bottom: 1px solid var(--color-border);
}

.ruler-tick {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  &.ruler-tick-major {

    .ruler-label {
      font-weight: 500;
      color: var(--n-textColor);
    }
  }

  &:not(.ruler-tick-major) {
    .ruler-label {
      font-weight: 400;
      color: var(--n-textColor2);
      opacity: 0.7;
    }
  }
}

.ruler-line {
  position: absolute;
  margin-top: 0;
  height: 8px;
  width: 1px;
  background-color: var(--color-border);
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.ruler-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: var(--n-textColor);
  white-space: nowrap;
  padding: 0 2px;
  line-height: 1.4;
  user-select: none;
  font-weight: 500;
  z-index: 10;
  pointer-events: none;
}
</style>
