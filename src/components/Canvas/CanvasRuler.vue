<template>
  <div v-if="props.type === 'horizontal'" class="ruler-horizontal" :style="horizontalStyle">
    <div
      v-for="tick in horizontalTicks"
      class="ruler-tick"
      :key="`h-${tick.value}`"
      :class="{ 'ruler-tick-major': tick.isMajor }"
      :style="{ left: `${tick.position}px` }"
    >
      <span class="ruler-label">{{ tick.label }}</span>
    </div>
  </div>
  <div v-else class="ruler-vertical" :style="verticalStyle">
    <div
      v-for="tick in verticalTicks"
      :key="`v-${tick.value}`"
      class="ruler-tick"
      :class="{ 'ruler-tick-major': tick.isMajor }"
      :style="{ top: `${tick.position}px` }"
    >
      <span class="ruler-label">{{ tick.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  type: 'horizontal' | 'vertical'
  zoom: number
  offsetX: number
  offsetY: number
}

const props = defineProps<Props>()
const uiStore = useUIStore()

const rulerSize = 20
const baseTickInterval = 50 // 基础刻度间隔
const baseMajorTickInterval = 250 // 基础主刻度间隔
const minScreenInterval = 30 // 最小屏幕像素间隔（避免刻度太密集）

const isDark = computed(() => uiStore.theme !== null)

// 根据缩放级别动态计算刻度间隔
const tickInterval = computed(() => {
  const screenInterval = baseTickInterval * props.zoom
  if (screenInterval < minScreenInterval) {
    // 如果屏幕间隔太小，增大刻度间隔
    return Math.ceil(minScreenInterval / props.zoom / baseTickInterval) * baseTickInterval
  }
  return baseTickInterval
})

// 根据缩放级别动态计算主刻度间隔
const majorTickInterval = computed(() => {
  const screenInterval = baseMajorTickInterval * props.zoom
  if (screenInterval < minScreenInterval * 2) {
    // 如果主刻度屏幕间隔太小，增大主刻度间隔
    return (
      Math.ceil((minScreenInterval * 2) / props.zoom / baseMajorTickInterval) *
      baseMajorTickInterval
    )
  }
  return baseMajorTickInterval
})

// 计算是否应该显示小刻度（当缩放很小时，只显示主刻度）
const showMinorTicks = computed(() => {
  return props.zoom >= 0.3 // 当缩放小于0.3时，只显示主刻度
})

const horizontalStyle = computed(() => ({
  height: `${rulerSize}px`,
  flex: 1,
  position: 'relative' as const,
  background: isDark.value ? '#2d2d2d' : '#e8e8e8',
  borderBottom: `1px solid ${isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
}))

const verticalStyle = computed(() => ({
  width: `${rulerSize}px`,
  position: 'absolute' as const,
  left: 0,
  top: 0,
  bottom: 0,
  background: isDark.value ? '#2d2d2d' : '#e8e8e8',
  borderRight: `1px solid ${isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
}))

const horizontalTicks = computed(() => {
  const ticks: Array<{ value: number; position: number; label: string; isMajor: boolean }> = []
  const viewportWidth = 3000 // 假设可见区域宽度
  const zoom = props.zoom
  const interval = tickInterval.value
  const majorInterval = majorTickInterval.value

  // 计算可见区域的起始和结束位置（画布坐标）
  // 水平标尺在 .canvas-ruler-wrapper 中，该容器有 margin-left: 20px
  // 标尺本身是 position: relative，所以刻度位置是相对于标尺容器的
  // 网格线在 canvas-wrapper 中，坐标系统是相对于 canvas-wrapper 的
  // 为了对齐，我们需要计算相对于各自容器的位置
  // 画布的(0,0)对应容器中的(offsetX, offsetY)位置
  // 所以标尺容器的可见区域：从 0 到 viewportWidth（相对于标尺容器）
  const startX = (0 - props.offsetX) / zoom - 100
  const endX = (viewportWidth - props.offsetX) / zoom + 100

  // 生成刻度
  for (let i = Math.floor(startX / interval) * interval; i <= endX; i += interval) {
    const isMajor = Math.abs(i % majorInterval) < 0.1

    // 如果缩放太小，只显示主刻度
    if (!showMinorTicks.value && !isMajor) {
      continue
    }

    // 计算刻度在标尺中的位置
    // 水平标尺在 .canvas-ruler-wrapper 中，该容器有 margin-left: 20px
    // 标尺本身是 position: relative，所以刻度位置是相对于标尺容器的
    // 网格线在 canvas-wrapper 中，坐标系统是相对于 canvas-wrapper 的
    // 网格线的 x = xCanvas * zoom + offsetX（相对于 canvas-wrapper）
    // 标尺刻度的 x 也应该是 xCanvas * zoom + offsetX（相对于标尺容器）
    // 由于两个容器是兄弟元素，且标尺容器有 margin-left: 20px
    // 所以标尺刻度的位置计算应该与网格线一致，都是相对于各自容器的
    // 画布的(0,0)对应容器中的(offsetX, offsetY)位置
    const position = i * zoom + props.offsetX

    // 只显示可见区域的刻度（相对于标尺容器）
    if (position >= -100 && position <= viewportWidth + 100) {
      ticks.push({
        value: i,
        position,
        label: formatLabel(i),
        isMajor
      })
    }
  }

  return ticks
})

const verticalTicks = computed(() => {
  const ticks: Array<{ value: number; position: number; label: string; isMajor: boolean }> = []
  const viewportHeight = 2000 // 假设可见区域高度
  const zoom = props.zoom
  const interval = tickInterval.value
  const majorInterval = majorTickInterval.value
  const rulerSize = 20 // 标尺宽度

  // 计算可见区域的起始和结束位置（画布坐标）
  // 标尺从rulerSize位置开始（为水平标尺留出空间）
  const rulerStartY = rulerSize
  const startY = (rulerStartY - props.offsetY) / zoom - 100
  const endY = (rulerStartY - props.offsetY + viewportHeight) / zoom + 100

  // 生成刻度
  for (let i = Math.floor(startY / interval) * interval; i <= endY; i += interval) {
    const isMajor = Math.abs(i % majorInterval) < 0.1

    // 如果缩放太小，只显示主刻度
    if (!showMinorTicks.value && !isMajor) {
      continue
    }

    // 计算刻度在标尺中的位置：画布坐标 * zoom + offsetY
    // 画布的(0,0)对应标尺的(rulerSize, rulerSize)位置
    const position = i * zoom + props.offsetY

    // 只显示可见区域的刻度
    if (position >= rulerStartY - 100 && position <= rulerStartY + viewportHeight + 100) {
      ticks.push({
        value: i,
        position,
        label: formatLabel(i),
        isMajor
      })
    }
  }

  return ticks
})

// 格式化标签，当数值很大时使用科学计数法或简化显示
function formatLabel(value: number): string {
  const absValue = Math.abs(value)

  // 如果数值很大，使用简化显示
  if (absValue >= 10000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return Math.round(value).toString()
}
</script>

<style lang="scss" scoped>
.ruler-corner {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: v-bind('isDark ? "#2d2d2d" : "#e8e8e8"');
  border-right: 1px solid v-bind('isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"');
  border-bottom: 1px solid v-bind('isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"');
}

.ruler-horizontal {
  flex: 1;
  position: relative;
  height: 20px;
  z-index: 30;
}

.ruler-vertical {
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 0;
  width: 20px;
  z-index: 30;
}

.ruler-tick {
  position: absolute;
  border-left: 1px solid v-bind('isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"');
  height: 6px;
  top: 14px;

  &.ruler-tick-major {
    height: 10px;
    top: 10px;
    border-left-width: 1.5px;
    border-left-color: v-bind('isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"');

    .ruler-label {
      top: 10px;
      font-weight: bold;
    }
  }
}

.ruler-vertical .ruler-tick {
  border-left: none;
  border-top: 1px solid v-bind('isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"');
  width: 6px;
  left: 14px;
  height: 0;

  &.ruler-tick-major {
    width: 10px;
    left: 10px;
    border-top-width: 1.5px;
    border-top-color: v-bind('isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"');
    .ruler-label {
      top: 50%;
      left: 10px;
      font-weight: bold;
    }
  }
}

.ruler-label {
  font-size: 10px;
  color: v-bind('isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"');
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 5px;
  user-select: none;
  white-space: nowrap;
  font-family: 'Consolas', 'Monaco', monospace;
  text-align: center;
}

.ruler-vertical .ruler-label {
  left: 5px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: center center;
  margin-left: 0;
}
</style>
