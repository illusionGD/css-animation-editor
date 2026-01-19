<template>
  <div class="property-input">
    <label class="property-label">{{ property }}</label>
    <n-input
      v-if="isNumber"
      v-model:value="numberValue"
      type="number"
      size="small"
      @update:value="handleNumberUpdate"
    />
    <n-color-picker
      v-else-if="isColor"
      v-model:value="colorValue"
      size="small"
      @update:value="handleColorUpdate"
    />
    <n-input v-else v-model:value="stringValue" size="small" @update:value="handleStringUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NColorPicker } from 'naive-ui'

interface Props {
  property: string
  value: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

const isNumber = computed(() => {
  const numberProps = [
    'width',
    'height',
    'translateX',
    'translateY',
    'scaleX',
    'scaleY',
    'rotate',
    'opacity'
  ]
  return numberProps.includes(props.property)
})

const isColor = computed(() => {
  const colorProps = ['color', 'backgroundColor', 'borderColor']
  return colorProps.includes(props.property)
})

const numberValue = ref(
  typeof props.value === 'number' ? props.value : parseFloat(String(props.value)) || 0
)
const stringValue = ref(String(props.value || ''))
const colorValue = ref(String(props.value || '#000000'))

watch(
  () => props.value,
  newVal => {
    if (isNumber.value) {
      numberValue.value = typeof newVal === 'number' ? newVal : parseFloat(String(newVal)) || 0
    } else if (isColor.value) {
      colorValue.value = String(newVal || '#000000')
    } else {
      stringValue.value = String(newVal || '')
    }
  }
)

function handleNumberUpdate(val: number | null) {
  emit('update', props.property, val || 0)
}

function handleStringUpdate(val: string | null) {
  emit('update', props.property, val || '')
}

function handleColorUpdate(val: string | null) {
  emit('update', props.property, val || '#000000')
}
</script>

<style lang="scss" scoped>
.property-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-label {
  min-width: 100px;
  font-size: 12px;
  color: var(--n-textColor2);
}
</style>
