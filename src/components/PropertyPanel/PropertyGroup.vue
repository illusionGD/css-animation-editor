<template>
  <n-collapse>
    <n-collapse-item
      :title="title"
      :name="title"
      default-expanded
    >
      <div class="property-list">
        <PropertyInput
          v-for="propertyConfig in properties"
          :key="propertyConfig.name"
          :property="propertyConfig.name"
          :config="propertyConfig"
          :value="propertyValues[propertyConfig.name] ?? ''"
          @update="handleUpdate"
        />
      </div>
    </n-collapse-item>
  </n-collapse>
</template>

<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui'
import type { AnimatableProperty } from './animatableProperties'
import PropertyInput from './PropertyInput.vue'

interface Props {
  title: string
  properties: AnimatableProperty[]
  /** 属性值映射：propertyName -> value */
  propertyValues: Record<string, string | number>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

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
