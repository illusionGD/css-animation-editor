# 开发规范

## 代码风格要求
- 使用 TypeScript 严格模式
- 组件使用 Composition API
- 使用 `<script setup lang="ts">` 语法
- 单文件组件使用 PascalCase 命名
- 工具函数使用 camelCase 命名
- 类型定义放在 `src/types/` 目录
- Store 使用 Pinia，放在 `src/stores/` 目录

## 命名规范

### 组件命名
- 组件文件：PascalCase，如 `CanvasElement.vue`
- 组件名：PascalCase，如 `CanvasElement`
- 工具函数：camelCase，如 `formatValue.ts`
- 类型定义：camelCase，如 `animationTypes.ts`
- Store 文件：camelCase，如 `canvasStore.ts`

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

## 导入路径规范
- 使用 `@/` 别名导入，如 `import { useCanvasStore } from '@/stores/canvasStore'`
- 相对路径仅用于同目录文件

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

// 按逻辑区分，如：
//#region 模块功能1
    // 状态
    // 计算属性
    // 生命周期
    // 方法
//#endregion

//#region 模块功能2
    // 状态
    // 计算属性
    // 生命周期
    // 方法
//#endregion
</script>

<style scoped lang=scss>
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

## 常量管理规范

### 常量组织原则

采用**混合方案**，根据常量的使用范围决定存放位置：

1. **全局常量** (`src/constants/`) - 跨模块共享的常量
   - 画布相关：`canvas.ts`
   - 元素相关：`element.ts`
   - 动画相关：`animation.ts`
   - 统一导出：`index.ts`

2. **模块内常量** (`模块/constants.ts`) - 模块专用的常量
   - 时间轴相关：`src/components/Timeline/constants.ts`

### 判断标准

**放在全局 `src/constants/` 如果：**
- ✅ 常量被 2 个或更多模块使用
- ✅ 需要保证跨模块的一致性
- ✅ 是核心业务常量（如画布尺寸、元素默认值）

**放在模块内 `constants.ts` 如果：**
- ✅ 常量只在单个模块内使用
- ✅ 是模块特定的配置
- ✅ 修改不会影响其他模块

### 常量命名规范

- 使用 `UPPER_SNAKE_CASE` 命名
- 常量名应清晰描述其用途
- 必须添加 JSDoc 注释说明用途和单位

### 示例

```typescript
// src/constants/element.ts
/** 元素默认宽度（像素） */
export const ELEMENT_DEFAULT_WIDTH = 100

// src/components/Timeline/constants.ts
/** 时间轴基础间隔（毫秒） */
export const TIMELINE_BASE_INTERVAL = 100
```

## 样式书写规范
原则：尽量复用已有样式，做到精简
- 采用sass规范
- 常用的公共样式放在`src/assets/styles/common.scss`下，通过class名称使用
- 常用mixin放在`src/assets/styles/mixins.scss`下
- 颜色可用naive-ui的色值css变量或者`src/assets/styles/variables.scss`下的变量

## Git提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- perf: 性能优化
- test: 测试
- chore: 构建/工具

## 注意事项
- 保持代码简洁，避免过度抽象
- 性能优先，使用虚拟滚动处理大列表
- 错误处理要完善，使用 try-catch
- 注释要清晰，复杂逻辑必须注释

