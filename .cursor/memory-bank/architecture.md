# CSS 动画编辑器 - 架构概览

## 1. 项目概况
本项目是一个基于 **Vue 3** 和 **TypeScript** 构建的 Web 端 **CSS 动画编辑器**。它提供了一个可视化的界面，用于创建、编辑和导出 CSS 动画，类似于 Flash 或 Adobe Edge Animate 等工具，但专注于现代 Web 标准。

### 技术栈
- **框架**: Vue 3 (Script Setup, Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 库**: Naive UI
- **图标**: Ionicons 5 (via @vicons)
- **样式**: SCSS
- **核心依赖**:
  - `bezier-easing`: 用于贝塞尔曲线的可视化和计算。
  - `monaco-editor`: 用于代码预览/编辑。
  - `@vueuse/core`: 用于通用的组合式函数（键盘交互等）。

## 2. 高层架构
应用程序遵循 **组件 (Component) - 状态 (Store) - 服务 (Service)** 架构：
- **Components (`src/components/`)**: 纯 UI 层。渲染 store 中的状态并发出用户交互事件。
- **Stores (`src/stores/`)**: 核心业务逻辑和事实来源。处理数据操作、选中状态和历史记录（撤销/重做）。
- **Services (`src/services/`)**: 基础设施层，主要处理数据持久化（存储适配器）。
- **Utils (`src/utils/`)**: 纯函数助手，用于复杂计算、格式化和文件生成（导出）。

## 3. 核心模块与目录结构

### 3.1 视图与组件 (Views & Components)
UI 分为四个主要区域（配置在 `src/components/ResizableLayout` 中）：
1.  **左侧边栏 (`src/components/LeftSidebar/`)**:
    -   `NodeTree`: 管理元素层级（DOM 树结构）。
    -   `PresetPanel`: 预定义元素/动画的库。
2.  **画布 (`src/components/Canvas/`)**:
    -   主要的视觉工作区。
    -   处理元素渲染、选框覆盖、参考线和拖放操作。
3.  **属性面板 (`src/components/PropertyPanel/`)**:
    -   上下文敏感的编辑器。
    -   显示当前选中元素（位置、大小、颜色等）或动画关键帧的属性。
4.  **时间轴 (`src/components/Timeline/`)**:
    -   动画序列器。
    -   包含 `TimelineTracks`（关键帧显示）、`TimelineGrid` 和播放控件。

### 3.2 状态管理 (Pinia Stores)
状态根据关注点分离进行归一化：
-   **`elementStore.ts`**: "场景"。存储元素列表、样式和层级。
-   **`animationStore.ts`**: "时间"。存储轨道、关键帧、播放头位置和播放状态。
-   **`canvasStore.ts`**: "视口"。缩放级别、平移偏移、标尺可用性、吸附设置。
-   **`historyStore.ts`**: "时光机"。管理标准的撤销/重做栈。
-   **`nodeTreeStore.ts`**: 树视图状态助手（展开的节点等）。
-   **`presetStore.ts`**: 管理可复用的动画/元素模板。

### 3.3 数据流 (Data Flow)
1.  **输入 (Input)**: 用户与 **Components** 交互（例如，在画布上拖动对象）。
2.  **动作 (Action)**: 组件调用 **Stores** 中的 Action（例如，`elementStore.updateElement`）。
3.  **状态变更 (State Change)**: Store 更新响应式状态。
4.  **副作用 (Effect)**:
    -   **Canvas** 重新渲染元素。
    -   **PropertyPanel** 更新显示的值。
    -   **Timeline** 更新关键帧标记（如果是自动关键帧模式）。
    -   **HistoryStore** 捕获快照（防抖）。

### 3.4 关键子系统 (Key Subsystems)

#### 坐标系统
-   在 `utils/calculators.ts` 和 `canvasStore` 中管理。
-   处理屏幕空间（Screen Space，鼠标事件）和画布空间（Canvas Space，CSS 值）之间的转换。

#### 导出系统 (`src/utils/exporters/`)
-   **CSS Exporter**: 将内部动画状态编译为标准的 `@keyframes` 和类定义。
-   **HTML Exporter**: 将 CSS 和 HTML 结构包装成独立文件。
-   **JSON Exporter**: 序列化整个项目状态用于保存/加载。

## 4. 文件结构
```
src/
├── components/          # 按 UI 区域排列的 Vue 组件
│   ├── Canvas/          # 编辑舞台
│   ├── Header/          # 工具栏和菜单
│   ├── Timeline/        # 动画序列器
│   └── ...
├── composables/         # 共享逻辑（例如，键盘快捷键）
├── constants/           # 配置常量（颜色，默认值）
├── schemas/             # 数据验证模式
├── services/            # 存储和外部 IO
├── stores/              # Pinia 状态定义
├── types/               # TypeScript 接口
└── utils/               # 助手函数
    └── exporters/       # 输出生成逻辑
```
