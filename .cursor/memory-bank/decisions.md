# 关键决策记录

## 技术选型

### Vue 3 + TypeScript
- **原因**: Vue 3 Composition API 更适合复杂应用，TypeScript 提供类型安全
- **替代方案**: React（未选择，团队更熟悉Vue）

### Naive UI
- **原因**: 体积小，Vue3原生，TypeScript支持好
- **替代方案**: Element Plus（体积较大）

### Pinia
- **原因**: Vue 3 官方推荐的状态管理方案，比Vuex更简洁
- **替代方案**: Vuex（已过时）

### Vite
- **原因**: 构建速度快，开发体验好
- **替代方案**: Webpack（构建速度慢）

## 架构决策

### 存储适配器模式
- **原因**: 便于后续接入后端API，无需修改业务代码
- **实现**: StorageAdapter接口，LocalStorageAdapter和ApiStorageAdapter实现

### 状态管理分片
- **原因**: 按功能模块拆分Store，便于维护和性能优化
- **实现**: 每个功能模块独立Store（canvas、animation、ui等）

### 组件化设计
- **原因**: 提高代码复用性和可维护性
- **实现**: 大组件拆分为小组件，如Canvas拆分为CanvasGrid、CanvasRuler等

## 性能优化决策

### 懒渲染
- **原因**: 画布元素多时渲染性能问题
- **实现**: 视口外元素不渲染

### 防抖节流
- **原因**: 频繁更新导致性能问题
- **应用**: 属性编辑、时间轴拖拽
