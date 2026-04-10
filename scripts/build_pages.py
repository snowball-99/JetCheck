from __future__ import annotations

import html
import re
import shutil
from pathlib import Path


REPO_ROOT = Path.cwd()
OUTPUT_DIR = REPO_ROOT / "dist" / "cloudflare-pages"
WORKSPACE_ROOT = REPO_ROOT / "workspaces"
PAGES_FILE_SIZE_LIMIT = 25 * 1024 * 1024

ENTRY_LABELS = {
    "index.html": "总入口",
    "dimension-tool.html": "尺寸工具",
    "client.html": "客户端",
    "platform.html": "平台端",
}

ENTRY_ORDER = ["index.html", "dimension-tool.html", "client.html", "platform.html"]


def main() -> None:
    reset_output()
    copy_root_assets()
    generate_markdown_html(OUTPUT_DIR)
    rewrite_markdown_links(OUTPUT_DIR)

    demos = discover_demos()
    write_landing_page(demos)
    write_not_found_page()
    write_headers()

    published = ", ".join(demo["workspace"] for demo in demos)
    print(f"Cloudflare Pages output ready at {OUTPUT_DIR.relative_to(REPO_ROOT)}")
    print(f"Published demo workspaces: {published}")


def reset_output() -> None:
    shutil.rmtree(OUTPUT_DIR, ignore_errors=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def copy_root_assets() -> None:
    copy_recursive("workspaces")
    copy_recursive("reference")
    copy_file("README.md")


def copy_recursive(relative_path: str) -> None:
    source = REPO_ROOT / relative_path
    target = OUTPUT_DIR / relative_path
    skipped_files: list[Path] = []

    def ignore_large_files(_dir: str, names: list[str]) -> set[str]:
        ignored: set[str] = set()
        current_dir = Path(_dir)

        for name in names:
            candidate = current_dir / name
            if candidate.is_file() and candidate.stat().st_size > PAGES_FILE_SIZE_LIMIT:
                ignored.add(name)
                skipped_files.append(candidate.relative_to(REPO_ROOT))

        return ignored

    shutil.copytree(source, target, dirs_exist_ok=True, ignore=ignore_large_files)

    for skipped_file in skipped_files:
        print(f"Skipped oversized file: {skipped_file}")


def copy_file(relative_path: str) -> None:
    source = REPO_ROOT / relative_path
    target = OUTPUT_DIR / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def discover_demos() -> list[dict[str, object]]:
    demos: list[dict[str, object]] = []

    for workspace_dir in sorted(WORKSPACE_ROOT.iterdir()):
        if not workspace_dir.is_dir():
            continue

        demo_dir = workspace_dir / "demo"
        if not (demo_dir / "index.html").exists():
            continue

        readme_path = workspace_dir / "README.md"
        readme_content = read_text(readme_path) if readme_path.exists() else ""

        html_entries = sorted(
            [create_entry(item.name, workspace_dir.name) for item in demo_dir.iterdir() if item.is_file() and item.suffix == ".html"],
            key=lambda item: entry_sort_key(item["file_name"]),
        )

        demos.append(
            {
                "workspace": workspace_dir.name,
                "title": extract_title(readme_content, workspace_dir.name),
                "summary": extract_summary(readme_content, workspace_dir.name),
                "readme_path": f"/workspaces/{workspace_dir.name}/README.html",
                "demo_path": f"/workspaces/{workspace_dir.name}/demo/",
                "entries": html_entries,
            }
        )

    return sorted(demos, key=workspace_sort_key)


def create_entry(file_name: str, workspace: str) -> dict[str, str]:
    name_without_ext = file_name.removesuffix(".html")
    direct_path = f"/workspaces/{workspace}/demo/" if file_name == "index.html" else f"/workspaces/{workspace}/demo/{file_name}"

    return {
        "file_name": file_name,
        "label": ENTRY_LABELS.get(file_name, name_without_ext),
        "direct_path": direct_path,
    }


def entry_sort_key(file_name: str) -> tuple[int, str]:
    order = ENTRY_ORDER.index(file_name) if file_name in ENTRY_ORDER else len(ENTRY_ORDER)
    return (order, file_name)


def workspace_sort_key(demo: dict[str, object]) -> tuple[int, int, int, str]:
    workspace = str(demo["workspace"])
    version = parse_product_version(workspace)
    if version is None:
        return (1, 0, 0, workspace)
    return (0, -version[0], -version[1], workspace)


def parse_product_version(workspace: str) -> tuple[int, int] | None:
    match = re.match(r"^product-v(\d+)_(\d+)", workspace)
    if not match:
        return None
    return int(match.group(1)), int(match.group(2))


def extract_title(readme_content: str, fallback: str) -> str:
    for raw_line in readme_content.splitlines():
        line = raw_line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def extract_summary(readme_content: str, fallback: str) -> str:
    for raw_line in readme_content.splitlines():
        line = raw_line.strip()
        if line and not line.startswith("#"):
            return line
    return f"{fallback} demo 发布入口"


def generate_markdown_html(root_dir: Path) -> None:
    for markdown_file in root_dir.rglob("*.md"):
        relative_path = markdown_file.relative_to(OUTPUT_DIR).as_posix()
        content = read_text(markdown_file)
        html_path = markdown_file.with_suffix(".html")
        title = extract_title(content, markdown_file.name)
        parent_link = compute_parent_link(relative_path)
        write_text(
            html_path,
            render_markdown_wrapper(
                title=title,
                relative_path=relative_path,
                parent_link=parent_link,
                content=content,
            ),
        )


def compute_parent_link(relative_markdown_path: str) -> str:
    parts = relative_markdown_path.split("/")
    if len(parts) == 1:
        return "/"
    return "/" + "/".join(parts[:-1]) + "/"


def render_markdown_wrapper(*, title: str, relative_path: str, parent_link: str, content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{escape_html(title)}</title>
    <style>
      :root {{
        color-scheme: light;
        --bg: #f5efe4;
        --panel: rgba(255, 252, 247, 0.94);
        --line: rgba(23, 39, 56, 0.12);
        --text: #172738;
        --muted: #566778;
        --accent: #1d5b88;
      }}

      * {{
        box-sizing: border-box;
      }}

      body {{
        margin: 0;
        min-height: 100vh;
        font-family: "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top, rgba(29, 91, 136, 0.14), transparent 42%),
          linear-gradient(180deg, #fcf8f0 0%, var(--bg) 100%);
      }}

      main {{
        width: min(1080px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 48px 0 64px;
      }}

      .hero {{
        margin-bottom: 20px;
      }}

      .eyebrow {{
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }}

      h1 {{
        margin: 0;
        font-size: clamp(28px, 5vw, 44px);
        line-height: 1.08;
      }}

      .meta {{
        margin: 12px 0 0;
        color: var(--muted);
        font-size: 14px;
      }}

      .actions {{
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin: 24px 0;
      }}

      .button {{
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 11px 16px;
        border-radius: 999px;
        border: 1px solid rgba(29, 91, 136, 0.18);
        background: rgba(255, 255, 255, 0.82);
        color: var(--text);
        text-decoration: none;
      }}

      .panel {{
        padding: 24px;
        border-radius: 24px;
        border: 1px solid var(--line);
        background: var(--panel);
        backdrop-filter: blur(16px);
        box-shadow: 0 20px 60px rgba(73, 57, 20, 0.12);
      }}

      pre {{
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: "SF Mono", "Fira Code", "Menlo", monospace;
        font-size: 13px;
        line-height: 1.7;
      }}
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">JetCheck Docs Mirror</p>
        <h1>{escape_html(title)}</h1>
        <p class="meta">当前页面是为 Cloudflare Pages 生成的 Markdown 浏览页，原文件路径：{escape_html(relative_path)}</p>
      </section>
      <div class="actions">
        <a class="button" href="{escape_attr(parent_link)}">返回上一级</a>
        <a class="button" href="{escape_attr('/' + relative_path)}">查看原始 Markdown</a>
        <a class="button" href="/">返回 Demo 首页</a>
      </div>
      <section class="panel">
        <pre>{escape_html(content)}</pre>
      </section>
    </main>
  </body>
</html>
"""


def rewrite_markdown_links(root_dir: Path) -> None:
    pattern = re.compile(r'href=(["\'])([^"\']+)\.md\1')
    for html_file in root_dir.rglob("*.html"):
        content = read_text(html_file)
        next_content = pattern.sub(r'href=\1\2.html\1', content)
        if next_content != content:
            write_text(html_file, next_content)


def write_landing_page(demos: list[dict[str, object]]) -> None:
    latest_demo = demos[0] if demos else None
    latest_path = latest_demo["demo_path"] if latest_demo else "/"
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JetCheck Demo 发布站</title>
    <style>
      :root {{
        color-scheme: light;
        --bg: #f3eadb;
        --panel: rgba(255, 251, 244, 0.9);
        --panel-strong: rgba(255, 255, 255, 0.96);
        --text: #182433;
        --muted: #5d6d7c;
        --line: rgba(24, 36, 51, 0.12);
        --accent: #0f766e;
        --accent-2: #1d4ed8;
        --shadow: 0 24px 80px rgba(85, 59, 16, 0.14);
      }}

      * {{
        box-sizing: border-box;
      }}

      body {{
        margin: 0;
        min-height: 100vh;
        font-family: "SF Pro Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(15, 118, 110, 0.15), transparent 36%),
          radial-gradient(circle at top right, rgba(29, 78, 216, 0.12), transparent 34%),
          linear-gradient(180deg, #fdfaf4 0%, var(--bg) 100%);
      }}

      main {{
        width: min(1160px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 48px 0 80px;
      }}

      .hero {{
        display: grid;
        gap: 28px;
        align-items: end;
        margin-bottom: 36px;
      }}

      .eyebrow {{
        margin: 0 0 14px;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
      }}

      h1 {{
        margin: 0;
        font-size: clamp(34px, 6vw, 64px);
        line-height: 0.98;
        letter-spacing: -0.03em;
      }}

      .hero-copy {{
        max-width: 760px;
      }}

      .hero-copy p {{
        margin: 16px 0 0;
        color: var(--muted);
        line-height: 1.75;
        font-size: 16px;
      }}

      .hero-actions {{
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }}

      .button {{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 18px;
        border-radius: 999px;
        border: 1px solid transparent;
        text-decoration: none;
        font-weight: 600;
      }}

      .button-primary {{
        color: white;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        box-shadow: 0 18px 36px rgba(15, 118, 110, 0.22);
      }}

      .button-secondary {{
        color: var(--text);
        border-color: rgba(24, 36, 51, 0.12);
        background: rgba(255, 255, 255, 0.72);
      }}

      .info-grid {{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 30px;
      }}

      .info-card,
      .demo-card {{
        position: relative;
        overflow: hidden;
        padding: 22px;
        border-radius: 24px;
        border: 1px solid var(--line);
        background: var(--panel);
        backdrop-filter: blur(16px);
        box-shadow: var(--shadow);
      }}

      .info-card strong,
      .demo-card strong {{
        display: block;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }}

      .info-card p {{
        margin: 12px 0 0;
        line-height: 1.7;
        color: var(--muted);
      }}

      .demo-grid {{
        display: grid;
        gap: 18px;
      }}

      .demo-card::after {{
        content: "";
        position: absolute;
        inset: auto -10% -55% auto;
        width: 220px;
        height: 220px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(15, 118, 110, 0.12), transparent 68%);
        pointer-events: none;
      }}

      .demo-header {{
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
      }}

      .demo-title {{
        margin: 10px 0 0;
        font-size: clamp(22px, 3vw, 30px);
      }}

      .demo-summary {{
        margin: 12px 0 0;
        color: var(--muted);
        line-height: 1.75;
      }}

      .chip {{
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(24, 36, 51, 0.06);
        color: var(--text);
        font-size: 13px;
      }}

      .entry-row {{
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 18px;
      }}

      .entry-link {{
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(24, 36, 51, 0.1);
        color: var(--text);
        text-decoration: none;
        background: var(--panel-strong);
      }}

      .entry-link:hover,
      .button:hover {{
        transform: translateY(-1px);
      }}

      .meta-row {{
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
        color: var(--muted);
        font-size: 14px;
      }}

      code {{
        font-family: "SF Mono", "Fira Code", "Menlo", monospace;
        font-size: 0.95em;
      }}

      @media (max-width: 720px) {{
        main {{
          width: min(100vw - 20px, 1160px);
          padding: 26px 0 56px;
        }}

        .demo-header {{
          align-items: flex-start;
          flex-direction: column;
        }}
      }}
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Cloudflare Pages Ready</p>
          <h1>JetCheck Demo 发布站</h1>
          <p>这里聚合了仓库内当前可公开访问的静态 demo。每次执行 <code>python3 scripts/build_pages.py</code>，发布目录都会重新生成，适合直接接到 Cloudflare Pages 上做长期访问和评审分享。</p>
        </div>
        <div class="hero-actions">
          <a class="button button-primary" href="{escape_attr(str(latest_path))}">打开最新主线 Demo</a>
          <a class="button button-secondary" href="/README.html">查看仓库 README</a>
        </div>
      </section>

      <section class="info-grid">
        <article class="info-card">
          <strong>统一入口</strong>
          <p>发布后可以先从首页进入，再按工作区跳到真实 demo 目录，例如 <code>{escape_html(str(latest_path))}</code>。</p>
        </article>
        <article class="info-card">
          <strong>目录保真</strong>
          <p>实际页面仍然使用原始 <code>workspaces/...</code> 目录结构，现有图片、脚本和相对路径不会因为上线而失效。</p>
        </article>
        <article class="info-card">
          <strong>文档可看</strong>
          <p>仓库内复制到发布目录的 Markdown 会自动生成一个对应的 <code>.html</code> 浏览页，demo 里的 README 链接在线上也能打开。</p>
        </article>
      </section>

      <section class="demo-grid">
        {''.join(render_demo_card(demo) for demo in demos)}
      </section>
    </main>
  </body>
</html>
"""
    write_text(OUTPUT_DIR / "index.html", html_content)


def render_demo_card(demo: dict[str, object]) -> str:
    entries = "".join(
        f'<a class="entry-link" href="{escape_attr(str(entry["direct_path"]))}">{escape_html(str(entry["label"]))}</a>'
        for entry in demo["entries"]
    )
    return f"""<article class="demo-card">
  <div class="demo-header">
    <div>
      <strong>{escape_html(str(demo["workspace"]))}</strong>
      <h2 class="demo-title">{escape_html(str(demo["title"]))}</h2>
    </div>
    <span class="chip">{escape_html(str(demo["demo_path"]))}</span>
  </div>
  <p class="demo-summary">{escape_html(str(demo["summary"]))}</p>
  <div class="entry-row">
    {entries}
    <a class="entry-link" href="{escape_attr(str(demo["readme_path"]))}">工作区 README</a>
  </div>
  <div class="meta-row">
    <span>Demo 目录：<code>{escape_html(str(demo["demo_path"]))}</code></span>
    <span>README：<code>{escape_html(str(demo["readme_path"]))}</code></span>
  </div>
</article>"""


def write_not_found_page() -> None:
    write_text(
        OUTPUT_DIR / "404.html",
        """<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>页面未找到</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: linear-gradient(180deg, #fdfaf4 0%, #f3eadb 100%);
        font-family: "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #182433;
      }

      main {
        width: min(560px, 100%);
        padding: 28px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(24, 36, 51, 0.1);
        box-shadow: 0 24px 60px rgba(85, 59, 16, 0.12);
      }

      h1 {
        margin: 0 0 12px;
        font-size: 32px;
      }

      p {
        margin: 0 0 18px;
        line-height: 1.7;
        color: #5d6d7c;
      }

      a {
        color: #0f766e;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>这个地址没有对应页面</h1>
      <p>可以回到发布站首页重新进入 demo，或者直接访问 <code>/workspaces/&lt;workspace&gt;/demo/</code> 形式的真实目录。</p>
      <a href="/">返回首页</a>
    </main>
  </body>
</html>
""",
    )


def write_headers() -> None:
    write_text(
        OUTPUT_DIR / "_headers",
        """/*.html
  Cache-Control: no-cache
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
""",
    )


def read_text(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8")


def write_text(file_path: Path, content: str) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")


def escape_html(value: str) -> str:
    return html.escape(value)


def escape_attr(value: str) -> str:
    return html.escape(value, quote=True)


if __name__ == "__main__":
    main()
