<template>
  <div class="property-panel">
    <div class="property-panel-header">
      <h3>属性面板</h3>
      <n-text v-if="hasSelection && selectedElement" depth="3" class="element-name">
        {{ selectedElement.name || selectedElement.id }}
      </n-text>
    </div>
    <div class="property-panel-content">
      <n-empty v-if="!hasSelection" description="请选择一个元素" />
      <div v-else class="property-groups">
        <PropertyGroup
          v-for="group in propertyGroups"
          :key="group.name"
          :title="group.name"
          :properties="group.properties"
          :property-values="propertyValues"
          @update="handleUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { NEmpty, NText } from 'naive-ui'
import { useElementStore } from '@/stores/elementStore'
import { useAnimationStore } from '@/stores/animationStore'
import PropertyGroup from './PropertyGroup.vue'
import { interpolateKeyframes } from '@/utils/calculators'
import type { CSSProperty } from '@/types'
import { SUPPORTED_CSS_PROPERTIES } from '@/constants/element'
import { useCanvasStore } from '@/stores/canvasStore'

const elementStore = useElementStore()
const animationStore = useAnimationStore()
const canvasStore = useCanvasStore()

// 从 elementStore 获取选中元素
const hasSelection = computed(() => elementStore.hasSelection)
const selectedElement = computed(() => elementStore.firstSelectedElement)

// 获取当前选中元素的动画轨道（从 elementStore 获取）
const tracks = computed(() => {
  if (!selectedElement.value) return []
  return elementStore.getElementTracks(selectedElement.value.id)
})

// 计算属性值：根据是否有选中关键帧或当前播放时间点
const propertyValues = computed(() => {
  if (!selectedElement.value) return {}

  const values: Record<string, string | number> = {}
  const element = selectedElement.value
  const currentProgress = animationStore.currentProgress

  // 获取选中的关键帧信息（如果有）
  const selectedKeyframe = animationStore.selectedKeyframe

  // 遍历所有可动画属性
  const allProperties: CSSProperty[] = []
  SUPPORTED_CSS_PROPERTIES.forEach(group => {
    allProperties.push(...group.children)
  })

  allProperties.forEach(propConfig => {
    const property = propConfig.props
    let value: string | number | undefined

    // 如果当前属性是选中的关键帧属性，使用关键帧的值
    if (selectedKeyframe && selectedKeyframe.property === property) {
      const track = tracks.value.find(t => t.property === property)
      if (track && track.keyframes[selectedKeyframe.keyframeIndex]) {
        const keyframe = track.keyframes[selectedKeyframe.keyframeIndex]
        value = keyframe.value
      }
    }

    // 如果不是选中关键帧的属性，根据当前播放时间点计算
    if (value === undefined) {
      // 优先从动画轨道中获取当前时间点的值
      const track = tracks.value.find(t => t.property === property)
      if (track && track.keyframes.length > 0) {
        const interpolatedValue = interpolateKeyframes(track.keyframes, currentProgress)
        if (interpolatedValue !== undefined) {
          value = interpolatedValue
        }
      }
    }

    // 如果没有 k 帧或插值失败，从 style 中获取
    if (value === undefined) {
      const styleValue = element.style[property]
      if (styleValue !== undefined && styleValue !== null && styleValue !== '') {
        // 如果是数字字符串，尝试转换为数字
        if (typeof styleValue === 'string') {
          const num = parseFloat(styleValue)
          if (!isNaN(num)) {
            value = num
          } else {
            value = styleValue
          }
        } else {
          value = styleValue
        }
      }
    }

    // 如果是 transform 相关属性，尝试从 style 中解析
    if (value === undefined) {
      const transformProps = [
        'translateX',
        'translateY',
        'scaleX',
        'scaleY',
        'rotate',
        'skewX',
        'skewY'
      ]
      if (transformProps.includes(property)) {
        const transform = element.style.transform as string
        if (transform && transform !== 'none') {
          const match = transform.match(new RegExp(`${property}\\(([^)]+)\\)`))
          if (match) {
            const parsedValue = match[1].replace(/[^\d.-]/g, '')
            const num = parseFloat(parsedValue)
            value = isNaN(num) ? 0 : num
          }
        }
      }
    }

    // 如果还是没有值，使用默认值
    if (value === undefined) {
      value = propConfig.defaultValue ?? ''
    }

    values[property] = value
  })

  return values
})

// 属性分组：显示所有可动画属性
const propertyGroups = computed(() => {
  return SUPPORTED_CSS_PROPERTIES.map(group => ({
    name: group.label,
    properties: group.children
  })).filter(group => group.properties.length > 0)
})

function handleUpdate(property: string, value: any) {
  if (!selectedElement.value) return

  // 如果没有选中关键帧，更新元素的属性
  const element = selectedElement.value
  const styles = {
    [property]: value
  }

  // 使用 elementStore 更新元素
  elementStore.updateElementStyle(element.id, styles)

  // 更新canvas
  canvasStore.updateElementStyle(element.id, styles)
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
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .element-name {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }
}

.property-panel-content {
  flex: 1;
  overflow: auto;
  @include custom-scrollbar;
}

.property-groups {
  display: flex;
  flex-direction: column;
}
</style>
