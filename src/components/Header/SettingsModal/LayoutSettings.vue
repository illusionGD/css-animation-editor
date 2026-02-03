<template>
  <n-form
    :model="form"
    label-placement="left"
    label-width="130px"
  >
    <n-form-item label="画布宽度">
      <n-input-number
        v-model:value="form.canvasWidth"
        :min="400"
        style="width: 200px"
        @update:value="value => handleChange('canvasWidth', value || 0)"
      />
      <span style="margin-left: 10px">像素</span>
    </n-form-item>
    <n-form-item label="画布高度">
      <n-input-number
        v-model:value="form.canvasHeight"
        :min="300"
        style="width: 200px"
        @update:value="value => handleChange('canvasHeight', value || 0)"
      />
      <span style="margin-left: 10px">像素</span>
    </n-form-item>
    <n-form-item label="左侧边栏宽度">
      <n-input-number
        v-model:value="form.leftSidebarWidth"
        :min="200"
        :max="600"
        style="width: 200px"
        @update:value="value => handleChange('leftSidebarWidth', value || 0)"
      />
      <span style="margin-left: 10px">像素</span>
    </n-form-item>
    <n-form-item label="右侧边栏宽度">
      <n-input-number
        v-model:value="form.rightSidebarWidth"
        :min="200"
        :max="600"
        style="width: 200px"
        @update:value="value => handleChange('rightSidebarWidth', value || 0)"
      />
      <span style="margin-left: 10px">像素</span>
    </n-form-item>
    <n-form-item label="时间轴高度">
      <n-input-number
        v-model:value="form.timelineHeight"
        :min="150"
        :max="400"
        style="width: 200px"
        @update:value="value => handleChange('timelineHeight', value || 0)"
      />
      <span style="margin-left: 10px">像素</span>
    </n-form-item>
    <n-form-item>
      <n-button
        type="default"
        @click="handleReset"
      >
        重置为默认值
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInputNumber, NButton } from 'naive-ui'
import { useGlobalStore } from '@/stores/globalStore'

interface Props {
  settings: {
    canvasWidth: number
    canvasHeight: number
    leftSidebarWidth: number
    rightSidebarWidth: number
    timelineHeight: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  onReset: [value: Props['settings']]
  onChange: [type: keyof Props['settings'], value: number]
}>()

const globalStore = useGlobalStore()
const form = ref({ ...props.settings })

watch(
  () => props.settings,
  newVal => {
    form.value = { ...newVal }
  }
)

function handleChange(type: keyof Props['settings'], value: number) {
  form.value[type] = value
  emit('onChange', type, value)
}

function handleReset() {
  globalStore.resetLayoutSettings()
  emit('onReset', form.value)
}
</script>

<style lang="scss" scoped></style>
