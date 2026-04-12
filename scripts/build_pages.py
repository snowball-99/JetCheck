from __future__ import annotations

import html
import json
import os
import re
import shutil
import subprocess
from pathlib import Path


REPO_ROOT = Path.cwd()
OUTPUT_DIR = REPO_ROOT / "dist" / "cloudflare-pages"
WORKSPACE_ROOT = REPO_ROOT / "workspaces"
SITE_CONFIG_PATH = REPO_ROOT / "site" / "site.json"
LEGACY_SITE_CONFIG_PATH = REPO_ROOT / "site" / "demo-site.json"
WORKSPACE_SITE_CONFIG_NAME = "site.json"
WORKSPACE_UPDATES_NAME = "updates.md"
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

    site_config = load_site_config()
    demos = discover_demos(site_config)
    write_landing_page(demos, site_config)
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


def discover_demos(site_config: dict[str, object]) -> list[dict[str, object]]:
    demos: list[dict[str, object]] = []

    for workspace_dir in sorted(WORKSPACE_ROOT.iterdir()):
        if not workspace_dir.is_dir():
            continue

        demo_dir = workspace_dir / "demo"
        if not (demo_dir / "index.html").exists():
            continue

        readme_path = workspace_dir / "README.md"
        readme_content = read_text(readme_path) if readme_path.exists() else ""
        workspace_config = load_workspace_config(workspace_dir, site_config)

        html_entries = sorted(
            [create_entry(item.name, workspace_dir.name) for item in demo_dir.iterdir() if item.is_file() and item.suffix == ".html"],
            key=lambda item: entry_sort_key(item["file_name"]),
        )
        visible_entries = build_workspace_links(html_entries, workspace_config)

        demos.append(
            {
                "workspace": workspace_dir.name,
                "title": workspace_config.get("title") or extract_title(readme_content, workspace_dir.name),
                "summary": workspace_config.get("summary") or extract_summary(readme_content, workspace_dir.name),
                "group": str(workspace_config.get("group") or infer_workspace_group(workspace_dir.name)),
                "status": normalize_status(workspace_config.get("status")),
                "readme_path": f"workspaces/{workspace_dir.name}/README.html",
                "demo_path": f"workspaces/{workspace_dir.name}/demo/",
                "links": visible_entries,
                "updates": build_workspace_updates(workspace_dir, workspace_config),
            }
        )

    return sorted(demos, key=workspace_sort_key)


def create_entry(file_name: str, workspace: str) -> dict[str, str]:
    name_without_ext = file_name.removesuffix(".html")
    direct_path = f"workspaces/{workspace}/demo/" if file_name == "index.html" else f"workspaces/{workspace}/demo/{file_name}"

    return {
        "file_name": file_name,
        "label": ENTRY_LABELS.get(file_name, name_without_ext),
        "direct_path": direct_path,
    }


def filter_visible_entries(entries: list[dict[str, str]], workspace_config: dict[str, object]) -> list[dict[str, str]]:
    entry_config = workspace_config.get("entries", {}) if isinstance(workspace_config.get("entries", {}), dict) else {}
    visible_entries: list[dict[str, str]] = []

    for entry in entries:
        file_name = entry["file_name"]
        config = entry_config.get(file_name, {}) if isinstance(entry_config.get(file_name, {}), dict) else {}
        if file_name == "index.html":
            continue
        if config.get("hidden") is True:
            continue

        next_entry = dict(entry)
        if isinstance(config.get("label"), str) and config["label"].strip():
            next_entry["label"] = config["label"].strip()
        visible_entries.append(next_entry)

    return visible_entries


def build_workspace_links(entries: list[dict[str, str]], workspace_config: dict[str, object]) -> list[dict[str, str]]:
    configured_buttons = workspace_config.get("buttons", [])
    workspace_name = str(workspace_config.get("_workspace_name", "")).strip()
    if isinstance(configured_buttons, list) and configured_buttons:
        buttons: list[dict[str, str]] = []
        for button in configured_buttons:
            if not isinstance(button, dict):
                continue

            label = str(button.get("label", "")).strip()
            url = str(button.get("url", "")).strip()
            if not label or not url:
                continue

            normalized_url = resolve_workspace_link_url(url, workspace_name)
            next_button = {
                "label": label,
                "direct_path": normalized_url,
            }

            if is_external_url(normalized_url):
                next_button["target"] = "_blank"
                next_button["rel"] = "noreferrer"

            buttons.append(next_button)

        if buttons:
            return buttons

    return filter_visible_entries(entries, workspace_config)


def build_workspace_updates(workspace_dir: Path, workspace_config: dict[str, object]) -> list[dict[str, str]]:
    markdown_updates = parse_updates_markdown(workspace_dir / WORKSPACE_UPDATES_NAME)
    if markdown_updates:
        return markdown_updates

    configured_updates = workspace_config.get("updates", [])
    if isinstance(configured_updates, list) and configured_updates:
        updates: list[dict[str, str]] = []
        for item in configured_updates:
            if not isinstance(item, dict):
                continue

            date = str(item.get("date", "")).strip()
            text = update_display_text(item)
            detail = str(item.get("detail", "")).strip()
            if not date or not text:
                continue

            updates.append(
                {
                    "date": date,
                    "text": text,
                    "title": str(item.get("title", "")).strip(),
                    "detail": detail,
                }
            )

        if updates:
            return updates

    return get_workspace_updates(workspace_dir)


def entry_sort_key(file_name: str) -> tuple[int, str]:
    order = ENTRY_ORDER.index(file_name) if file_name in ENTRY_ORDER else len(ENTRY_ORDER)
    return (order, file_name)


def workspace_sort_key(demo: dict[str, object]) -> tuple[int, int, int, str]:
    workspace = str(demo["workspace"])
    version = parse_product_version(workspace)
    if version is None:
        return (1, 0, 0, workspace)
    return (0, -version[0], -version[1], workspace)


def infer_workspace_group(workspace: str) -> str:
    if workspace.startswith("project-"):
        return "project"
    return "main"


def normalize_status(raw_status: object) -> dict[str, str]:
    if isinstance(raw_status, dict):
        label = str(raw_status.get("label", "")).strip()
        tone = str(raw_status.get("tone", "")).strip() or "neutral"
        if label:
            return {"label": label, "tone": tone}

    if isinstance(raw_status, str) and raw_status.strip():
        return {"label": raw_status.strip(), "tone": "neutral"}

    return {"label": "未标注", "tone": "neutral"}


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
        home_link = relative_href(relative_path, "index.html")
        write_text(
            html_path,
            render_markdown_wrapper(
                title=title,
                relative_path=relative_path,
                home_link=home_link,
                content=content,
            ),
        )


def render_markdown_wrapper(
    *,
    title: str,
    relative_path: str,
    home_link: str,
    content: str,
) -> str:
    rendered_content = render_markdown_content(relative_path, content, title)
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
        margin-bottom: 24px;
      }}

      h1 {{
        margin: 0;
        font-size: clamp(28px, 5vw, 44px);
        line-height: 1.08;
      }}

      .actions {{
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin: 0 0 24px;
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
        padding: 28px;
        border-radius: 24px;
        border: 1px solid var(--line);
        background: var(--panel);
        backdrop-filter: blur(16px);
        box-shadow: 0 20px 60px rgba(73, 57, 20, 0.12);
      }}

      .doc-body {{
        color: var(--text);
        line-height: 1.85;
        font-size: 16px;
      }}

      .doc-body > :first-child {{
        margin-top: 0;
      }}

      .doc-body > :last-child {{
        margin-bottom: 0;
      }}

      .doc-body h1,
      .doc-body h2,
      .doc-body h3,
      .doc-body h4 {{
        line-height: 1.25;
        margin: 1.8em 0 0.65em;
      }}

      .doc-body h1 {{
        font-size: 32px;
      }}

      .doc-body h2 {{
        font-size: 26px;
      }}

      .doc-body h3 {{
        font-size: 21px;
      }}

      .doc-body p,
      .doc-body ul,
      .doc-body ol,
      .doc-body blockquote {{
        margin: 0 0 1em;
      }}

      .doc-body ul,
      .doc-body ol {{
        padding-left: 1.4em;
      }}

      .doc-body li + li {{
        margin-top: 0.45em;
      }}

      .doc-body a {{
        color: var(--accent);
      }}

      .doc-body code {{
        font-family: "SF Mono", "Fira Code", "Menlo", monospace;
        font-size: 0.92em;
        background: rgba(29, 91, 136, 0.08);
        border-radius: 8px;
        padding: 0.15em 0.4em;
      }}

      .doc-body pre {{
        margin: 0 0 1.2em;
        padding: 16px 18px;
        overflow-x: auto;
        border-radius: 18px;
        background: rgba(23, 39, 56, 0.94);
        color: #f5f2ea;
      }}

      .doc-body pre code {{
        background: transparent;
        padding: 0;
        border-radius: 0;
        color: inherit;
        font-size: 13px;
        line-height: 1.7;
      }}

      .doc-body blockquote {{
        padding: 0.2em 1em;
        border-left: 4px solid rgba(29, 91, 136, 0.25);
        color: var(--muted);
        background: rgba(29, 91, 136, 0.04);
        border-radius: 0 14px 14px 0;
      }}
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>{escape_html(title)}</h1>
      </section>
      <div class="actions">
        <a class="button" href="{escape_attr(home_link)}" target="_blank" rel="noreferrer">返回首页</a>
      </div>
      <section class="panel doc-body">
        {rendered_content}
      </section>
    </main>
  </body>
</html>
"""


def render_markdown_content(relative_path: str, content: str, page_title: str) -> str:
    lines = content.splitlines()
    for index, line in enumerate(lines):
        if not line.strip():
            continue
        first_heading = re.match(r"^#\s+(.*)$", line.strip())
        if first_heading and first_heading.group(1).strip() == page_title.strip():
            lines = lines[index + 1 :]
        break
    blocks: list[str] = []
    paragraph_lines: list[str] = []
    list_items: list[str] = []
    list_kind: str | None = None
    in_code = False
    code_lines: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        text = " ".join(line.strip() for line in paragraph_lines if line.strip())
        if text:
            blocks.append(f"<p>{render_inline_markdown(text, relative_path)}</p>")
        paragraph_lines = []

    def flush_list() -> None:
        nonlocal list_items, list_kind
        if not list_items or not list_kind:
            list_items = []
            list_kind = None
            return
        tag = "ol" if list_kind == "ol" else "ul"
        items_html = "".join(f"<li>{item}</li>" for item in list_items)
        blocks.append(f"<{tag}>{items_html}</{tag}>")
        list_items = []
        list_kind = None

    def flush_code() -> None:
        nonlocal code_lines
        blocks.append(f"<pre><code>{escape_html(chr(10).join(code_lines))}</code></pre>")
        code_lines = []

    for raw_line in lines:
        stripped = raw_line.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            flush_list()
            if in_code:
                flush_code()
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_lines.append(raw_line)
            continue

        if not stripped:
            flush_paragraph()
            flush_list()
            continue

        heading_match = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if heading_match:
            flush_paragraph()
            flush_list()
            level = len(heading_match.group(1))
            text = render_inline_markdown(heading_match.group(2).strip(), relative_path)
            blocks.append(f"<h{level}>{text}</h{level}>")
            continue

        quote_match = re.match(r"^>\s?(.*)$", stripped)
        if quote_match:
            flush_paragraph()
            flush_list()
            quote_text = render_inline_markdown(quote_match.group(1).strip(), relative_path)
            blocks.append(f"<blockquote><p>{quote_text}</p></blockquote>")
            continue

        unordered_match = re.match(r"^[-*]\s+(.*)$", stripped)
        if unordered_match:
            flush_paragraph()
            item = render_inline_markdown(unordered_match.group(1).strip(), relative_path)
            if list_kind != "ul":
                flush_list()
                list_kind = "ul"
            list_items.append(item)
            continue

        ordered_match = re.match(r"^\d+\.\s+(.*)$", stripped)
        if ordered_match:
            flush_paragraph()
            item = render_inline_markdown(ordered_match.group(1).strip(), relative_path)
            if list_kind != "ol":
                flush_list()
                list_kind = "ol"
            list_items.append(item)
            continue

        paragraph_lines.append(raw_line)

    flush_paragraph()
    flush_list()
    if in_code:
        flush_code()

    return "\n".join(blocks) if blocks else "<p>当前文档没有可显示内容。</p>"


def render_inline_markdown(text: str, relative_path: str) -> str:
    placeholders: list[str] = []

    def store(fragment: str) -> str:
        placeholders.append(fragment)
        return f"@@PLACEHOLDER_{len(placeholders) - 1}@@"

    escaped = escape_html(text)
    escaped = re.sub(
        r"`([^`]+)`",
        lambda match: store(f"<code>{escape_html(match.group(1))}</code>"),
        escaped,
    )
    escaped = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda match: store(render_markdown_link(match.group(1), match.group(2), relative_path)),
        escaped,
    )
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", escaped)

    for index, fragment in enumerate(placeholders):
        escaped = escaped.replace(f"@@PLACEHOLDER_{index}@@", fragment)

    return escaped


def render_markdown_link(label: str, target: str, relative_path: str) -> str:
    href = normalize_markdown_href(target.strip(), relative_path)
    attrs = ""
    if is_external_url(href):
        attrs = ' target="_blank" rel="noreferrer"'
    return f'<a href="{escape_attr(href)}"{attrs}>{escape_html(label.strip())}</a>'


def normalize_markdown_href(target: str, relative_path: str) -> str:
    if not target:
        return "#"
    if is_external_url(target) or target.startswith("#"):
        return target

    anchor = ""
    base_target = target
    if "#" in target:
        base_target, anchor = target.split("#", 1)
        anchor = "#" + anchor

    normalized = base_target
    if normalized.endswith(".md"):
        normalized = normalized[:-3] + ".html"

    return relative_href(relative_path, normalized) + anchor


def rewrite_markdown_links(root_dir: Path) -> None:
    pattern = re.compile(r'href=(["\'])([^"\']+)\.md\1')
    for html_file in root_dir.rglob("*.html"):
        content = read_text(html_file)
        next_content = pattern.sub(r'href=\1\2.html\1', content)
        if next_content != content:
            write_text(html_file, next_content)


def write_landing_page(demos: list[dict[str, object]], site_config: dict[str, object]) -> None:
    site_meta = site_config.get("site", {}) if isinstance(site_config.get("site", {}), dict) else {}
    site_title = site_meta.get("title") or "JetCheck Demo 发布站"
    site_intro = site_meta.get("intro") or "查看当前对外共享的 Demo 版本。"
    sections = build_sections(demos, site_config)
    initial_tab = str(site_meta.get("default_section") or (sections[0]["key"] if sections else "main"))
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{escape_html(str(site_title))}</title>
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
        gap: 22px;
        align-items: end;
        margin-bottom: 36px;
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
        margin: 0;
        color: var(--muted);
        line-height: 1.75;
        font-size: 16px;
      }}

      .section-block {{
        margin-top: 28px;
      }}

      .section-title {{
        margin: 0 0 8px;
        font-size: clamp(24px, 4vw, 34px);
      }}

      .section-desc {{
        margin: 0 0 18px;
        color: var(--muted);
        line-height: 1.7;
      }}

      .tabs {{
        display: inline-flex;
        gap: 10px;
        padding: 6px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.56);
      }}

      .tab-button {{
        appearance: none;
        border: 0;
        background: transparent;
        color: var(--muted);
        border-radius: 999px;
        padding: 10px 16px;
        font: inherit;
        cursor: pointer;
      }}

      .tab-button.is-active {{
        color: white;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        box-shadow: 0 10px 24px rgba(15, 118, 110, 0.18);
      }}

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

      .demo-card strong {{
        display: block;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
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
        align-items: flex-start;
        justify-content: space-between;
      }}

      .demo-title {{
        margin: 0;
        font-size: clamp(22px, 3vw, 30px);
      }}

      .status-badge {{
        display: inline-flex;
        align-items: center;
        padding: 7px 12px;
        border-radius: 999px;
        font-size: 13px;
        white-space: nowrap;
      }}

      .status-badge[data-tone="design"] {{
        background: rgba(217, 119, 6, 0.12);
        color: #9a5b00;
      }}

      .status-badge[data-tone="active"] {{
        background: rgba(15, 118, 110, 0.12);
        color: #0f766e;
      }}

      .status-badge[data-tone="archived"] {{
        background: rgba(71, 85, 105, 0.12);
        color: #475569;
      }}

      .status-badge[data-tone="neutral"] {{
        background: rgba(24, 36, 51, 0.08);
        color: var(--text);
      }}

      .update-dot {{
        display: none;
        width: 8px;
        height: 8px;
        margin-right: 8px;
        border-radius: 999px;
        background: #dc2626;
        box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
        flex: 0 0 auto;
      }}

      .updates-item[data-unread="true"] .update-dot {{
        display: inline-block;
      }}

      .demo-summary {{
        margin: 12px 0 0;
        color: var(--muted);
        line-height: 1.75;
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

      .updates-block {{
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid rgba(24, 36, 51, 0.08);
      }}

      .updates-title {{
        margin: 0 0 12px;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }}

      .updates-list {{
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 8px;
      }}

      .updates-item {{
        font-size: 14px;
        line-height: 1.6;
        color: var(--text);
      }}

      .updates-line {{
        display: inline-flex;
        align-items: center;
      }}

      .updates-detail {{
        color: var(--muted);
        line-height: 1.6;
        font-size: 13px;
        margin-top: 8px;
      }}

      .updates-more {{
        margin-top: 12px;
      }}

      .updates-toggle {{
        cursor: pointer;
        color: var(--accent);
        font-size: 14px;
        list-style: none;
      }}

      .updates-toggle::-webkit-details-marker {{
        display: none;
      }}

      .updates-more[open] .updates-toggle {{
        margin-bottom: 12px;
      }}

      .entry-link:hover,
        .status-badge:hover {{
        transform: translateY(-1px);
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
          <h1>{escape_html(str(site_title))}</h1>
          <p>{escape_html(str(site_intro))}</p>
        </div>
        <div class="tabs" role="tablist" aria-label="版本分组">
          {''.join(render_tab_button(section, initial_tab) for section in sections)}
        </div>
      </section>

      {''.join(render_section(section) for section in sections)}
    </main>
    <script>
      const sectionPanels = Array.from(document.querySelectorAll('[data-section-panel]'));
      const sectionTabs = Array.from(document.querySelectorAll('[data-tab-target]'));
      const storageKey = 'jetcheck-demo-site-seen-updates';

      function activateTab(key) {{
        sectionTabs.forEach((button) => {{
          const active = button.dataset.tabTarget === key;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-selected', active ? 'true' : 'false');
        }});

        sectionPanels.forEach((panel) => {{
          panel.hidden = panel.dataset.sectionPanel !== key;
        }});
      }}

      sectionTabs.forEach((button) => {{
        button.addEventListener('click', () => activateTab(button.dataset.tabTarget));
      }});

      activateTab('{escape_js(initial_tab)}');

      function loadSeenMap() {{
        try {{
          const raw = JSON.parse(localStorage.getItem(storageKey) || '{{}}');
          if (!raw || typeof raw !== 'object') {{
            return {{}};
          }}

          const normalized = {{}};
          Object.entries(raw).forEach(([workspace, value]) => {{
            if (Array.isArray(value)) {{
              normalized[workspace] = value.filter(Boolean);
              return;
            }}

            if (typeof value === 'string' && value) {{
              normalized[workspace] = [value];
            }}
          }});
          return normalized;
        }} catch (error) {{
          return {{}};
        }}
      }}

      const seenMap = loadSeenMap();

      function markSeen(card) {{
        const workspace = card.dataset.workspace;
        if (!workspace) {{
          return;
        }}

        const signatures = Array.from(card.querySelectorAll('[data-update-signature]'))
          .map((item) => item.dataset.updateSignature)
          .filter(Boolean);

        if (!signatures.length) {{
          return;
        }}

        seenMap[workspace] = Array.from(new Set([...(seenMap[workspace] || []), ...signatures]));
        localStorage.setItem(storageKey, JSON.stringify(seenMap));

        card.querySelectorAll('[data-update-signature]').forEach((item) => {{
          item.dataset.unread = 'false';
        }});
      }}

      document.querySelectorAll('[data-workspace-card]').forEach((card) => {{
        const workspace = card.dataset.workspace;
        const seenSignatures = new Set(workspace ? (seenMap[workspace] || []) : []);

        card.querySelectorAll('[data-update-signature]').forEach((item) => {{
          const signature = item.dataset.updateSignature;
          item.dataset.unread = signature && !seenSignatures.has(signature) ? 'true' : 'false';
        }});

        card.querySelectorAll('a, details').forEach((node) => {{
          const eventName = node.tagName === 'DETAILS' ? 'toggle' : 'click';
          node.addEventListener(eventName, () => {{
            if (node.tagName !== 'DETAILS' || node.open) {{
              markSeen(card);
            }}
          }});
        }});
      }});
    </script>
  </body>
</html>
"""
    write_text(OUTPUT_DIR / "index.html", html_content)


def build_sections(demos: list[dict[str, object]], site_config: dict[str, object]) -> list[dict[str, object]]:
    site_meta = site_config.get("site", {}) if isinstance(site_config.get("site", {}), dict) else {}
    configured_sections = site_meta.get("sections", [])
    section_map: dict[str, dict[str, object]] = {}

    if isinstance(configured_sections, list):
        for item in configured_sections:
            if not isinstance(item, dict):
                continue
            key = str(item.get("key", "")).strip()
            title = str(item.get("title", "")).strip()
            if not key or not title:
                continue
            section_map[key] = {
                "key": key,
                "title": title,
                "description": str(item.get("description", "")).strip(),
                "items": [],
            }

    for demo in demos:
        key = str(demo.get("group") or "main")
        if key not in section_map:
            section_map[key] = {
                "key": key,
                "title": key,
                "description": "",
                "items": [],
            }
        section_map[key]["items"].append(demo)

    ordered_sections: list[dict[str, object]] = []
    if isinstance(configured_sections, list):
        for item in configured_sections:
            if not isinstance(item, dict):
                continue
            key = str(item.get("key", "")).strip()
            section = section_map.get(key)
            if section and section["items"]:
                ordered_sections.append(section)

    for key, section in section_map.items():
        if section["items"] and all(existing["key"] != key for existing in ordered_sections):
            ordered_sections.append(section)

    return ordered_sections


def render_section(section: dict[str, object]) -> str:
    description = str(section.get("description", "")).strip()
    desc_html = f'<p class="section-desc">{escape_html(description)}</p>' if description else ""
    cards = "".join(render_demo_card(item) for item in section.get("items", []))
    return f"""<section class="section-block" data-section-panel="{escape_attr(str(section["key"]))}" hidden>
  {desc_html}
  <div class="demo-grid">
    {cards}
  </div>
</section>"""


def render_demo_card(demo: dict[str, object]) -> str:
    entries = "".join(
        render_entry_link(entry)
        for entry in demo["links"]
    )
    updates_data = demo.get("updates", [])
    updates = render_workspace_updates(updates_data)
    status_html = render_status_badge(demo.get("status"))
    return f"""<article class="demo-card" data-workspace-card data-workspace="{escape_attr(str(demo["workspace"]))}">
  <div class="demo-header">
    <div>
      <h2 class="demo-title">{escape_html(str(demo["title"]))}</h2>
    </div>
    {status_html}
  </div>
  <p class="demo-summary">{escape_html(str(demo["summary"]))}</p>
  <div class="entry-row">
    {entries}
  </div>
  {updates}
</article>"""


def render_status_badge(status: object) -> str:
    if not isinstance(status, dict):
        return ""
    label = str(status.get("label", "")).strip()
    tone = str(status.get("tone", "neutral")).strip() or "neutral"
    if not label:
        return ""
    return f'<span class="status-badge" data-tone="{escape_attr(tone)}">{escape_html(label)}</span>'


def render_tab_button(section: dict[str, object], initial_tab: str) -> str:
    key = str(section.get("key", "")).strip()
    title = str(section.get("title", "")).strip() or key
    active = key == initial_tab
    active_class = " is-active" if active else ""
    aria_selected = "true" if active else "false"
    return f'<button class="tab-button{active_class}" type="button" role="tab" aria-selected="{aria_selected}" data-tab-target="{escape_attr(key)}">{escape_html(title)}</button>'


def render_entry_link(entry: dict[str, str]) -> str:
    target_value = str(entry.get("target") or "_blank")
    rel_value = str(entry.get("rel") or "noreferrer")
    target = f' target="{escape_attr(target_value)}"'
    rel = f' rel="{escape_attr(rel_value)}"'
    return f'<a class="entry-link" href="{escape_attr(str(entry["direct_path"]))}"{target}{rel}>{escape_html(str(entry["label"]))}</a>'


def render_workspace_updates(updates: object) -> str:
    if not isinstance(updates, list) or not updates:
        return """<div class="updates-block"><p class="updates-title">版本更新</p><p class="updates-detail">当前还没有可显示的更新记录。</p></div>"""

    primary_items: list[str] = []
    hidden_items: list[str] = []

    for update in updates:
        if not isinstance(update, dict):
            continue
        item_html = render_update_item(update)
        if not item_html:
            continue
        if len(primary_items) < 3:
            primary_items.append(item_html)
        else:
            hidden_items.append(item_html)

    if not primary_items and not hidden_items:
        return """<div class="updates-block"><p class="updates-title">版本更新</p><p class="updates-detail">当前还没有可显示的更新记录。</p></div>"""

    more_html = ""
    if hidden_items:
        more_html = f"""<details class="updates-more">
  <summary class="updates-toggle">展开更多更新</summary>
  <ul class="updates-list">
    {''.join(hidden_items)}
  </ul>
</details>"""

    return f"""<div class="updates-block">
  <p class="updates-title">版本更新</p>
  <ul class="updates-list">
    {''.join(primary_items)}
  </ul>
  {more_html}
</div>"""


def render_update_item(update: dict[str, object]) -> str:
    date_label = str(update.get("date", "")).strip()
    text = update_display_text(update)
    if not date_label or not text:
        return ""
    signature = f"{date_label}|{text}"
    return f'<li class="updates-item" data-update-signature="{escape_attr(signature)}" data-unread="false"><span class="updates-line"><span class="update-dot" aria-hidden="true"></span>{escape_html(date_label)} · {escape_html(text)}</span></li>'


def update_display_text(update: dict[str, object]) -> str:
    for key in ("text", "summary", "title", "detail"):
        value = str(update.get(key, "")).strip()
        if value:
            return value
    return ""


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
      <p>可以回到发布站首页重新进入 demo，或者直接访问 <code>workspaces/&lt;workspace&gt;/demo/</code> 形式的真实目录。</p>
      <a href="index.html">返回首页</a>
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


def load_site_config() -> dict[str, object]:
    config_path = SITE_CONFIG_PATH if SITE_CONFIG_PATH.exists() else LEGACY_SITE_CONFIG_PATH
    if not config_path.exists():
        return {}

    try:
        data = json.loads(read_text(config_path))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {config_path}: {exc}") from exc

    return data if isinstance(data, dict) else {}


def load_workspace_config(workspace_dir: Path, site_config: dict[str, object]) -> dict[str, object]:
    config_path = workspace_dir / WORKSPACE_SITE_CONFIG_NAME
    if config_path.exists():
        try:
            data = json.loads(read_text(config_path))
        except json.JSONDecodeError as exc:
            raise SystemExit(f"Invalid JSON in {config_path}: {exc}") from exc

        if isinstance(data, dict):
            return {**data, "_workspace_name": workspace_dir.name}

    workspace_map = site_config.get("workspaces", {}) if isinstance(site_config.get("workspaces", {}), dict) else {}
    fallback = workspace_map.get(workspace_dir.name, {}) if isinstance(workspace_map.get(workspace_dir.name, {}), dict) else {}
    return {**fallback, "_workspace_name": workspace_dir.name}


def relative_href(from_relative_path: str, to_relative_path: str) -> str:
    from_dir = Path(from_relative_path).parent
    rel = os.path.relpath(to_relative_path, start=from_dir if str(from_dir) != "." else ".")
    rel = rel.replace("\\", "/")

    if rel == ".":
        return "./"

    if to_relative_path.endswith("/") and not rel.endswith("/"):
        rel += "/"

    return rel


def normalize_link_url(url: str) -> str:
    normalized = url.strip()
    if is_external_url(normalized):
        return normalized

    if normalized.startswith("/"):
        normalized = normalized.lstrip("/")

    if normalized.endswith(".md"):
        normalized = normalized[:-3] + ".html"

    return normalized


def resolve_workspace_link_url(url: str, workspace_name: str) -> str:
    normalized = normalize_link_url(url)
    if is_external_url(normalized):
        return normalized
    if normalized.startswith("workspaces/") or not workspace_name:
        return normalized
    return f"workspaces/{workspace_name}/{normalized.lstrip('./')}"


def is_external_url(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")


def write_text(file_path: Path, content: str) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")


def get_workspace_updates(workspace_dir: Path, limit: int = 5) -> list[dict[str, str]]:
    command = [
        "git",
        "log",
        f"-{limit}",
        "--date=short",
        "--pretty=format:%h%x1f%ad%x1f%s",
        "--",
        str(workspace_dir.relative_to(REPO_ROOT)),
    ]

    try:
        result = subprocess.run(
            command,
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return []

    updates: list[dict[str, str]] = []
    for line in result.stdout.splitlines():
        commit, date, message = (line.split("\x1f", 2) + ["", "", ""])[:3]
        updates.append(
            {
                "date": date,
                "text": message,
                "title": message,
                "detail": f"提交 {commit}",
            }
        )

    return updates


def parse_updates_markdown(file_path: Path) -> list[dict[str, str]]:
    if not file_path.exists():
        return []

    updates: list[dict[str, str]] = []
    for raw_line in read_text(file_path).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        bullet_match = re.match(r"^[-*]\s+(.*)$", line)
        if bullet_match:
            line = bullet_match.group(1).strip()

        parts = re.split(r"\s*[|｜]\s*", line, maxsplit=1)
        if len(parts) != 2:
            continue

        date = parts[0].strip()
        text = parts[1].strip()
        if not date or not text:
            continue

        updates.append({"date": date, "text": text})

    return updates


def escape_html(value: str) -> str:
    return html.escape(value)


def escape_attr(value: str) -> str:
    return html.escape(value, quote=True)


def escape_js(value: str) -> str:
    return json.dumps(value)[1:-1]


if __name__ == "__main__":
    main()
