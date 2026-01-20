<template>
  <div
    class="selection-box"
    :style="boxStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  box: { x: number; y: number; width: number; height: number }
}

const props = defineProps<Props>()

const boxStyle = computed(() => ({
  position: 'absolute',
  left: `${props.box.x}px`,
  top: `${props.box.y}px`,
  width: `${props.box.width}px`,
  height: `${props.box.height}px`,
  border: '1px dashed #18a058',
  background: 'rgba(24, 160, 88, 0.1)',
  pointerEvents: 'none'
}))
</script>

<style lang="scss" scoped>
.selection-box {
  position: absolute;
  pointer-events: none;
}
</style>
