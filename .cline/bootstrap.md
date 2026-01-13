# 项目启动引导（Project Bootstrap）— CSS Animation Editor

在处理本仓库中的任何任务之前，你【必须】完整执行以下启动流程。

---

## 1. 加载项目记忆库

你【必须】按以下顺序读取文件：

1. `.cline/memory/_index.md`（如果存在）
2. `.cline/memory/project.md`
3. `.cline/memory/tech-stack.md`
4. `.cline/memory/architecture.md`
5. `.cline/memory/progress.md`

【不得】跳过任何文件。

---

## 2. 内化项目上下文（Internalize Project Context）

在读取记忆库后，你需要在内部建立以下共识级理解：

### 项目性质（Project Nature）
- 这是一个 **CSS 动画可视化编辑器**，不是示例或教程项目
- 目标用户是 **前端开发者**
- 核心聚焦 **CSS `@keyframes`**
- 不涉及 Canvas / WebGL 动画方案

### 技术基线（Technical Baseline）
- 框架：Vue 3 + TypeScript + Vite
- 状态管理：Pinia
- 样式体系：Tailwind CSS（深色模式优先）+ SCSS
- UI 系统：Shadcn-Vue + Radix Vue
- 本项目是 **PC 优先的编辑器**，而非移动端优先

### 架构优先级（Architectural Priorities）
- 时间轴（Timeline）与关键帧（Keyframe）数据模型是系统核心
- 预览效果必须与状态变更保持严格同步
- 编辑态（Editing）与播放态（Playback）可以采用不同的渲染策略
- 性能非常重要（避免不必要的响应式开销）

---

## 3. 输出理解总结（必须执行）

你【必须】输出一段简明总结，涵盖以下内容：

- 项目目标（1～2 句话）
- 核心技术栈
- 关键架构决策
- 当前开发阶段

然后【必须】明确询问：

> “以上理解是否正确？是否需要补充或修正记忆库内容？”

---

## 4. 确认前的严格限制（Very Important）

在用户确认之前：

- ❌ 不要修改任何文件
- ❌ 不要重构现有代码
- ❌ 不要引入新的抽象层
- ❌ 不要写入 `.cline/memory/`

你【只能】：
- 提出澄清性问题
- 指出你可能存在的理解偏差

---

## 5. 用户确认之后的行为规范

在用户确认理解无误之后：

- 开始处理用户请求的任务
- 严格遵循 `.cline/rules.md`
- 将记忆库文件视为 **项目的权威事实来源**
- 优先提供生产级解决方案，而非示例或教学代码

---

## 6. 质量标准提醒（Quality Bar）

本项目期望的输出质量包括：

- 清晰的状态边界
- 可预测的数据流
- 编辑器级别的 UX 思维（而非表单式 CRUD）
- 解释重点放在「为什么这样设计」，而不是基础 API 用法
