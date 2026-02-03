<template>
  <div
    class="canvas-grid"
    :style="gridStyle"
  >
    <canvas
      ref="gridCanvas"
      class="grid-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT } from '@/constants'
import { useGlobalStore } from '@/stores/globalStore'

interface Props {
  gridSize: number
  zoom: number
  offsetX: number
  offsetY: number
  canvasWidth: number
  canvasHeight: number
}

const props = defineProps<Props>()
const gridCanvas = ref<HTMLCanvasElement>()

const globalStore = useGlobalStore()

const isDark = computed(() => globalStore.themeSettings.isDarkMode)

const gridStyle = computed(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none' as const,
  zIndex: 0,
  overflow: 'hidden' as const
}))

function drawGrid() {
  if (!gridCanvas.value) return

  const canvas = gridCanvas.value
  const container = canvas.parentElement as HTMLElement

  if (!container) return

  // 获取容器（canvas-wrapper）的尺寸
  const rect = container.getBoundingClientRect()
  const width = rect.width || container.clientWidth || CANVAS_DEFAULT_WIDTH
  const height = rect.height || container.clientHeight || CANVAS_DEFAULT_HEIGHT

  // 设置 canvas 尺寸（考虑设备像素比）
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 缩放上下文以匹配设备像素比
  ctx.scale(dpr, dpr)

  // 清除画布
  ctx.clearRect(0, 0, width, height)

  // 根据主题设置颜色
  const minorGridColor = isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
  const majorGridColor = isDark.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
  const originLineColor = isDark.value ? 'rgba(255, 100, 100, 0.4)' : 'rgba(255, 0, 0, 0.4)'

  // 网格大小应该与标尺的刻度间隔匹配
  // 标尺基础间隔是 50，主刻度间隔是 250
  // 为了对齐，我们使用 50 作为基础网格大小，250 作为主网格大小
  const baseGridSize = 50 // 与标尺的 baseTickInterval 匹配
  const majorGridSize = 250 // 与标尺的 baseMajorTickInterval 匹配
  const zoom = props.zoom

  // 计算画布在容器中的位置（考虑 offset 和 zoom）
  // 画布使用 transformOrigin: 'top left'，所以画布的左上角在 (offsetX, offsetY) 位置
  // 画布的(0,0)对应容器中的(offsetX, offsetY)位置
  // 注意：canvas-wrapper 和 canvas-ruler-wrapper 是兄弟元素
  // canvas-ruler-wrapper 有 margin-left: 20px，但 canvas-wrapper 没有
  // 所以网格线的坐标系统是相对于 canvas-wrapper 的，不需要考虑 ruler 的 margin
  const canvasLeft = props.offsetX
  const canvasTop = props.offsetY

  // 计算可见区域的网格范围（画布坐标系统）
  // 将容器坐标转换为画布坐标：画布坐标 = (容器坐标 - offset) / zoom
  // 然后对齐到网格，再转换回容器坐标：容器坐标 = 画布坐标 * zoom + offset
  // 使用 baseGridSize 作为基础网格大小，与标尺对齐
  const visibleStartXCanvas = Math.floor((0 - canvasLeft) / zoom / baseGridSize) * baseGridSize
  const visibleStartYCanvas = Math.floor((0 - canvasTop) / zoom / baseGridSize) * baseGridSize
  const visibleEndXCanvas = Math.ceil((width - canvasLeft) / zoom / baseGridSize) * baseGridSize
  const visibleEndYCanvas = Math.ceil((height - canvasTop) / zoom / baseGridSize) * baseGridSize

  // 绘制主网格（粗线）
  ctx.strokeStyle = majorGridColor
  ctx.lineWidth = 1

  // 垂直主网格线（画布坐标转换为容器坐标）
  // 主网格线每 majorGridSize 一个，所以直接按 majorGridSize 步长绘制
  const startMajorX = Math.floor(visibleStartXCanvas / majorGridSize) * majorGridSize
  const endMajorX = Math.ceil(visibleEndXCanvas / majorGridSize) * majorGridSize
  for (let xCanvas = startMajorX; xCanvas <= endMajorX; xCanvas += majorGridSize) {
    const x = xCanvas * zoom + canvasLeft
    if (x >= 0 && x <= width) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  // 水平主网格线（画布坐标转换为容器坐标）
  const startMajorY = Math.floor(visibleStartYCanvas / majorGridSize) * majorGridSize
  const endMajorY = Math.ceil(visibleEndYCanvas / majorGridSize) * majorGridSize
  for (let yCanvas = startMajorY; yCanvas <= endMajorY; yCanvas += majorGridSize) {
    const y = yCanvas * zoom + canvasTop
    if (y >= 0 && y <= height) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // 绘制次网格（细线）
  ctx.strokeStyle = minorGridColor
  ctx.lineWidth = 0.5

  // 垂直次网格线（画布坐标转换为容器坐标）
  // 使用 baseGridSize 作为步长，与标尺的小刻度对齐
  for (let xCanvas = visibleStartXCanvas; xCanvas <= visibleEndXCanvas; xCanvas += baseGridSize) {
    // 跳过主网格线
    const isMajor = Math.abs(xCanvas % majorGridSize) < 0.01
    if (isMajor) continue

    const x = xCanvas * zoom + canvasLeft
    if (x >= 0 && x <= width) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  // 水平次网格线（画布坐标转换为容器坐标）
  for (let yCanvas = visibleStartYCanvas; yCanvas <= visibleEndYCanvas; yCanvas += baseGridSize) {
    // 跳过主网格线
    const isMajor = Math.abs(yCanvas % majorGridSize) < 0.01
    if (isMajor) continue

    const y = yCanvas * zoom + canvasTop
    if (y >= 0 && y <= height) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // 绘制原点坐标轴（红色）
  // 画布的(0,0)对应容器中的(offsetX, offsetY)位置
  ctx.strokeStyle = originLineColor
  ctx.lineWidth = 1.5

  // 垂直原点线（X=0）- 画布的X=0对应容器中的offsetX位置
  const originX = props.offsetX
  if (originX >= 0 && originX <= width) {
    ctx.beginPath()
    ctx.moveTo(originX, 0)
    ctx.lineTo(originX, height)
    ctx.stroke()
  }

  // 水平原点线（Y=0）- 画布的Y=0对应容器中的offsetY位置
  const originY = props.offsetY
  if (originY >= 0 && originY <= height) {
    ctx.beginPath()
    ctx.moveTo(0, originY)
    ctx.lineTo(width, originY)
    ctx.stroke()
  }
}

// 使用 ResizeObserver 监听容器大小变化
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // 延迟一下确保 DOM 已经渲染
  setTimeout(() => {
    if (gridCanvas.value) {
      drawGrid()
      // 监听容器大小变化
      if (gridCanvas.value.parentElement) {
        resizeObserver = new ResizeObserver(() => {
          nextTick(() => {
            drawGrid()
          })
        })
        resizeObserver.observe(gridCanvas.value.parentElement)
      }
    }
  }, 100)
})

watch(
  [
    () => props.gridSize,
    () => props.zoom,
    () => props.offsetX,
    () => props.offsetY,
    () => props.canvasWidth,
    () => props.canvasHeight,
    isDark
  ],
  () => {
    nextTick(() => {
      drawGrid()
    })
  }
)

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.grid-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
