<template>
  <n-form
    :model="form"
    label-placement="left"
    label-width="130px"
  >
    <n-form-item label="导出格式">
      <n-radio-group
        v-model:value="form.exportFormat"
        @update:value="value => handleChange('exportFormat', value)"
      >
        <n-radio value="css">
          CSS代码
        </n-radio>
        <n-radio value="html">
          CSS+HTML
        </n-radio>
        <n-radio value="json">
          JSON
        </n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="默认动画时长">
      <n-input-number
        v-model:value="form.defaultDuration"
        :min="100"
        :max="60000"
        :step="100"
        style="width: 200px"
        @update:value="value => handleChange('defaultDuration', value || 0)"
      />
      <span style="margin-left: 10px">毫秒</span>
    </n-form-item>
    <n-form-item label="自动保存">
      <n-switch
        v-model:value="form.autoSave"
        @update:value="value => handleChange('autoSave', value)"
      />
    </n-form-item>
    <n-form-item label="代码格式化">
      <n-switch
        v-model:value="form.codeFormat"
        @update:value="value => handleChange('codeFormat', value)"
      />
    </n-form-item>
    <n-form-item label="代码压缩">
      <n-switch
        v-model:value="form.minifyCode"
        @update:value="value => handleChange('minifyCode', value)"
      />
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
import { NForm, NFormItem, NRadioGroup, NRadio, NInputNumber, NSwitch, NButton } from 'naive-ui'
import { useGlobalStore } from '@/stores/globalStore'

interface Props {
  settings: {
    exportFormat: 'css' | 'html' | 'json'
    defaultDuration: number
    autoSave: boolean
    codeFormat: boolean
    minifyCode: boolean
  }
}

type ExportSettingsKey = keyof Props['settings']

const props = defineProps<Props>()
const emit = defineEmits<{
  onReset: [value: Props['settings']]
  onChange: [type: ExportSettingsKey, value: string | number | boolean]
}>()

const globalStore = useGlobalStore()
const form = ref({ ...props.settings })

watch(
  () => props.settings,
  newVal => {
    form.value = { ...newVal }
  }
)

function handleChange(type: ExportSettingsKey, value: string | number | boolean) {
  form.value[type] = value as never
  emit('onChange', type, value)
}

function handleReset() {
  globalStore.resetExportSettings()
  emit('onReset', form.value)
}
</script>

<style lang="scss" scoped></style>
