import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@/types'
import { storageAdapter } from '@/services/storage'
import { useCanvasStore } from './canvasStore'
import { useAnimationStore } from './animationStore'

export const useProjectStore = defineStore('project', () => {
  const canvasStore = useCanvasStore()
  const animationStore = useAnimationStore()

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
          canvasWidth: 1920,
          canvasHeight: 1080,
          backgroundColor: '#ffffff',
          gridSize: 20,
          showGrid: true,
          showRuler: true
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
        canvasStore.elements = project.data.elements
        canvasStore.updateCanvasConfig({
          width: project.data.settings.canvasWidth,
          height: project.data.settings.canvasHeight,
          backgroundColor: project.data.settings.backgroundColor,
          gridSize: project.data.settings.gridSize,
          showGrid: project.data.settings.showGrid,
          showRuler: project.data.settings.showRuler
        })
        // 恢复动画状态
        animationStore.tracks = project.data.animations.map((anim) => ({
          property: 'transform',
          keyframes: anim.keyframes,
          duration: anim.duration
        }))
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
    recentProjects.value = projects.value
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10)
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
