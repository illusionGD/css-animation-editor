# 项目架构说明

## 项目结构

```
css-animation-editor/
├── src/
│   ├── components/          # 组件
│   │   ├── Canvas/          # 画布模块
│   │   ├── PropertyPanel/   # 右侧属性面板
│   │   ├── Timeline/        # 底部时间轴
│   │   ├── LeftSidebar/     # 左侧侧边栏容器
│   │   │   ├── NodeTree/    # 节点树面板
│   │   │   └── PresetPanel/ # 预设面板
│   │   ├── Header/          # 顶部Banner
│   │   └── ResizableLayout/ # 可调整布局
│   ├── stores/              # Pinia状态管理
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── schemas/             # 预设Schema定义
│   ├── composables/         # Vue组合式函数
│   └── App.vue
├── .cursorrules             # AI规则文件
├── .cursor/                 # Cursor配置
│   └── memory-bank/         # Memory bank文件
└── package.json
```

## 核心模块职责

### Element Store (`src/stores/elementStore.ts`) - **核心数据源**

**职责**:
- **统一管理所有元素的增删改查**（单一数据源 Single Source of Truth）
- 使用 `Map<string, CanvasElement>` 存储，提高查找性能（O(1)）
- 管理选中状态（selectedElementIds）
- 提供选中元素数组（selectedElements）

**关键状态**:
- `elements: Map<string, CanvasElement>` - 元素数据（Map 形式，内部使用）
- `selectedElementIds: string[]` - 选中元素 ID 数组

**关键计算属性**:
- `elementsArray: CanvasElement[]` - 所有元素数组（供其他模块使用）
- `selectedElements: CanvasElement[]` - **选中元素数组（核心方法）**
- `hasSelection: boolean` - 是否有选中
- `firstSelectedElement: CanvasElement | undefined` - 第一个选中元素
- `elementCount: number` - 元素总数

**关键方法**:
- `createElement(data): string` - 创建元素，返回 ID
- `getElement(id): CanvasElement | undefined` - 获取单个元素
- `getElements(): CanvasElement[]` - 获取所有元素
- `updateElement(id, updates): void` - 更新元素
- `deleteElement(id): void` - 删除元素（自动取消选中）
- `hasElement(id): boolean` - 检查元素是否存在
- `getElementsByIds(ids): CanvasElement[]` - 批量获取元素
- `deleteElements(ids): void` - 批量删除元素
- `clearAll(): void` - 清空所有元素
- `selectElement(ids: string | string[], multi?): void` - 选中元素（支持单个或数组，支持追加模式）
- `deselectElement(ids: string | string[]): void` - 取消选中（支持单个或数组）
- `clearSelection(): void` - 清空选中
- `toggleSelection(ids: string | string[]): void` - 切换选中状态
- `isSelected(id): boolean` - 检查是否选中

**设计优势**:
- 单一数据源，避免数据不一致
- Map 存储，查找性能 O(1)
- 支持单个或批量操作
- 完整的 TypeScript 类型支持
- 响应式计算属性，自动更新

### Canvas Store (`src/stores/canvasStore.ts`)

**职责**:
- 管理画布配置（缩放、偏移、网格等）
- **从 elementStore 获取元素数据**（通过计算属性代理）
- **保持向后兼容的 API**（代理方法，避免大规模重构）

**关键状态**:
- `canvasConfig` - 画布配置（宽度、高度、缩放、偏移、网格、标尺等）

**计算属性（代理到 elementStore）**:
- `elements` - 从 `elementStore.elementsArray` 获取
- `selectedElementIds` - 从 `elementStore.selectedElementIds` 获取
- `selectedElements` - 从 `elementStore.selectedElements` 获取
- `hasSelection` - 从 `elementStore.hasSelection` 获取

**关键方法**:
- `updateCanvasConfig(config)` - 更新画布配置
- `addElement()`, `removeElement()`, `updateElement()`, `selectElement()` - 代理到 elementStore（保持向后兼容）

### Animation Store (`src/stores/animationStore.ts`)

**职责**:
- 管理动画播放状态（isPlaying, currentTime）
- 管理动画时长（duration）
- 管理动画轨道（elementTracks）- 按元素ID存储：`Record<string, AnimationTrack[]>`
- 管理关键帧（keyframes）

**关键状态**:
- `elementTracks: Record<string, AnimationTrack[]>` - 按元素ID存储动画轨道
- `selectedElementId: string | null` - 当前编辑的元素ID
- `isPlaying: boolean` - 是否正在播放
- `currentTime: number` - 当前播放时间（毫秒）
- `duration: number` - 动画时长（毫秒）

**关键计算属性**:
- `tracks: AnimationTrack[]` - 当前选中元素的 tracks
- `currentProgress: number` - 当前播放进度（0-1）

**关键方法**:
- `setSelectedElement(elementId)` - 设置当前编辑的元素
- `addTrack(property)` - 添加动画轨道
- `removeTrack(property)` - 删除动画轨道
- `addKeyframe(property, keyframe)` - 添加关键帧
- `removeKeyframe(property, keyframeIndex)` - 删除关键帧
- `updateKeyframe(property, keyframeIndex, updates)` - 更新关键帧
- `play()`, `pause()`, `stop()`, `seek(time)` - 播放控制
- `getElementTracks(elementId)` - 获取指定元素的 tracks

### UI Store (`src/stores/uiStore.ts`)

**职责**:
- 管理主题（亮色/暗色）
- 管理布局尺寸（侧边栏宽度、时间轴高度）
- 管理设置（导出格式、默认时长等）
- 管理自动K帧开关（autoKeyframe）

**关键状态**:
- `isDarkMode: boolean` - 是否暗色模式
- `leftSidebarWidth: number` - 左侧栏宽度
- `rightSidebarWidth: number` - 右侧栏宽度
- `timelineHeight: number` - 时间轴高度
- `leftSidebarTab: 'nodeTree' | 'presets'` - 左侧栏当前标签页
- `settings` - 全局设置
- `autoKeyframe: boolean` - 自动K帧开关

**关键方法**:
- `toggleTheme()` - 切换主题
- `setLeftSidebarWidth(width)` - 设置左侧栏宽度
- `setRightSidebarWidth(width)` - 设置右侧栏宽度
- `setTimelineHeight(height)` - 设置时间轴高度
- `toggleAutoKeyframe()` - 切换自动K帧

### NodeTree Store (`src/stores/nodeTreeStore.ts`)

**职责**:
- 管理节点树结构（nodes）
- 管理节点展开/折叠状态
- **从 elementStore 获取元素数据并构建树形结构**

**关键状态**:
- `nodes: TreeNode[]` - 节点树结构
- `selectedNodeId: string | null` - 选中的节点ID
- `expandedNodeIds: Set<string>` - 展开的节点ID集合

**关键方法**:
- `buildTreeFromElements()` - 从 elementStore 获取元素并构建树
- `selectNode(nodeId)` - 选中节点（同步到 elementStore）
- `findNodeById(id)` - 查找节点
- `toggleExpand(nodeId)` - 切换节点展开/折叠
- `syncWithCanvas()` - 同步元素变化

### Preset Store (`src/stores/presetStore.ts`)

**职责**:
- 管理动画预设列表
- 管理预设搜索和分类
- 预设的增删改查

**关键方法**:
- `loadPresets()` - 加载预设列表
- `savePreset(preset)` - 保存预设
- `deletePreset(presetId)` - 删除预设
- `setSearchQuery(query)` - 设置搜索关键词
- `setSelectedCategory(category)` - 设置选中分类

### Project Store (`src/stores/projectStore.ts`)

**职责**:
- 管理项目列表
- 项目的保存/加载
- **使用 elementStore 恢复元素数据**

**关键方法**:
- `saveProject()` - 保存项目（从 elementStore 获取元素数据）
- `loadProject(projectId)` - 加载项目（使用 elementStore 恢复元素）
- `deleteProject(projectId)` - 删除项目
- `listProjects()` - 获取项目列表

## 数据流

### 整体数据流

```
用户操作
    ↓
组件 (Canvas, PropertyPanel, Timeline, NodeTree)
    ↓
Element Store (核心数据源) ← 所有元素数据操作
    ↓
Canvas Store (视图层，计算属性代理) ← 保持向后兼容
    ↓
其他 Store (Animation, NodeTree) ← 从 Element Store 获取数据
    ↓
组件响应式更新
```

### 元素数据流

```
Element Store (单一数据源)
    ├── elements: Map<string, CanvasElement>
    └── selectedElementIds: string[]
         ↓
Canvas Store (代理层)
    ├── elements (computed) → elementStore.elementsArray
    ├── selectedElementIds (computed) → elementStore.selectedElementIds
    └── selectedElements (computed) → elementStore.selectedElements
         ↓
组件层
    ├── Canvas.vue → canvasStore.elements
    ├── PropertyPanel.vue → canvasStore.selectedElements
    └── NodeTree.vue → elementStore.createElement()
```

### 选中状态流

```
用户点击元素
    ↓
elementStore.selectElement(id)
    ↓
selectedElementIds 更新
    ↓
selectedElements (computed) 自动更新
    ↓
Canvas Store (代理)
    ↓
所有使用 canvasStore.selectedElements 的组件自动更新
```

### 元素创建流

```
NodeTree.vue: addElement()
    ↓
elementStore.createElement(data)
    ↓
elements Map 更新
    ↓
elementsArray (computed) 自动更新
    ↓
Canvas Store.elements (computed) 自动更新
    ↓
Canvas.vue 自动渲染新元素
```

### 元素更新流

```
PropertyPanel.vue: 修改属性
    ↓
elementStore.updateElement(id, updates)
    ↓
elements Map 更新
    ↓
elementsArray (computed) 自动更新
    ↓
Canvas.vue 自动更新元素样式
```

## 模块依赖关系

```
Element Store (核心)
    ↑
    ├── Canvas Store (代理层)
    ├── NodeTree Store (构建树形结构)
    └── Project Store (保存/加载)
         ↓
Animation Store (独立，按元素ID存储tracks)
         ↓
UI Store (独立，全局UI状态)
```

## 关键设计决策

1. **单一数据源**: Element Store 作为所有元素数据的唯一来源，避免数据不一致
2. **向后兼容**: Canvas Store 通过计算属性代理，保持原有 API，避免大规模重构
3. **性能优化**: 使用 Map 存储元素，查找性能 O(1)
4. **响应式设计**: 使用 Vue 计算属性，自动响应数据变化
5. **类型安全**: 完整的 TypeScript 类型支持
