<template>
  <n-modal :show="show" @update:show="(val) => emit('update:show', val)" preset="dialog" title="设置" style="width: 600px">
    <n-form :model="settings" label-placement="left" label-width="120px">
      <n-form-item label="导出格式">
        <n-radio-group v-model:value="settings.exportFormat">
          <n-radio value="css">CSS代码</n-radio>
          <n-radio value="html">CSS+HTML</n-radio>
          <n-radio value="json">JSON</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="默认动画时长">
        <n-input-number
          v-model:value="settings.defaultDuration"
          :min="100"
          :max="10000"
          :step="100"
          style="width: 200px"
        />
        <span style="margin-left: 10px">毫秒</span>
      </n-form-item>
      <n-form-item label="自动保存">
        <n-switch v-model:value="settings.autoSave" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-space>
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleConfirm">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NRadioGroup, NRadio, NInputNumber, NSwitch, NButton, NSpace } from 'naive-ui'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const uiStore = useUIStore()
const settings = ref({ ...uiStore.settings })

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      settings.value = { ...uiStore.settings }
    }
  }
)

function handleConfirm() {
  uiStore.updateSettings(settings.value)
  emit('update:show', false)
}

function handleCancel() {
  emit('update:show', false)
}
</script>

<style lang="scss" scoped></style>
