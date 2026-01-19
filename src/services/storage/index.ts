import { LocalStorageAdapter } from './LocalStorageAdapter'
import type { StorageAdapter } from './StorageAdapter'

/**
 * 存储适配器工厂
 * 根据配置返回对应的适配器实例
 */
export function createStorageAdapter(): StorageAdapter {
  // 当前使用LocalStorage，后续可通过环境变量切换
  const adapterType = import.meta.env.VITE_STORAGE_ADAPTER || 'local'

  switch (adapterType) {
    case 'local':
      return new LocalStorageAdapter()
    case 'api':
      // 后续实现ApiStorageAdapter
      throw new Error('ApiStorageAdapter not implemented yet')
    default:
      return new LocalStorageAdapter()
  }
}

export const storageAdapter = createStorageAdapter()
