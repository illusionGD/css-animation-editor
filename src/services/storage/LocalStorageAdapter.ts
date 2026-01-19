import type { StorageAdapter } from './StorageAdapter'
import type { Project, PresetSchema } from '@/types'

const PROJECTS_KEY = 'css-animation-editor-projects'
const PRESETS_KEY = 'css-animation-editor-presets'

/**
 * LocalStorage存储适配器实现
 * 当前使用的存储方案
 */
export class LocalStorageAdapter implements StorageAdapter {
  // 项目相关
  async saveProject(project: Project): Promise<void> {
    const projects = this.getProjects()
    const index = projects.findIndex(p => p.id === project.id)
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: Date.now() }
    } else {
      projects.push({ ...project, createdAt: Date.now(), updatedAt: Date.now() })
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  }

  async loadProject(projectId: string): Promise<Project | null> {
    const projects = this.getProjects()
    return projects.find(p => p.id === projectId) || null
  }

  async listProjects(): Promise<Project[]> {
    return this.getProjects()
  }

  async deleteProject(projectId: string): Promise<void> {
    const projects = this.getProjects()
    const filtered = projects.filter(p => p.id !== projectId)
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered))
  }

  // 预设相关
  async savePreset(preset: PresetSchema): Promise<void> {
    const presets = this.getPresets()
    const index = presets.findIndex(p => p.id === preset.id)
    if (index >= 0) {
      presets[index] = preset
    } else {
      presets.push(preset)
    }
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  }

  async loadPreset(presetId: string): Promise<PresetSchema | null> {
    const presets = this.getPresets()
    return presets.find(p => p.id === presetId) || null
  }

  async listPresets(): Promise<PresetSchema[]> {
    return this.getPresets()
  }

  async deletePreset(presetId: string): Promise<void> {
    const presets = this.getPresets()
    const filtered = presets.filter(p => p.id !== presetId)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered))
  }

  // 私有方法
  private getProjects(): Project[] {
    try {
      const data = localStorage.getItem(PROJECTS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private getPresets(): PresetSchema[] {
    try {
      const data = localStorage.getItem(PRESETS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
}
