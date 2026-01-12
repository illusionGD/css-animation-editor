# CSS 动画可视化编辑器开发计划

## 1. 项目概述

本项目旨在构建一个现代化的 CSS 动画可视化编辑器。用户可以通过图形化界面直观地设计 CSS 动画，支持时间轴控制、贝塞尔曲线调节，并能实时预览和导出 CSS 代码。界面设计追求美观，默认采用深色（Dark）主题，并支持主题切换。

## 2. 技术选型思路

* **前端框架**: **Vue 3** + **TypeScript** + **Vite**。Vue 3 的响应式系统（Reactivity System）非常适合处理动画编辑器中高频变化的状态，且 Composition API 代码组织清晰。
* **样式解决方案**: **Tailwind CSS**。提供原子化 CSS 能力，配合 Vue 的动态绑定非常灵活，内置 Dark Mode 支持，满足“好看”和“主题切换”的需求。
* **状态管理**: **Pinia**。Vue 官方推荐的状态管理库，直观、类型安全，适合存储时间轴、关键帧、属性等全局数据。
* **UI 组件库**: **Shadcn-Vue** (基于 Radix Vue 和 Tailwind)。用于快速搭建高颜值、风格统一的界面 (Dialog, Popover, Slider, Switch 等)。
* **核心工具库**:
  * **VueUse**: 提供 `useDraggable`, `useStorage` 等实用组合式函数，简化交互逻辑。
  * **Cubic-bezier**: 用于贝塞尔曲线的可视化计算。
  * **Monaco Editor** (可选): 如果需要展示高亮代码，可以使用 Vue wrapper。

## 3. 功能模块详细规划

### 3.1 核心界面布局 (Layout)

整个编辑器分为四个主要区域：

1. **Header (顶部)**: Logo, 项目名称, 主题切换 (Dark/Light), 导出 CSS / 生成代码。
2. **Stage (中间画布)**:
   * 预览区，展示受控元素。
   * 支持画布缩放、拖拽移动、标尺/网格背景。
3. **Properties Panel (右侧属性面板)**:
   * **基础设置**: 动画时长 (Duration), 延迟 (Delay), 缓动 (Timing Function), 循环次数 (Iteration Count)。
   * **属性编辑**: 选中某个关键帧时，编辑 `transform` (rotate, scale, translate), `opacity`, `background-color` 等。
   * **曲线编辑器**: 可视化调节贝塞尔曲线。
4. **Timeline Panel (底部时间轴)**:
   * **控制栏**: 播放/暂停, 停止, 播放倍速。
   * **关键帧轨道**: 类似视频编辑软件的轨道，支持添加、删除、拖拽关键帧。
   * **播放头 (Playhead)**: 拖拽预览动画。

### 3.2 关键技术实现思路

* **数据结构 (State)**:
  使用 Pinia Store 维护一个 `AnimationProject` 对象：
  ```typescript
  interface KeyframeState {
    id: string;
    offset: number; // 0.0 - 1.0 (对应 0% - 100%)
    props: Record<string, string>; // e.g. { 'opacity': '1', 'transform': 'scale(1.5)' }
    easing: string;
  }
  ```
* **预览机制**:
  * **实时编辑时**: 利用 Vue 的 `:style` 绑定，计算当前时间进度下各个属性的插值（Interpolation），直接应用在预览元素上。
  * **播放时**: 为了性能和准确性，可以将当前 State 生成临时的 `@keyframes` CSS 规则，插入到 `<style>` 标签中，让浏览器原生渲染动画。
* **时间轴交互**:
  * 使用 `mousemove` 事件监听 + 百分比计算来实现关键帧的拖拽。
  * 利用 `requestAnimationFrame` 更新播放头位置。

## 4. 开发待办清单 (Todo List)

### Phase 1: 项目初始化与基础架构

- [X]  使用 Vite 初始化 Vue 3 + TypeScript 项目
- [X]  配置代码规范工具 (ESLint + Prettier)
- [X]  安装并配置 Tailwind CSS (包含 tailwindcss-animate 插件)
- [X]  配置 Pinia 状态管理
- [X]  引入 UI 组件库基础依赖 (Radix Vue, Lucide Vue, CVA, Clsx, Tailwind Merge)
- [X]  初始化 Shadcn-Vue (`components.json`)
- [X]  搭建项目目录结构 (`src/views`, `src/components`, `src/stores`, `src/composables`, `src/lib`)

### Phase 2: 界面框架搭建

- [ ]  实现全屏布局：Header + Sidebar + Canvas + Timeline
- [ ]  实现 Header：包含 Dark Mode 切换开关 (使用 VueUse `useDark`)
- [ ]  实现 Canvas 区域：绘制网格背景，放置预览目标元素
- [ ]  实现 Timeline 基础容器和 Properties 面板容器

### Phase 3: 核心数据流与预览

- [ ]  定义 Pinia Store：`useAnimationStore`，设计动画与关键帧的数据结构
- [ ]  实现“属性编辑”组件：输入框/滑块控制 transform, opacity 等
- [ ]  实现“实时预览”：根据当前选中关键帧的属性，动态更新 Canvas 中元素的样式
- [ ]  实现 CSS 代码生成器：将 Store 数据转换为 CSS 字符串

### Phase 4: 时间轴与关键帧交互

- [ ]  开发轨道 (Track) 组件：显示时间刻度
- [ ]  开发关键帧 (Keyframe) 节点：在轨道上渲染菱形图标
- [ ]  实现交互：点击轨道添加关键帧
- [ ]  实现交互：拖拽关键帧改变其百分比位置
- [ ]  实现播放控制：Play/Pause 逻辑，通过 `requestAnimationFrame` 驱动进度条

### Phase 5: 进阶功能

- [ ]  集成贝塞尔曲线可视化编辑器
- [ ]  实现多属性轨道 (可选：将不同属性分开显示轨道)
- [ ]  完善代码导出功能：支持复制 CSS 代码片段
- [ ]  增加更多 CSS 属性支持 (Filter, Border-radius, Box-shadow)

### Phase 6: 优化与发布

- [ ]  全局 UI 美化 (调整配色、间距、圆角)
- [ ]  移动端适配或提示 (主要针对 PC 端优化)
- [ ]  性能优化 (减少不必要的重渲染)
