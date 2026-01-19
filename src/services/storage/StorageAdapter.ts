import type { Project, PresetSchema } from '@/types'

/**
 * 存储适配器接口
 * 用于抽象数据存储层，支持LocalStorage和API两种实现
 */
export interface StorageAdapter {
  // 项目相关
  saveProject(project: Project): Promise<void>
  loadProject(projectId: string): Promise<Project | null>
  listProjects(): Promise<Project[]>
  deleteProject(projectId: string): Promise<void>

  // 预设相关
  savePreset(preset: PresetSchema): Promise<void>
  loadPreset(presetId: string): Promise<PresetSchema | null>
  listPresets(): Promise<PresetSchema[]>
  deletePreset(presetId: string): Promise<void>

  // 协作相关（预留）
  subscribeToProject?(projectId: string, callback: (changes: any[]) => void): Promise<void>
  updateProjectChanges?(projectId: string, changes: any[]): Promise<void>
}
