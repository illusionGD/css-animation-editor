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

### 属性面板通用组件设计
- **原因**: 不同类型的属性（数字、颜色、字符串）需要不同的输入组件，但要保持统一的接口
- **实现**: 
  - `PropertyInput.vue` 作为通用输入组件，根据 `AnimatableProperty.type` 动态渲染不同的输入控件
  - `PropertyGroup.vue` 作为通用分组组件，不包含业务逻辑，只负责显示
  - `PropertyPanel.vue` 负责业务逻辑（计算属性值、处理更新）

### 关键帧选中状态管理
- **原因**: 当选中关键帧时，属性面板应该编辑关键帧的值，而不是元素的值
- **实现**: 
  - `animationStore.selectedKeyframe` 存储当前选中的关键帧
  - `PropertyPanel` 检查是否有选中的关键帧，优先显示和编辑关键帧的值
  - 时间轴和属性面板通过 `animationStore.setSelectedKeyframe()` 同步状态

## 架构决策

### Element Store 作为核心数据源
- **原因**: 统一管理所有元素数据，避免数据不一致，单一数据源原则
- **实现**: 
  - 所有元素数据（包括 `tracks`）存储在 `elementStore` 中
  - 其他 Store（如 `animationStore`）只负责业务逻辑，通过 `elementStore` 操作数据
  - `canvasStore` 作为代理层，通过计算属性提供向后兼容的 API

### 数据与业务逻辑分离
- **原因**: 职责清晰，便于维护和测试
- **实现**:
  - `elementStore` 只负责数据 CRUD 操作
  - `animationStore` 只负责动画业务逻辑（播放控制、关键帧操作）
  - `animationStore` 通过 `elementStore.getElement()` 和 `elementStore.updateElement()` 操作数据
  - `tracks` 数据存在 `CanvasElement.tracks` 字段中，而不是单独的 `animationStore.elementTracks`

### 画布从 Canvas 迁移到 HTML 结构
- **原因**: HTML 结构更符合 CSS 动画效果，CSS 动画在 DOM 元素上效果更好
- **状态**: 计划重构，尚未实施
- **当前状态**: 
  - 元素渲染已使用 HTML div
  - 网格背景仍使用 Canvas（需重构为 HTML/CSS）
- **重构计划**: 完全移除 Canvas，改用 HTML/CSS 实现所有画布功能

### 元素默认样式值设计
- **原因**: 新创建的元素应该有合理的默认 CSS 属性值，而不是空值
- **实现**: 
  - 在 `elementStore.createElement()` 中，使用 `ANIMATABLE_PROPERTIES` 中定义的 `defaultValue`
  - 通过 `getDefaultStyle()` 函数生成默认样式对象
  - 合并默认样式和传入的样式（传入的样式优先级更高）

## 性能优化决策

### 懒渲染
- **原因**: 画布元素多时渲染性能问题
- **实现**: 视口外元素不渲染（计划实现）

### 防抖节流
- **原因**: 频繁更新导致性能问题
- **应用**: 属性编辑、时间轴拖拽（计划实现）
