import type { Project, ProjectData } from '@/types'
import { useCanvasStore } from '@/stores/canvasStore'
import { useAnimationStore } from '@/stores/animationStore'

export function exportJSON(projectName: string): Project {
  const canvasStore = useCanvasStore()
  const animationStore = useAnimationStore()

  const project: Project = {
    id: `project-${Date.now()}`,
    name: projectName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    data: {
      elements: canvasStore.elements,
      animations: animationStore.tracks.map((track) => ({
        duration: track.duration,
        delay: 0,
        iterations: 1,
        direction: 'normal' as const,
        fillMode: 'both' as const,
        easing: 'ease',
        keyframes: track.keyframes
      })),
      settings: {
        canvasWidth: canvasStore.canvasConfig.width,
        canvasHeight: canvasStore.canvasConfig.height,
        backgroundColor: canvasStore.canvasConfig.backgroundColor,
        gridSize: canvasStore.canvasConfig.gridSize,
        showGrid: canvasStore.canvasConfig.showGrid,
        showRuler: canvasStore.canvasConfig.showRuler
      }
    }
  }

  return project
}

export function importJSON(json: string): Project | null {
  try {
    return JSON.parse(json) as Project
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return null
  }
}
