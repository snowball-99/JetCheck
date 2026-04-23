# JetCheck

JetCheck 当前按“大类先分开、工作区各自独立”的方式整理。

## 根目录结构

- `workspaces/`
  - 正在推进的主线版本和项目定制版本
- `publish-site/`
  - 发布站相关的配置、脚本、说明和构建产物
- `archive/`
  - 备份、停用版本、历史遗留材料

## 使用规则

1. 默认只修改自己负责的 `workspace`
2. 发布站相关内容统一在 `publish-site/` 里维护
3. 历史材料和备份不要和当前工作区混放

## 当前工作区

- `workspaces/product-v1_3-dev/`
  - JetCheck 1.3 主线
- `workspaces/product-v1_4-dev/`
  - JetCheck 1.4 主线
- `workspaces/project-sanyo-based-on-v1_3-dev/`
  - 三洋定制版本

## 发布站说明

发布站的详细说明、配置方式和构建/发布命令，统一看：

- `publish-site/README.md`

如果你不想打开终端，可以直接双击仓库根目录里的：

- `打开发布站.command`
  - 自动启动本地服务，并打开浏览器进入管理台
  - 管理台页面里可以直接切换到发布站首页，不需要再开第二个入口
- `打开发布站.bat`
  - Windows 版启动文件
  - 自动启动本地服务，并打开浏览器进入管理台

注意：

1. 双击后会弹出终端窗口，这是正常的
2. 这个窗口不要关闭，关闭后本地服务也会停止
3. 如果浏览器没有自动打开，可以按终端窗口里显示的地址手动访问
4. Windows 电脑需要本机已经装好 Python，并且 `python` 命令可用

## 协作约定

1. 改工作区内容时，只动：
   - `workspaces/<workspace>/demo/`
   - `workspaces/<workspace>/docs/`
   - `workspaces/<workspace>/site.json`
   - `workspaces/<workspace>/updates.md`
2. 改发布站标题、分组和管理台时，去 `publish-site/`
3. 旧版本、备份和不再推进的内容，统一归到 `archive/`
