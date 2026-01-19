# 样式系统使用指南

## 目录结构

```
src/assets/styles/
├── variables.scss    # CSS 变量定义（所有样式值）
├── mixins.scss       # 公共 Mixin（滚动条、布局、工具类等）
├── common.scss       # 公共样式和工具类
├── index.scss        # 样式入口文件
└── README.md         # 使用说明
```

## 使用方式

### 1. 在组件中使用 CSS 变量

**所有样式值都使用 CSS 变量**：直接使用 `var(--variable-name)`

```scss
<style lang="scss" scoped>
.my-component {
  // 颜色（主题相关，自动切换）
  color: var(--color-text);
  background: var(--color-bg);
  border-color: var(--color-border);
  box-shadow: var(--shadow-md);

  // 尺寸和样式（不依赖主题）
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  z-index: var(--z-index-modal);
}
</style>
```

### 2. 使用 Mixin

所有 Mixin 已全局导入，可以直接使用：

```scss
<style lang="scss" scoped>
.scrollable-area {
  overflow: auto;
  @include custom-scrollbar; // 使用自定义滚动条
}

.text-overflow {
  @include text-ellipsis(2); // 两行文本省略
}

.flex-container {
  @include flex-between; // Flex 布局
}
</style>
```

### 3. 使用工具类

在模板中直接使用工具类：

```vue
<template>
  <div class="custom-scrollbar flex-center">
    <!-- 内容 -->
  </div>
</template>
```

## 可用变量

### CSS 变量（所有样式值）

**颜色变量**（根据主题自动切换）：

- `--color-primary` - 主色
- `--color-text` - 文本颜色
- `--color-bg` - 背景颜色
- `--color-border` - 边框颜色
- `--scrollbar-thumb` - 滚动条颜色
- `--shadow-sm/md/lg/xl` - 阴影

**尺寸和样式变量**（不依赖主题）：

- `--spacing-xs` ~ `--spacing-xxl` - 间距
- `--radius-sm` ~ `--radius-xl` - 圆角
- `--font-size-xs` ~ `--font-size-xl` - 字体大小
- `--font-weight-*` - 字体粗细
- `--transition-fast/base/slow` - 过渡时间
- `--transition-ease` - 过渡缓动函数
- `--z-index-*` - 层级
- `--scrollbar-width` - 滚动条宽度

### Sass 变量（仅用于媒体查询）

**响应式断点**（CSS 变量在 @media 中有限制，保留 Sass 变量）：

- `$breakpoint-xs` ~ `$breakpoint-xl` - 响应式断点

## 可用 Mixin

### 滚动条

```scss
@include custom-scrollbar; // 标准滚动条
@include custom-scrollbar($thin: true); // 细滚动条
```

### 文本省略

```scss
@include text-ellipsis; // 单行省略
@include text-ellipsis(2); // 两行省略
@include text-ellipsis(3); // 三行省略
```

### 布局

```scss
@include flex-center; // 居中布局
@include flex-between; // 两端对齐
@include flex-column; // 纵向布局
```

### 其他

```scss
@include clearfix; // 清除浮动
@include absolute-center; // 绝对居中
@include transition(...); // 过渡动画
@include shadow(md); // 阴影
@include respond-to(md); // 响应式断点
```

## 工具类

### 滚动条

- `.custom-scrollbar` - 标准滚动条
- `.custom-scrollbar-thin` - 细滚动条

### 文本

- `.text-ellipsis` - 单行省略
- `.text-ellipsis-2` - 两行省略
- `.text-ellipsis-3` - 三行省略

### 布局

- `.flex-center` - 居中布局
- `.flex-between` - 两端对齐
- `.flex-column` - 纵向布局
- `.clearfix` - 清除浮动

## 最佳实践

1. **优先使用 CSS 变量**：所有样式值都使用 CSS 变量 `var(--variable-name)`，包括间距、尺寸、字体等
2. **主题相关变量自动切换**：颜色、阴影等主题相关变量会根据 `[data-theme='dark']` 或 `.dark-theme` 自动切换
3. **Sass 变量仅用于媒体查询**：响应式断点使用 Sass 变量（CSS 变量在 @media 中有限制）
4. **使用 Mixin**：复用常用样式模式
5. **使用工具类**：简单场景直接使用工具类
6. **保持一致性**：使用统一的变量和 Mixin 保持样式一致
7. **运行时修改**：CSS 变量可以在运行时通过 JavaScript 修改，更加灵活

## 示例

### 示例 1：带滚动条的内容区域

```vue
<template>
  <div class="content-area">
    <!-- 内容 -->
  </div>
</template>

<style lang="scss" scoped>
.content-area {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  @include custom-scrollbar;
}
</style>
```

### 示例 2：主题适配的卡片

```vue
<style lang="scss" scoped>
.card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  border-color: var(--color-border);
  @include shadow(md);
  @include transition(background-color, border-color);

  // CSS 变量会自动根据主题切换，无需手动处理
}
</style>
```

### 示例 3：响应式布局

```vue
<style lang="scss" scoped>
.responsive-component {
  padding: var(--spacing-md);

  @include respond-to(md) {
    padding: var(--spacing-lg);
  }
}
</style>
```
