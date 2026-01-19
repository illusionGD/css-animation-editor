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
import PropertyGroup from './PropertyGroup.vue'

const canvasStore = useCanvasStore()

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
  if (selectedElement.value) {
    canvasStore.updateElement(selectedElement.value.id, {
      style: {
        ...selectedElement.value.style,
        [property]: value
      }
    })
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
}

.property-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
