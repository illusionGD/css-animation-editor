<template>
  <n-collapse>
    <n-collapse-item :title="title" :name="title">
      <div class="property-list">
        <PropertyInput
          v-for="property in properties"
          :key="property"
          :property="property"
          :value="getPropertyValue(property)"
          @update="handleUpdate"
        />
      </div>
    </n-collapse-item>
  </n-collapse>
</template>

<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui'
import type { CanvasElement } from '@/types'
import PropertyInput from './PropertyInput.vue'

interface Props {
  title: string
  properties: string[]
  element?: CanvasElement
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

function getPropertyValue(property: string) {
  return props.element?.style[property] || ''
}

function handleUpdate(property: string, value: any) {
  emit('update', property, value)
}
</script>

<style lang="scss" scoped>
.property-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}
</style>
