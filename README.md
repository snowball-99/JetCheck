# JetCheck

JetCheck 产品工作区仓库，按 `workspace-first` 组织。

## 结构

- `workspaces/`：正在推进的工作区
- `reference/`：长期参考材料
- `archive/`：停用或冻结材料

## 现有工作区

- `workspaces/product-v1_3-dev/`
  - JetCheck 1.3 增量开发
- `workspaces/product-v1_4-dev/`
  - JetCheck 1.4 开发（尺寸检测场景支持）

## 使用原则

- 当前方案优先放在对应 `workspace/`
- `reference/` 默认只作参考
- 未明确说明时，不跨 workspace 修改

## 长期协作规则

### 文档规则

1. 文档只记录当前阶段对某个议题的结论，不写大段铺垫、计划和重复解释。
2. 优先少而准，不为了“完整感”额外拆文档。
3. 同一类信息只保留一个主入口，避免多个文档重复表达。
4. `README` 只负责说明工作区里有什么、当前到哪一步、先看什么。
5. 真正有设计价值的结论才进入独立文档，例如对象、流程、规则、范围、命名。
6. 文档默认写给“下一位接手的人”，目标是快速理解，不是展示推导过程。
7. 同一句话不要滥用换行；能一段说清的，不拆成很多空行和小标题。
8. 建议、待办、备选项只在确有决策价值时保留，且要尽量短。

### 产出规则

1. 先收口术语，再写结论，避免文档里多套叫法并存。
2. 先改主入口文档，再补充细分文档，避免信息漂移。
3. 新文档若不能明显减少沟通成本，默认不建。
4. 文档一旦过长，应优先压缩，而不是继续追加。

### 界面代码规则

1. 界面默认只放四类信息：对象、操作、结果、状态；不能归到这四类的文案，默认不放。
2. 禁止为了“解释方案”在界面里塞大段说明、结论、阶段描述、版本背景或设计意图。
3. `Demo`、版本号、阶段名、模拟动作、说明性标题这类文字，若不直接服务当前操作，默认删除。
4. 每个文案元素都要能回答一个实际问题，例如“这是哪个对象”“现在能做什么”“结果是多少”“当前是否异常”。
5. 界面优先表达结构，不替代产品文档；需要解释的内容，应优先回到 README 或设计文档，而不是写进页面。
6. 做原型时宁可信息偏少，也不要用大量占位文案制造误导。
7. demo 不只是演示功能，也要服务原型评审；默认按“可继续演进的正式界面骨架”来设计，不能为了快而先搭错误框架。
8. 大框架优先级高于局部细节；若信息架构、导航层级、主工作区布局存在不确定性，先和用户对齐，再进入细节实现。
9. 面向用户的易懂、易用、友好不能因为是 demo 而降低标准；用户第一次看到页面，应能理解自己在哪、当前对象是什么、下一步能做什么。

## 命名建议

- 工作区：`product-版本-状态` 或 `project-项目名-based-on-版本`
- `reference/` 的分类和命名后续再整理，以当前目录实际内容为准

## Cloudflare Pages Demo 发布

仓库已经补了一套面向 Cloudflare Pages 的静态发布构建，目标是把当前 `workspaces/*/demo` 页面统一整理成一个可公开访问的发布站。

### 本地生成发布目录

1. 运行 `python3 scripts/build_pages.py`
2. 构建产物输出到 `dist/cloudflare-pages/`
3. 如需本地预览，运行 `python3 -m http.server 8788 -d dist/cloudflare-pages`
4. 打开 `http://localhost:8788`

构建脚本会自动：

1. 复制 `workspaces/` 和 `reference/` 到发布目录
2. 保留原始 demo 相对路径，避免图片和脚本在线上失效
3. 在发布目录根部生成一个公开首页 `index.html`
4. 为复制过去的 Markdown 生成对应的 `.html` 浏览页，保证 demo 中的 README 链接在线可打开
5. 自动跳过超过 Cloudflare Pages 单文件上限的附件，避免大文件阻断部署

### Cloudflare Pages 推荐配置

如果你想让每次提交后自动更新 demo，优先使用 Pages 的 Git 集成：

1. 在 Cloudflare Dashboard 进入 `Workers & Pages`
2. 选择 `Create application` -> `Pages` -> `Connect to Git`
3. 连接这个仓库
4. Build command 填 `python3 scripts/build_pages.py`
5. Build output directory 填 `dist/cloudflare-pages`
6. Root directory 保持仓库根目录即可

如果你暂时不接 Git，也可以先做 Direct Upload：

1. 先本地运行 `python3 scripts/build_pages.py`
2. 再执行 `npx wrangler pages deploy dist/cloudflare-pages --project-name=<你的项目名>`

### 当前发布后的入口约定

发布成功后建议优先分享下面两类地址：

1. 站点首页 `/`
2. 工作区真实目录 `/workspaces/<workspace>/demo/`

例如：

1. `/workspaces/product-v1_4-dev/demo/`
2. `/workspaces/product-v1_4-dev/demo/client.html`
3. `/workspaces/product-v1_4-dev/demo/platform.html`

如有歧义，先确认当前 workspace，再修改。
