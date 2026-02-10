<template>
  <div class="timeline-channels flex-center flex-column">
    <div v-if="animationStore.tracks.length" class="channel-list">
      <div v-for="(track, index) in animationStore.tracks" :key="index" class="channel-item">
        <!-- 左侧：CSS属性名称 -->
        <div class="channel-label" @click="selectChannel(track.property)">
          <span class="channel-name">{{ getCSSPropertyByProps(track.property)?.label }}</span>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="channel-actions">
          <!-- K帧按钮 -->
          <button
            class="keyframe-btn"
            :class="{ active: hasKeyframeAtCurrentTime(track) }"
            @click.stop="toggleKeyframe(track.property)"
            title="添加/删除关键帧"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L14 8L8 14L2 8Z" />
            </svg>
          </button>

          <!-- 删除通道按钮 -->
          <button class="remove-btn" @click.stop="removeChannel(track.property)" title="删除通道">
            <n-icon :component="Close" />
          </button>
        </div>
      </div>
    </div>
    <n-empty v-else description="暂无动画通道" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon, NEmpty } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import { useAnimationStore } from '@/stores/animationStore'
import type { AnimationTrack, ElementType } from '@/types'
import { getCSSPropertyByProps } from '@/constants'
import { useElementStore } from '@/stores/elementStore'

const animationStore = useAnimationStore()
const emit = defineEmits<{
  'add-keyframe': [property: string, time: number]
}>()

function getPropertyLabel(property: string) {}

function selectChannel(property: string) {}

function hasKeyframeAtCurrentTime(track: AnimationTrack) {}

function toggleKeyframe(property: string) {}

function removeChannel(property: string) {
  animationStore.removeTrack(property)
}
</script>

<style lang="scss" scoped>
.timeline-channels {
  height: 100%;
  background: var(--n-color);
  .channel-list {
      width: 100%;
      height: 100%;
  }
}


.channel-item {
  display: flex;
  padding: 10px 20px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;

  &:first-child {
    border-top: none;
  }

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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-color-primary);
  border-radius: 3px;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: all 0.2s;
  padding: 0;

  &:hover {
    color: var(--text-color-primary);
    border-color: var(--color-primary);
  }

  &.active {
    color: var(--color-primary);
    background: var(--color-primary-light);
    border-color: var(--color-primary);
  }

  svg {
    width: 14px;
    height: 14px;
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
