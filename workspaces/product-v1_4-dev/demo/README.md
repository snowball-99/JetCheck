# product-v1_4-dev demo

1.4 工作区的活跃 demo。当前重点是“独立本地尺寸检测工具”雏形。

## 入口

- `index.html`
  - demo 总入口（含尺寸工具入口）
- `dimension-tool.html`
  - 独立本地尺寸检测工具页面
- `client.html`
  - 客户端 demo 页面（运行态承载、记录体系）
- `platform.html`
  - 平台端 demo 页面

## 代码职责

- `dimension-tool.js`
  - 尺寸工具工作台交互：工程管理、向导式 Tab、样本切换、叠加绘制、属性区
- `shared.js`
  - 客户端/平台端共享状态与工具函数
- `client.js`
  - 客户端页面逻辑（登录、工具搭建、运行、记录、设置）
- `platform.js`
  - 平台端页面逻辑（客户端管理、筛选、账号中心）
- `styles.css`
  - 所有 demo 页共享样式（含尺寸工具样式块）

## 依赖关系

- `dimension-tool.html` 加载：`dimension-tool.js`
- `client.html` 加载顺序：`shared.js` -> `client.js`
- `platform.html` 加载顺序：`shared.js` -> `platform.js`

## 当前结论

- 尺寸能力先在独立本地工具推进，不嵌入现有客户端页面。
- 客户端继续负责正式运行与检测记录落库。
- 当前雏形采用桌面端工程工作台骨架：工程管理 / 向导式 Tab / 主画布 / 轻属性区。
