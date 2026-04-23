# 发布站说明

这里放 JetCheck 发布站相关的所有内容。

## 目录

- `site.json`
  - 发布站全局配置，例如站点标题、简介、首页分组
- `build_site.py`
  - 生成 Cloudflare Pages 静态站点
- `publish_site.py`
  - 一键构建并提交发布站相关改动
- `admin_console.py`
  - 本地管理台服务
- `cloudflare-pages/`
  - 构建产物，不要手工改

## 常用操作

### 本地构建

```bash
python3 publish-site/build_site.py
```

构建结果会输出到：

```text
publish-site/cloudflare-pages/
```

### 本地预览

```bash
python3 -m http.server 8788 -d publish-site/cloudflare-pages
```

然后打开：

- `http://localhost:8788`

### 打开本地管理台

```bash
python3 publish-site/admin_console.py
```

然后打开：

- `http://127.0.0.1:8789/admin/`

### 正式发布

```bash
python3 publish-site/publish_site.py "一句话说明这次改了什么"
```

这个脚本会自动：

1. 重新构建发布站
2. 暂存 `README.md`、`publish-site/`、`workspaces/` 下的改动
3. 创建提交
4. 推送到 `origin/main`

## Cloudflare Pages 配置

- Build command：`python3 publish-site/build_site.py`
- Build output directory：`publish-site/cloudflare-pages`
- Root directory：仓库根目录

## 维护原则

1. 平时只改源文件，不手工改 `cloudflare-pages/`
2. 如果源文件删了，但构建产物还在，重新运行一次构建即可
3. 工作区对外展示文案优先在各自的 `site.json` 和 `updates.md` 里维护
