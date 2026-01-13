# Tech Stack Decisions

## Core Framework

- Vue 3 + TypeScript + Vite
- 原因：
  - Vue 3 响应式系统适合高频动画状态更新
  - Composition API 有利于复杂编辑器逻辑拆分
  - Vite 启动快、构建简单，适合工具型应用

## Styling

- Tailwind CSS + SCSS
- Tailwind 用于整体 UI 与主题体系
- SCSS 用于复杂样式或局部精细控制
- 启用 Tailwind Dark Mode

## State Management

- Pinia
- 用于管理：
  - 动画项目状态
  - 时间轴
  - 关键帧
  - 当前选中状态

## UI & Utilities

- UI 组件：Shadcn-Vue（Radix Vue + Tailwind）
- 图标库：@heroicons/vue（已替换 Lucide）
- 工具库：
  - VueUse（useDark, useDraggable 等）
  - clsx / tailwind-merge

## Tooling & Conventions

- ESLint + Prettier
- Commitizen（cz-conventional-changelog）
- Node.js v20+ 推荐
- 包管理器优先 pnpm
