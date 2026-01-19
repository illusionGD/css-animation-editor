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

## Store 代码注释规范

### 注释规则
- **return 中的函数和变量**：必须使用 JSDoc 格式注释（`/** ... */`），包含参数说明、返回值说明等，方便调用时显示
- **store 内部的函数和变量**：使用单行注释（`//`）即可，简洁明了

### 示例

```typescript
export const useElementStore = defineStore('element', () => {
  // ========== 状态 ==========
  // 使用 Map 存储元素，提高查找性能
  const elements = ref<Map<string, CanvasElement>>(new Map())

  // 选中状态：存储选中的元素 ID 数组
  const selectedElementIds = ref<string[]>([])

  // ========== CRUD 操作 ==========
  
  // 创建元素（内部函数，使用单行注释）
  function createElement(data: Partial<CanvasElement>): string {
    // ... 实现代码
  }

  // ========== 导出 ==========
  return {
    // 状态
    elements, // Map 形式（内部使用）
    selectedElementIds, // 选中 ID 数组

    // CRUD 方法
    /**
     * 创建元素
     * @param data 元素数据（部分）
     * @returns 元素 ID
     */
    createElement,
    // ... 其他导出项
  }
})
```

## Git提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- perf: 性能优化
- test: 测试
- chore: 构建/工具
