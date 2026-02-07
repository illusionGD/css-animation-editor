import { onMounted, onUnmounted } from 'vue'
import { useAnimationStore } from '@/stores/animationStore'

type ShortcutHandler = (e: KeyboardEvent) => void

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: ShortcutHandler
}

const shortcuts: Shortcut[] = []

export function useKeyboardShortcuts() {
  const animationStore = useAnimationStore()

  function handleKeyDown(e: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey

    for (const shortcut of shortcuts) {
      if (
        shortcut.key === e.key &&
        (shortcut.ctrl === undefined || shortcut.ctrl === ctrlKey) &&
        (shortcut.shift === undefined || shortcut.shift === e.shiftKey) &&
        (shortcut.alt === undefined || shortcut.alt === e.altKey)
      ) {
        e.preventDefault()
        shortcut.handler(e)
        break
      }
    }
  }

  // 注册快捷键
  shortcuts.push(
    {
      key: 'z',
      ctrl: true,
      handler: () => {
        // TODO: 撤销
        console.log('Undo')
      }
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => {
        // TODO: 重做
        console.log('Redo')
      }
    },
    {
      key: 'c',
      ctrl: true,
      handler: () => {
        // TODO: 复制
        console.log('Copy')
      }
    },
    {
      key: 'v',
      ctrl: true,
      handler: () => {
        // TODO: 粘贴
        console.log('Paste')
      }
    },
    {
      key: 'Delete',
      handler: () => {
        // 如果有关键帧被选中，不删除元素（由时间轴组件处理关键帧删除）
        // if (animationStore.selectedKeyframe) {
        //   return
        // }
        // canvasStore.selectedElementIds.forEach(id => {
        //   canvasStore.removeElement(id)
        // })
      }
    },
    {
      key: ' ',
      handler: e => {
        e.preventDefault()
        if (animationStore.isPlaying) {
          animationStore.pause()
        } else {
          animationStore.play()
        }
      }
    }
  )

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
