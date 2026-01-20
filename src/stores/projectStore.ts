import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@/types'
import { storageAdapter } from '@/services/storage'
import { useCanvasStore } from './canvasStore'
import { useAnimationStore } from './animationStore'
import { useElementStore } from './elementStore'
import {
  CANVAS_DEFAULT_WIDTH,
  CANVAS_DEFAULT_HEIGHT,
  CANVAS_DEFAULT_BACKGROUND_COLOR,
  CANVAS_DEFAULT_GRID_SIZE,
  CANVAS_DEFAULT_SHOW_GRID,
  CANVAS_DEFAULT_SHOW_RULER
} from '@/constants'

export const useProjectStore = defineStore('project', () => {
  const canvasStore = useCanvasStore()
  const animationStore = useAnimationStore()
  const elementStore = useElementStore()

  const currentProject = ref<Project | null>(null)
  const projects = ref<Project[]>([])
  const recentProjects = ref<Project[]>([])

  // 方法
  async function loadProjects() {
    try {
      projects.value = await storageAdapter.listProjects()
      updateRecentProjects()
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  async function createProject(name: string, description?: string): Promise<Project> {
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      data: {
        elements: [],
        animations: [],
        settings: {
          canvasWidth: CANVAS_DEFAULT_WIDTH,
          canvasHeight: CANVAS_DEFAULT_HEIGHT,
          backgroundColor: CANVAS_DEFAULT_BACKGROUND_COLOR,
          gridSize: CANVAS_DEFAULT_GRID_SIZE,
          showGrid: CANVAS_DEFAULT_SHOW_GRID,
          showRuler: CANVAS_DEFAULT_SHOW_RULER
        }
      }
    }

    await saveProject(project)
    return project
  }

  async function saveProject(project: Project) {
    try {
      const updatedProject: Project = {
        ...project,
        updatedAt: Date.now(),
        version: project.version + 1,
        data: {
          elements: canvasStore.elements,
          animations: animationStore.tracks.map(track => ({
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

      await storageAdapter.saveProject(updatedProject)
      currentProject.value = updatedProject
      await loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  async function loadProject(projectId: string) {
    try {
      const project = await storageAdapter.loadProject(projectId)
      if (project) {
        currentProject.value = project
        // 恢复画布状态
        // 清空现有元素
        elementStore.clearAll()
        // 恢复元素
        project.data.elements.forEach(element => {
          elementStore.createElement(element)
        })
        canvasStore.updateCanvasConfig({
          width: project.data.settings.canvasWidth,
          height: project.data.settings.canvasHeight,
          backgroundColor: project.data.settings.backgroundColor,
          gridSize: project.data.settings.gridSize,
          showGrid: project.data.settings.showGrid,
          showRuler: project.data.settings.showRuler
        })
        // 恢复动画状态
        // 注意：项目数据中的动画格式可能与当前格式不一致
        // 如果需要恢复动画，需要根据实际数据结构来处理
        // animationStore.elementTracks 是 Record<string, AnimationTrack[]>
        // project.data.animations 是 AnimationConfig[]
        // 暂时不恢复动画数据，因为格式不匹配
        updateRecentProjects()
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  async function deleteProject(projectId: string) {
    try {
      await storageAdapter.deleteProject(projectId)
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
      await loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  function updateRecentProjects() {
    recentProjects.value = projects.value.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10)
  }

  // 初始化
  loadProjects()

  return {
    // 状态
    currentProject,
    projects,
    recentProjects,
    // 方法
    loadProjects,
    createProject,
    saveProject,
    loadProject,
    deleteProject
  }
})
