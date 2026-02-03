<template>
  <n-form
    :model="form"
    label-placement="left"
    label-width="130px"
  >
    <n-form-item label="暗色模式">
      <n-switch
        v-model:value="form.isDarkMode"
        @update:value="value => handleChange('isDarkMode', value)"
      />
      <span style="margin-left: 15px; color: var(--n-text-color-2)">
        {{ form.isDarkMode ? '启用' : '禁用' }}
      </span>
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
import { NForm, NFormItem, NSwitch, NButton, darkTheme } from 'naive-ui'
import type { ThemeSettings as ThemeSettingsType } from '@/stores/globalStore'
import { useGlobalStore } from '@/stores/globalStore'

interface Props {
  settings: ThemeSettingsType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  onReset: [value: Props['settings']]
  onChange: [type: 'isDarkMode', value: boolean]
}>()

const globalStore = useGlobalStore()
const form = ref({ ...props.settings })

watch(
  () => props.settings,
  newVal => {
    form.value = { ...newVal }
  }
)

function handleChange(type: 'isDarkMode', value: boolean) {
  form.value.isDarkMode = value
  emit('onChange', type, value)
}

function handleReset() {
  globalStore.setThemeSettings({ isDarkMode: true, theme: darkTheme })
  emit('onReset', form.value)
}
</script>

<style lang="scss" scoped></style>
