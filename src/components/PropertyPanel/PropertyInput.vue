<template>
  <div class="property-input">
    <n-tooltip
      trigger="hover"
      placement="top"
    >
      <template #trigger>
        <label class="property-label">{{ config?.label || property }}</label>
      </template>
      <span class="tips-text">{{ property }}</span>
    </n-tooltip>
    <div class="property-input-wrapper">
      <!-- 数字输入 -->
      <n-input-number
        v-if="config?.type === 'number'"
        v-model:value="numberValue"
        :min="config.min"
        :max="config.max"
        :step="config.step"
        size="small"
        :show-button="false"
        :placeholder="config.defaultValue?.toString()"
        @update:value="handleNumberUpdate"
      >
        <template
          v-if="config.unit"
          #suffix
        >
          <span class="unit">{{ config.unit }}</span>
        </template>
      </n-input-number>
      <!-- 颜色选择器 -->
      <n-color-picker
        v-else-if="config?.type === 'color'"
        v-model:value="colorValue"
        size="small"
        @update:value="handleColorUpdate"
      />
      <!-- 字符串输入 -->
      <n-input
        v-else
        v-model:value="stringValue"
        size="small"
        :placeholder="config?.defaultValue?.toString()"
        @update:value="handleStringUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NInputNumber, NColorPicker, NTooltip } from 'naive-ui'
import type { CSSProperty } from '@/types'
import { getCSSPropertyByProps } from '@/constants/element'

interface Props {
  /** 属性名 */
  property: string
  /** 属性值 */
  value: string | number
  /** 属性配置（可选，如果不提供则根据属性名查找） */
  config?: CSSProperty
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

// 获取属性配置
const config = computed(() => {
  return props.config || getCSSPropertyByProps(props.property)
})

// 根据配置类型初始化值
function getInitialNumberValue(): number {
  if (config.value?.type === 'number') {
    const num = typeof props.value === 'number' ? props.value : parseFloat(String(props.value))
    return isNaN(num) ? (config.value.defaultValue as number) || 0 : num
  }
  return 0
}

function getInitialStringValue(): string {
  if (config.value?.type === 'string' || !config.value) {
    return String(props.value || config.value?.defaultValue || '')
  }
  return ''
}

function getInitialColorValue(): string {
  if (config.value?.type === 'color') {
    return String(props.value || config.value.defaultValue || '#000000')
  }
  return '#000000'
}

const numberValue = ref<number>(getInitialNumberValue())
const stringValue = ref<string>(getInitialStringValue())
const colorValue = ref<string>(getInitialColorValue())

// 监听外部值变化
watch(
  () => props.value,
  newVal => {
    const currentConfig = config.value
    if (currentConfig?.type === 'number') {
      const num = typeof newVal === 'number' ? newVal : parseFloat(String(newVal))
      numberValue.value = isNaN(num) ? (currentConfig.defaultValue as number) || 0 : num
    } else if (currentConfig?.type === 'color') {
      colorValue.value = String(newVal || currentConfig.defaultValue || '#000000')
    } else {
      stringValue.value = String(newVal || currentConfig?.defaultValue || '')
    }
  },
  { immediate: true }
)

watch(
  () => config.value,
  newConfig => {
    const currentVal = props.value
    if (newConfig?.type === 'number') {
      const num = typeof currentVal === 'number' ? currentVal : parseFloat(String(currentVal))
      numberValue.value = isNaN(num) ? (newConfig.defaultValue as number) || 0 : num
    } else if (newConfig?.type === 'color') {
      colorValue.value = String(currentVal || newConfig.defaultValue || '#000000')
    } else {
      stringValue.value = String(currentVal || newConfig?.defaultValue || '')
    }
  }
)

function handleNumberUpdate(val: number | null) {
  const finalValue = val ?? config.value?.defaultValue ?? 0
  emit('update', props.property, finalValue)
}

function handleStringUpdate(val: string | null) {
  const finalValue = val ?? config.value?.defaultValue ?? ''
  emit('update', props.property, finalValue)
}

function handleColorUpdate(val: string | null) {
  const finalValue = val ?? config.value?.defaultValue ?? '#000000'
  emit('update', props.property, finalValue)
}
</script>

<style lang="scss" scoped>
.property-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.tips-text {
    font-size: 12px;
  color: #fff;
}

.property-label {
  min-width: 100px;
  font-size: 13px;
  color: #fff;
  font-weight: 500;
  cursor: help;
  user-select: none;
}

.property-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.unit {
  font-size: 12px;
  color: var(--n-textColor2);
  padding: 0 8px;
}
</style>
