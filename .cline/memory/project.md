# Project Memory: CSS Animation Editor

## Project Overview

- 项目名称：CSS Animation Editor（CSS 动画可视化编辑器）
- 项目目标：
  - 提供一个现代化的 CSS 动画可视化编辑器
  - 通过图形化界面设计 CSS `@keyframes`
  - 支持时间轴、关键帧、贝塞尔曲线
  - 实时预览并导出标准 CSS 代码

## Core Design Goals

- 以「所见即所得（WYSIWYG）」为核心体验
- 偏向专业用户（前端 / 动画开发）
- UI 默认深色主题（Dark Mode），支持主题切换
- 主要面向 PC 端使用场景

## Scope Clarification

- 本项目专注于 CSS Animation（非 WebGL / Canvas）
- 当前不考虑：
  - Webpack 方案
  - 复杂 3D 动画
  - 服务端能力

## Project Structure

### Root Directory Files

- `package.json` - 项目依赖配置和脚本定义
- `vite.config.ts` - Vite 构建工具配置
- `tailwind.config.js` - Tailwind CSS 样式框架配置
- `tsconfig.json` - TypeScript 编译配置
- `eslint.config.js` - ESLint 代码检查配置
- `postcss.config.js` - PostCSS 配置
- `index.html` - 应用入口 HTML 文件
- `README.md` - 项目说明文档
- `todo-list.md` - 开发任务清单

### Source Code Structure (`src/`)

#### Core Files
- `main.ts` - Vue 应用入口文件，配置 Pinia 状态管理
- `App.vue` - 根组件
- `style.css` - 全局样式文件，包含 Tailwind CSS 和主题变量

#### Views (`src/views/`)
- `EditorView.vue` - 主编辑器界面，包含头部、舞台、属性面板和时间轴

#### Components (`src/components/`)

##### Layout Components (`src/components/layout/`)
- `TheHeader.vue` - 应用头部，包含标题、主题切换和导出按钮

##### Editor Components (`src/components/editor/`)
- `TheStage.vue` - 动画预览舞台区域
- `PropertiesPanel.vue` - 属性编辑面板
- `TheTimeline.vue` - 时间轴组件，用于编辑关键帧

##### UI Components (`src/components/ui/`)
- `button/` - 按钮组件库
  - `Button.vue` - 基础按钮组件
  - `index.ts` - 按钮组件导出

#### Stores (`src/stores/`)
- `animation.ts` - 动画状态管理，包含动画数据和 CSS 代码生成

#### Utilities (`src/lib/`)
- `utils.ts` - 工具函数库

#### Assets (`src/assets/`)
- `vue.svg` - Vue 图标资源

### Configuration Files

- `components.json` - UI 组件库配置
- `tsconfig.app.json` / `tsconfig.node.json` - TypeScript 分环境配置
- `.prettierrc` - Prettier 代码格式化配置
- `.gitignore` - Git 忽略文件配置

### Public Assets (`public/`)
- `vite.svg` - Vite 图标资源
