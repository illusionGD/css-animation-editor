# Architecture & Core Design

## Layout Architecture

编辑器整体采用四区布局：

1. Header
   - Logo
   - 主题切换（Dark / Light）
   - 导出 CSS

2. Stage（画布）
   - 预览受控元素
   - 支持缩放、拖拽
   - 棋盘格背景（CSS conic-gradient）

3. Properties Panel（右侧）
   - 动画基础参数（Duration / Delay / Easing）
   - 属性编辑（transform / opacity / color）
   - 贝塞尔曲线编辑（规划中）

4. Timeline Panel（底部）
   - 播放控制
   - 关键帧轨道
   - 播放头（Playhead）

## State Model

- 使用 Pinia Store 维护 AnimationProject
- 关键帧模型示例：

```ts
interface KeyframeState {
  id: string
  offset: number // 0 ~ 1
  props: {
    opacity: number
    scale: number
    rotate: number
  }
  easing: string
}
```
## Preview Strategy

- 编辑态：

 - Vue :style 动态绑定

 - 实时计算插值结果

- 播放态：

 - 动态生成 @keyframes

 - 注入 <style>，交由浏览器原生动画系统渲染

## Timeline Interaction

- 关键帧拖拽：mousemove + 百分比计算

- 播放头驱动：requestAnimationFrame
