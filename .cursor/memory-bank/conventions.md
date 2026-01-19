# 开发规范

## 命名规范

### 组件命名
- 组件文件：PascalCase，如 `CanvasElement.vue`
- 组件名：PascalCase，如 `CanvasElement`

### 变量命名
- 普通变量：camelCase，如 `selectedElement`
- 常量：UPPER_SNAKE_CASE，如 `MAX_HISTORY_SIZE`
- 私有变量：前缀 `_`，如 `_internalState`

### 函数命名
- 普通函数：camelCase，如 `updateElement`
- 事件处理：on 前缀，如 `onElementClick`
- 计算属性：get 前缀（可选），如 `getSelectedElements`

### 类型命名
- 接口：PascalCase，如 `CanvasElement`
- 类型别名：PascalCase，如 `AnimationConfig`
- 枚举：PascalCase，如 `ElementType`

## 组件规范

### 组件结构
```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 导入
// 类型定义
// Props/Emits
// Store
// 状态
// 计算属性
// 方法
// 生命周期
</script>

<style scoped>
/* 样式 */
</style>
```

### Props 定义
```typescript
interface Props {
  element: CanvasElement
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})
```

## 代码风格

- 使用单引号
- 不使用分号
- 2空格缩进
- 行宽100字符
- 尾随逗号：none

## Git提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- perf: 性能优化
- test: 测试
- chore: 构建/工具
