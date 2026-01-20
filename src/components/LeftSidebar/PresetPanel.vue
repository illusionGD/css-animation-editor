<template>
  <div class="preset-panel">
    <div class="preset-panel-header">
      <n-input
        :value="presetStore.searchQuery"
        placeholder="搜索预设..."
        clearable
        size="small"
        @update:value="presetStore.setSearchQuery"
      >
        <template #prefix>
          <n-icon><SearchIcon /></n-icon>
        </template>
      </n-input>
    </div>
    <div class="preset-panel-content">
      <div
        v-if="presetStore.filteredPresets.length > 0"
        class="preset-list"
      >
        <div
          v-for="preset in presetStore.filteredPresets"
          :key="preset.id"
          class="preset-item"
          @click="applyPreset(preset)"
        >
          <div class="preset-name">
            {{ preset.name }}
          </div>
          <div
            v-if="preset.description"
            class="preset-description"
          >
            {{ preset.description }}
          </div>
          <div class="preset-category">
            {{ preset.category }}
          </div>
        </div>
      </div>
      <n-empty
        v-else
        description="暂无预设"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput, NIcon, NEmpty, useMessage } from 'naive-ui'
import { usePresetStore } from '@/stores/presetStore'
import { useAnimationStore } from '@/stores/animationStore'
import { Search } from '@vicons/ionicons5'
import type { PresetSchema } from '@/types'

const SearchIcon = Search
const message = useMessage()

const presetStore = usePresetStore()
const animationStore = useAnimationStore()

// 根据预设的 tags 或名称推断属性
function inferPropertyFromPreset(preset: PresetSchema): string | null {
  const tags = preset.tags || []
  const name = preset.name.toLowerCase()

  // 根据 tags 推断
  if (tags.includes('opacity') || tags.includes('fade')) {
    return 'opacity'
  }
  if (tags.includes('translate') || tags.includes('slide')) {
    if (name.includes('left') || name.includes('右')) {
      return 'translateX'
    }
    if (name.includes('right') || name.includes('左')) {
      return 'translateX'
    }
    if (name.includes('up') || name.includes('上')) {
      return 'translateY'
    }
    if (name.includes('down') || name.includes('下')) {
      return 'translateY'
    }
    // 默认 X 轴
    return 'translateX'
  }
  if (tags.includes('scale')) {
    if (name.includes('x')) {
      return 'scaleX'
    }
    if (name.includes('y')) {
      return 'scaleY'
    }
    // 默认同时应用 scaleX 和 scaleY
    return 'scaleX'
  }
  if (tags.includes('rotate')) {
    return 'rotate'
  }

  // 根据名称推断
  if (name.includes('淡入') || name.includes('淡出') || name.includes('fade')) {
    return 'opacity'
  }
  if (name.includes('滑') || name.includes('slide')) {
    return 'translateX'
  }
  if (name.includes('缩放') || name.includes('scale')) {
    return 'scaleX'
  }
  if (name.includes('旋转') || name.includes('rotate')) {
    return 'rotate'
  }

  return null
}

function applyPreset(preset: PresetSchema) {
  // 检查是否有选中的元素
  if (!animationStore.selectedElementId) {
    message.warning('请先选择一个画布元素')
    return
  }

  const property = inferPropertyFromPreset(preset)
  if (!property) {
    message.warning('无法识别预设的属性类型')
    return
  }

  // 设置动画时长
  if (preset.animation.duration) {
    animationStore.setDuration(preset.animation.duration)
  }

  // 确保 track 存在
  if (!animationStore.tracks.find(t => t.property === property)) {
    animationStore.addTrack(property)
  }

  // 如果是 scale 预设，同时应用 scaleY
  if (property === 'scaleX' && preset.tags?.includes('scale')) {
    if (!animationStore.tracks.find(t => t.property === 'scaleY')) {
      animationStore.addTrack('scaleY')
    }
  }

  // 清除该属性的现有关键帧
  const track = animationStore.tracks.find(t => t.property === property)
  if (track) {
    track.keyframes = []
  }

  // 应用关键帧
  if (preset.animation.keyframes && preset.animation.keyframes.length > 0) {
    preset.animation.keyframes.forEach(kf => {
      animationStore.addKeyframe(property, {
        time: kf.time,
        value: kf.value
      })
    })

    // 如果是 scaleX，同时应用到 scaleY
    if (property === 'scaleX' && preset.tags?.includes('scale')) {
      const scaleYTrack = animationStore.tracks.find(t => t.property === 'scaleY')
      if (scaleYTrack) {
        scaleYTrack.keyframes = []
        preset.animation.keyframes.forEach(kf => {
          animationStore.addKeyframe('scaleY', {
            time: kf.time,
            value: kf.value
          })
        })
      }
    }
  }

  message.success(`已应用预设：${preset.name}`)
}
</script>

<style lang="scss" scoped>
.preset-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preset-panel-header {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.preset-panel-content {
  flex: 1;
  overflow: auto;
  @include custom-scrollbar;
}

.preset-list {
  padding: 8px;
}

.preset-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--n-colorHover);
    border-color: var(--n-colorPrimary);
  }

  .preset-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .preset-description {
    font-size: 12px;
    color: var(--n-textColor2);
    margin-bottom: 4px;
  }

  .preset-category {
    font-size: 11px;
    color: var(--n-textColor3);
  }
}
</style>
