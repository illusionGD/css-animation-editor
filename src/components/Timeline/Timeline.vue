<template>
  <div class="timeline">
    <div class="timeline-head flex-between">
      <div class="timeline-controls-left flex-center">
        <div class="playback-controls flex-center">
          <n-button size="small" quaternary>
            <template #icon>
              <n-icon><component :is="PlaySkipBack" /></n-icon>
            </template>
          </n-button>
          <n-button size="small" quaternary>
            <template #icon>
              <n-icon><component :is="PlayBack" /></n-icon>
            </template>
          </n-button>
          <n-button size="small" type="primary" @click="playAnimation">
            <template #icon>
              <n-icon v-if="animationStore.isPlaying"><component :is="Pause" /></n-icon>
              <n-icon v-else><component :is="Play" /></n-icon>
            </template>
          </n-button>
          <n-button size="small" quaternary>
            <template #icon>
              <n-icon><component :is="PlayForward" /></n-icon>
            </template>
          </n-button>
          <n-button size="small" quaternary>
            <template #icon>
              <n-icon><component :is="PlaySkipForward" /></n-icon>
            </template>
          </n-button>
          <n-button size="small" quaternary @click="showAddChannel">
            <template #icon>
              <n-icon><component :is="Add" /></n-icon>
            </template>
          </n-button>
        </div>

        <n-select
          class="loop-mode-select"
          size="small"
          :options="loopModeOptions"
          placeholder="循环模式"
        />
      </div>
      <div class="timeline-controls-right flex-center">
        <div class="control-item flex-center">
          <span class="control-label">时长</span>
          <n-input-number size="small" class="control-input" :show-button="false">
            <template #suffix>s</template>
          </n-input-number>
        </div>
      </div>
    </div>
    <div class="timeline-bottom">
      <div class="channels">
        <TimelineChannels></TimelineChannels>
      </div>
      <div class="tracks-container">
        <TimelineTracks
          :tracks="animationStore.tracks"
          :current-time="animationStore.currentTime"
          :duration="animationStore.duration"
          :fps="60"
          :zoom="timelineZoom"
          @update:zoom="timelineZoom = $event"
          @keyframe-move="handleKeyFrameMove"
          @keyframe-select="handleKeyFrameSelect"
        />
      </div>
    </div>
    <!-- 添加通道弹窗 -->
    <n-modal
      v-model:show="isShowAddChannelModal"
      title="添加动画通道"
      preset="dialog"
      :closable="true"
      :mask-closable="true"
      size="small"
      positive-text="确定"
      negative-text="取消"
      @positive-click="addChannel"
    >
      <n-select
        v-model:value="selectedProperty"
        :options="availableProperties"
        placeholder="选择CSS属性"
        filterable
        label-field="label"
        value-field="value"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, onMounted, watch, nextTick } from 'vue'
import {
  NButton,
  NInputNumber,
  NEmpty,
  NIcon,
  NModal,
  NSelect,
  NInput,
  NTooltip,
  useMessage
} from 'naive-ui'
import {
  Add,
  Refresh,
  Flash,
  PlaySkipBack,
  PlayBack,
  Pause,
  PlayForward,
  PlaySkipForward,
  Play
} from '@vicons/ionicons5'
import { useAnimationStore } from '@/stores/animationStore'
import TimelineTrack from './TimelineTrack.vue'
import TimelineGrid from './TimelineGrid.vue'
import TimelineRuler from './TimelineRuler.vue'
import TimelineChannels from './TimelineChannels.vue'
import TimelineTracks from './TimelineTracks.vue'
import {
  TIMELINE_BASE_INTERVAL,
  TIMELINE_INTERVALS,
  TIMELINE_DEFAULT_CONTENT_WIDTH,
  TIMELINE_MIN_DURATION,
  TIMELINE_MAX_DURATION,
  TIMELINE_DURATION_STEP,
  TIMELINE_MAJOR_INTERVAL_MULTIPLIER
} from './constants'
import type { AnimationTrack } from '@/types'
import { useGlobalStore } from '@/stores/globalStore'
import { useElementStore } from '@/stores/elementStore'
import { getCSSPropertyByProps, SUPPORTED_CSS_PROPERTIES } from '@/constants/element'

const animationStore = useAnimationStore()
const elementStore = useElementStore()
const globalStore = useGlobalStore()
const message = useMessage()

//#region 顶部操作按钮
const loopModeOptions = [
  { label: '只播放一遍', value: 'normal' },
  { label: '循环播放', value: 'infinite' }
]

// 时间轴缩放
const timelineZoom = ref(100)

function playAnimation() {
  if (animationStore.isPlaying) {
    animationStore.pause()
  } else {
    animationStore.play()
  }
}

// 处理关键帧移动
function handleKeyFrameMove(trackIndex: number, keyFrameIndex: number, newTime: number) {
  // TODO: 更新关键帧时间
  console.log('Move keyframe', trackIndex, keyFrameIndex, newTime)
}

// 处理关键帧选中
function handleKeyFrameSelect(trackIndex: number, keyFrameIndex: number) {
  // TODO: 选中关键帧
  console.log('Select keyframe', trackIndex, keyFrameIndex)
}

//#endregion

//#region 节点通道
const isShowAddChannelModal = ref(false)
const selectedProperty = ref<string | null>(null)
const availableProperties = computed(() => {
  const properties = SUPPORTED_CSS_PROPERTIES.map((group, groupIndex) => ({
    label: group.label,
    type: 'group',
    key: `group-${groupIndex}-${group.props}`,
    children: group.children
      .filter(prop => {
        // 过滤掉已经存在通道的属性
        const existingTrack = animationStore.tracks.find(t => t.property === prop.props)
        return !existingTrack
      })
      .map((prop, propIndex) => ({
        label: prop.label + ` (${prop.props})`,
        value: prop.props,
        key: `${group.props}-${propIndex}-${prop.props}`
      }))
  })).filter(group => group.children.length > 0)

  return properties
})

function showAddChannel() {
  if (!elementStore.hasSelection) {
    message.warning('请先选择一个元素')
    return
  }
  isShowAddChannelModal.value = true
}

function addChannel() {
  if (!selectedProperty.value) {
    message.warning('请选择一个属性')
    return
  }
  animationStore.addTrack(selectedProperty.value!)
  selectedProperty.value = null
}
//#endregion

//#region 时间轴网格和标尺
//#endregion
</script>

<style lang="scss" scoped>
.timeline {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-secondary);
}

.timeline-head {
  padding: 8px 16px;
  background-color: var(--bg-color-primary);
  border-bottom: 1px solid var(--border-color);
  gap: 16px;
}

.timeline-controls-left {
  gap: 12px;
}

.playback-controls {
  gap: 4px;
  padding: 4px;
  background-color: var(--bg-color-secondary);
  border-radius: 4px;

  :deep(.n-button) {
    width: 32px;
    height: 32px;
    padding: 0;
  }
}

.loop-mode-select {
  width: 180px;
}

.timeline-controls-right {
  gap: 16px;
}

.control-item {
  gap: 8px;
}

.control-label {
  font-size: 13px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.control-input {
  width: 80px;

  :deep(.n-input-number) {
    width: 100%;
  }
}

.timeline-bottom {
  flex: 1;
  display: flex;
  overflow: hidden;
  border-top: 1px solid var(--color-border);
}

.channels {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  @include custom-scrollbar;
}

.tracks-container {
  flex: 1;
  overflow: hidden;
}
</style>
