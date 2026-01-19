# 项目架构说明

## 项目结构

```
css-animation-editor/
├── src/
│   ├── components/          # 组件
│   │   ├── Canvas/          # 画布模块
│   │   ├── PropertyPanel/   # 右侧属性面板
│   │   ├── Timeline/        # 底部时间轴
│   │   ├── LeftSidebar/     # 左侧侧边栏
│   │   ├── Header/          # 顶部Banner
│   │   └── common/          # 通用组件
│   ├── stores/              # Pinia状态管理
│   ├── services/            # 服务层（数据存储抽象）
│   │   ├── storage/         # 存储适配器
│   │   └── api/             # API服务（预留）
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── schemas/             # 预设Schema定义
│   ├── composables/         # Vue组合式函数
│   └── App.vue
```

## 核心模块职责

### Canvas Store
- 管理画布元素列表
- 管理选中状态
- 管理画布配置（尺寸、网格、标尺等）

### Animation Store
- 管理动画时间轴
- 管理关键帧
- 管理播放状态

### UI Store
- 管理主题
- 管理布局尺寸
- 管理全局设置

### NodeTree Store
- 管理节点树结构
- 与Canvas Store同步

### Preset Store
- 管理预设列表
- 预设搜索和过滤

### Project Store
- 管理项目列表
- 项目保存/加载

## 数据流

用户操作 → Store → 组件更新 → 视图渲染

## 模块依赖关系

- Canvas Store ← NodeTree Store
- Animation Store ← Property Panel
- Project Store → Canvas Store + Animation Store
