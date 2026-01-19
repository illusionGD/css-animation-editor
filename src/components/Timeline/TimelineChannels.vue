<template>
  <div class="timeline-channels">
    <div class="channels-list">
      <div
        v-for="track in tracks"
        :key="track.property"
        class="channel-item"
        :class="{ active: selectedChannel === track.property }"
        @click="selectChannel(track.property)"
      >
        <div class="channel-label">
          <span class="channel-name">{{ getPropertyLabel(track.property) }}</span>
        </div>
        <div class="channel-actions">
          <button
            class="keyframe-btn"
            :class="{ active: hasKeyframeAtCurrentTime(track) }"
            title="添加/删除关键帧"
            @click.stop="toggleKeyframe(track.property)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 0L11.1962 3V9L6 12L0.803848 9V3L6 0Z"
                :fill="hasKeyframeAtCurrentTime(track) ? '#18a058' : 'currentColor'"
              />
            </svg>
          </button>
          <button class="remove-btn" title="删除通道" @click.stop="removeChannel(track.property)">
            <n-icon><CloseIcon /></n-icon>
          </button>
        </div>
      </div>
      <n-empty
        v-if="tracks.length === 0"
        description="请先选择一个元素，然后添加通道"
        size="small"
        style="padding: 20px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon, NEmpty } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import { useAnimationStore } from '@/stores/animationStore'
import type { AnimationTrack } from '@/types'

const CloseIcon = Close

interface Props {
  tracks: AnimationTrack[]
  currentTime: number
  duration: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'add-keyframe': [property: string, time: number]
}>()

const animationStore = useAnimationStore()

const tracks = computed(() => props.tracks)
const currentTime = computed(() => props.currentTime)
const duration = computed(() => props.duration)
const selectedChannel = ref<string | null>(null)

function getPropertyLabel(property: string): string {
  const labels: Record<string, string> = {
    translateX: 'X位移',
    translateY: 'Y位移',
    scaleX: 'X缩放',
    scaleY: 'Y缩放',
    rotate: '旋转',
    skewX: 'X倾斜',
    skewY: 'Y倾斜',
    width: '宽度',
    height: '高度',
    opacity: '透明度',
    backgroundColor: '背景色',
    borderRadius: '圆角',
    left: '左边距',
    top: '上边距'
  }
  return labels[property] || property
}

function selectChannel(property: string) {
  selectedChannel.value = property
}

function hasKeyframeAtCurrentTime(track: AnimationTrack): boolean {
  const currentProgress = duration.value > 0 ? currentTime.value / duration.value : 0
  const tolerance = 0.01 // 容差范围
  return track.keyframes.some(kf => Math.abs(kf.time - currentProgress) < tolerance)
}

function toggleKeyframe(property: string) {
  const currentProgress = duration.value > 0 ? currentTime.value / duration.value : 0
  const track = tracks.value.find((t: AnimationTrack) => t.property === property)
  if (!track) return

  // 检查当前时间是否有关键帧
  const existingIndex = track.keyframes.findIndex(
    (kf: { time: number }) => Math.abs(kf.time - currentProgress) < 0.01
  )

  if (existingIndex >= 0) {
    // 删除关键帧
    animationStore.removeKeyframe(property, existingIndex)
  } else {
    // 添加关键帧
    emit('add-keyframe', property, currentTime.value)
  }
}

function removeChannel(property: string) {
  animationStore.removeTrack(property)
  if (selectedChannel.value === property) {
    selectedChannel.value = null
  }
}
</script>

<style lang="scss" scoped>
.timeline-channels {
  width: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--n-borderColor);
  background: var(--n-color);
}

.channels-list {
  flex: 1;
  overflow-y: auto;
  @include custom-scrollbar;
}

.channel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--n-borderColor);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: var(--n-colorHover);
  }

  &.active {
    background: var(--n-colorPressed);
  }
}

.channel-label {
  flex: 1;
  min-width: 0;
}

.channel-name {
  font-size: 12px;
  color: var(--n-textColor);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.keyframe-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--n-textColor2);
  transition: color 0.2s;
  padding: 0;

  &:hover {
    color: var(--n-textColor);
  }

  &.active {
    color: #18a058;
  }

  svg {
    width: 12px;
    height: 12px;
  }
}

.remove-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--n-textColor2);
  transition: color 0.2s;
  padding: 0;
  opacity: 0;

  .channel-item:hover & {
    opacity: 1;
  }

  &:hover {
    color: #d03050;
  }
}
</style>
