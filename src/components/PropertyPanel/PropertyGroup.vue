<template>
  <div class="property-group">
    <div class="property-group-header" @click="toggleCollapse">
      <n-icon :component="isCollapsed ? ChevronForwardOutline : ChevronDownOutline" />
      <h4>{{ title }}</h4>
    </div>
    <div v-show="!isCollapsed" class="property-list">
      <PropertyInput
        v-for="propertyConfig in properties"
        :key="propertyConfig.props"
        :property="propertyConfig.props"
        :config="propertyConfig"
        :value="propertyValues[propertyConfig.props] ?? ''"
        @update="handleUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NIcon } from 'naive-ui'
import { ChevronDownOutline, ChevronForwardOutline } from '@vicons/ionicons5'
import type { CSSProperty } from '@/types'
import PropertyInput from './PropertyInput.vue'

interface Props {
  title: string
  properties: CSSProperty[]
  /** 属性值映射：propertyName -> value */
  propertyValues: Record<string, string | number>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleUpdate(property: string, value: any) {
  emit('update', property, value)
}
</script>

<style lang="scss" scoped>
.property-group {
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.property-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--n-color-modal);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;

  &:hover {
    background: var(--n-color-target);
  }

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--n-text-color);
  }
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 12px 0 30px;
  background: var(--n-color);
}
</style>
