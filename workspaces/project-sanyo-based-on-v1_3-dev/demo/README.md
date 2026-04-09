# product-v1_3-dev demo

1.3 增量 demo 的活跃代码位于本目录。

## 入口

- `index.html`
  - demo 总入口
- `client.html`
  - 客户端 demo 页面
- `platform.html`
  - 平台端 demo 页面

## 代码职责

- `shared.js`
  - 共享 demo 状态、默认数据、存储读写、通用格式化与公共工具
- `client.js`
  - 客户端页面逻辑
  - 包含登录、检测工具、运行态、记录、设置、相机/模型管理等交互
- `platform.js`
  - 平台端页面逻辑
  - 包含客户端管理、筛选、账号中心等交互
- `styles.css`
  - 当前 demo 的共享样式

## 依赖关系

- `client.html` 加载顺序：`shared.js` -> `client.js`
- `platform.html` 加载顺序：`shared.js` -> `platform.js`

## 当前整理结论

- `client.js` 是当前最重的文件，后续如需继续整理，应优先从这里入手
- 历史遗留的 `app.js` 已移至 `archive/product-v1_3-legacy/`
