# CSS Animation Editor (CSS 动画可视化编辑器)

一个基于 Vue 3 的现代化 CSS 动画可视化编辑器。通过图形化界面直观地设计 CSS 动画，支持时间轴控制、关键帧编辑、贝塞尔曲线调节，并能实时预览和导出 CSS 代码。

## ✨ 特性 (Planned)

- **可视化编辑**: 拖拽调节关键帧，实时预览动画效果。
- **时间轴控制**: 类似视频剪辑的时间轴交互，精确控制动画节奏。
- **属性微调**: 支持 Transform (rotate, scale, translate), Opacity, Background Color 等属性。
- **贝塞尔曲线**: 可视化调节缓动函数 (cubic-bezier)。
- **代码导出**: 一键生成标准的 CSS `@keyframes` 代码。
- **现代化 UI**: 基于 Tailwind CSS 和 Shadcn-Vue 的精美深色主题界面。

## 🛠 技术栈

- **Core**: [Vue 3](https://vuejs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn-Vue](https://www.shadcn-vue.com/) (based on Radix Vue & Lucide Vue)
- **Utilities**: [VueUse](https://vueuse.org/), clsx, tailwind-merge

## 📂 目录结构

```
src/
├── assets/        # 静态资源文件
├── components/    # 组件目录
│   └── ui/        # Shadcn UI 基础组件
├── composables/   # Vue 组合式函数
├── lib/           # 工具函数库
├── stores/        # Pinia 状态仓库
├── views/         # 页面视图
├── App.vue        # 应用根组件
└── main.ts        # 应用入口文件
```

## 🚀 快速开始

### 前置要求

- Node.js (推荐 v20+)
- pnpm (推荐) 或 npm/yarn

### 安装

```bash
# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev
```

### 构建

```bash
# 构建生产版本
pnpm build
```

### 代码规范

本项目集成了 ESLint 和 Prettier。

```bash
# 执行类型检查并构建
npm run build
```

## 📅 开发计划

详细的开发进度和计划请查看 [todo-list.md](./todo-list.md)。

## 📄 License

MIT
