<template>
  <div class="property-panel">
    <div class="property-panel-header">
      <h3>属性面板</h3>
    </div>
    <div class="property-panel-content">
      <n-empty v-if="!hasSelection" description="请选择一个元素" />
      <div v-else class="property-groups">
        <PropertyGroup
          v-for="group in propertyGroups"
          :key="group.name"
          :title="group.name"
          :properties="group.properties"
          :element="selectedElement"
          @update="handleUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NEmpty } from 'naive-ui'
import { useCanvasStore } from '@/stores/canvasStore'
import { useAnimationStore } from '@/stores/animationStore'
import { useUIStore } from '@/stores/uiStore'
import PropertyGroup from './PropertyGroup.vue'
import type { CanvasElement } from '@/types'

const canvasStore = useCanvasStore()
const animationStore = useAnimationStore()
const uiStore = useUIStore()

const hasSelection = computed(() => canvasStore.hasSelection)
const selectedElement = computed(() => canvasStore.selectedElements[0])

const propertyGroups = computed(() => [
  {
    name: 'Transform',
    properties: ['translateX', 'translateY', 'scaleX', 'scaleY', 'rotate', 'skewX', 'skewY']
  },
  {
    name: 'Layout',
    properties: ['width', 'height', 'margin', 'padding']
  },
  {
    name: 'Color',
    properties: ['color', 'backgroundColor', 'borderColor']
  },
  {
    name: 'Effects',
    properties: ['opacity', 'filter', 'boxShadow']
  }
])

function handleUpdate(property: string, value: any) {
  if (!selectedElement.value) return

  const element = selectedElement.value
  const updates: Partial<CanvasElement> = {}

  // 处理 width/height - 同时更新 size 和 style
  if (property === 'width' || property === 'height') {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
    updates.size = {
      ...element.size,
      [property]: numValue
    }
    updates.style = {
      ...element.style,
      [property]: `${numValue}px`
    }
  }
  // 处理 transform 属性 - 转换为 CSS transform
  else if (
    ['translateX', 'translateY', 'scaleX', 'scaleY', 'rotate', 'skewX', 'skewY'].includes(property)
  ) {
    const transformParts: string[] = []
    const transformMap: Record<string, string> = {
      translateX: 'translateX',
      translateY: 'translateY',
      scaleX: 'scaleX',
      scaleY: 'scaleY',
      rotate: 'rotate',
      skewX: 'skewX',
      skewY: 'skewY'
    }

    // 获取所有 transform 属性的值
    const transformProps = [
      'translateX',
      'translateY',
      'scaleX',
      'scaleY',
      'rotate',
      'skewX',
      'skewY'
    ]
    transformProps.forEach(prop => {
      let propValue = prop === property ? value : element.style[prop]

      if (propValue !== undefined && propValue !== null && propValue !== '') {
        const numValue =
          typeof propValue === 'number' ? propValue : parseFloat(String(propValue)) || 0
        const unit =
          prop === 'rotate' || prop === 'skewX' || prop === 'skewY'
            ? 'deg'
            : prop === 'scaleX' || prop === 'scaleY'
              ? ''
              : 'px'
        transformParts.push(`${transformMap[prop]}(${numValue}${unit})`)
      }
    })

    // 构建 transform 字符串
    const transformValue = transformParts.length > 0 ? transformParts.join(' ') : 'none'

    // 更新 style，保留 transform 属性用于编辑，同时设置 CSS transform
    const newStyle = { ...element.style }
    newStyle[property] = value
    newStyle.transform = transformValue

    updates.style = newStyle
  }
  // 处理其他样式属性
  else {
    updates.style = {
      ...element.style,
      [property]: value
    }
  }

  canvasStore.updateElement(element.id, updates)

  // 自动K帧：如果启用了自动K帧，且当前有选中元素，自动在当前时间点添加关键帧
  if (uiStore.autoKeyframe && animationStore.selectedElementId === element.id) {
    // 确保 track 存在
    if (!animationStore.tracks.find(t => t.property === property)) {
      animationStore.addTrack(property)
    }

    // 检查当前时间是否已有关键帧
    const track = animationStore.tracks.find(t => t.property === property)
    if (track) {
      const currentProgress = animationStore.currentProgress
      const tolerance = 0.01
      const existingIndex = track.keyframes.findIndex(
        kf => Math.abs(kf.time - currentProgress) < tolerance
      )

      // 如果当前时间没有关键帧，添加一个
      if (existingIndex < 0) {
        // 转换 value 为合适的格式
        let keyframeValue: number | string = value
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          keyframeValue = parseFloat(value)
        } else if (typeof value === 'number') {
          keyframeValue = value
        }

        animationStore.addKeyframe(property, {
          time: currentProgress,
          value: keyframeValue
        })
      } else {
        // 如果已有关键帧，更新其值
        animationStore.updateKeyframe(property, existingIndex, { value })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.property-panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--n-borderColor);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.property-panel-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  @include custom-scrollbar;
}

.property-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
