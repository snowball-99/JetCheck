from __future__ import annotations

import html
import json
import os
import re
import shutil
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
PUBLISH_SITE_ROOT = REPO_ROOT / "publish-site"
OUTPUT_DIR = PUBLISH_SITE_ROOT / "cloudflare-pages"
WORKSPACE_ROOT = REPO_ROOT / "workspaces"
SITE_CONFIG_PATH = PUBLISH_SITE_ROOT / "site.json"
LEGACY_SITE_CONFIG_PATH = PUBLISH_SITE_ROOT / "demo-site.json"
WORKSPACE_SITE_CONFIG_NAME = "site.json"
WORKSPACE_UPDATES_NAME = "updates.md"
PAGES_FILE_SIZE_LIMIT = 25 * 1024 * 1024

ENTRY_LABELS = {
    "dimension-tool.html": "尺寸工具",
    "client.html": "客户端",
    "platform.html": "平台端",
}

ENTRY_ORDER = ["dimension-tool.html", "client.html", "platform.html"]


def main() -> None:
    reset_output()
    copy_root_assets()
    generate_markdown_html(OUTPUT_DIR)
    rewrite_markdown_links(OUTPUT_DIR)

    site_config = load_site_config()
    demos = discover_demos(site_config)
    write_landing_page(demos, site_config)
    write_admin_console_page(demos, site_config)
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
    copy_file("README.md")


def copy_recursive(relative_path: str) -> None:
    source = REPO_ROOT / relative_path
    target = OUTPUT_DIR / relative_path
    copy_tree(source, target)


def copy_tree(source: Path, target: Path) -> None:
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
        readme_path = workspace_dir / "README.md"
        readme_content = read_text(readme_path) if readme_path.exists() else ""
        workspace_config = load_workspace_config(workspace_dir, site_config)

        html_entries = sorted(
            [create_entry(item.name, workspace_dir.name) for item in demo_dir.iterdir() if item.is_file() and item.suffix == ".html"],
            key=lambda item: entry_sort_key(item["file_name"]),
        )
        if not html_entries:
            continue

        visible_entries = build_workspace_links(html_entries, workspace_config)

        demos.append(
            {
                "workspace": workspace_dir.name,
                "title": workspace_config.get("title") or extract_title(readme_content, workspace_dir.name),
                "summary": workspace_config.get("summary") or extract_summary(readme_content, workspace_dir.name),
                "group": str(workspace_config.get("group") or infer_workspace_group(workspace_dir.name)),
                "status": normalize_status(workspace_config.get("status")),
                "links": visible_entries,
                "updates": build_workspace_updates(workspace_dir, workspace_config),
            }
        )

    return sorted(demos, key=workspace_sort_key)


def create_entry(file_name: str, workspace: str) -> dict[str, str]:
    name_without_ext = file_name.removesuffix(".html")
    direct_path = f"workspaces/{workspace}/demo/{file_name}"

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

      .hero-actions {{
        margin-top: 16px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }}

      .hero-link {{
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(24, 36, 51, 0.1);
        color: var(--text);
        text-decoration: none;
        background: rgba(255, 255, 255, 0.72);
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
        margin-top: 8px;
      }}

      .updates-toggle {{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        color: var(--accent);
        font-family: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.3;
        opacity: 0.84;
      }}

      .updates-toggle::after {{
        content: "›";
        transform: rotate(90deg);
        transition: transform 160ms ease;
      }}

      .updates-toggle[data-expanded="true"]::after {{
        transform: rotate(-90deg);
      }}

      .updates-toggle:hover {{
        opacity: 1;
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
          <div class="hero-actions">
            <a class="hero-link" href="admin/" target="_blank" rel="noreferrer">管理台原型</a>
          </div>
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

        card.querySelectorAll('a, [data-toggle-updates]').forEach((node) => {{
          node.addEventListener('click', () => {{
            markSeen(card);
          }});
        }});
      }});

      document.querySelectorAll('[data-toggle-updates]').forEach((button) => {{
        button.addEventListener('click', () => {{
          const group = button.dataset.toggleUpdates || '';
          if (!group) {{
            return;
          }}

          const expanded = button.dataset.expanded === 'true';
          document.querySelectorAll(`[data-extra-group="${{group}}"]`).forEach((item) => {{
            item.hidden = expanded;
          }});
          button.dataset.expanded = expanded ? 'false' : 'true';
          button.textContent = expanded ? '展开更多' : '收起';
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
        return """<div class="updates-block"><p class="updates-title">版本更新记录</p><p class="updates-detail">当前还没有可显示的更新记录。</p></div>"""

    items: list[str] = []

    for index, update in enumerate(updates):
        if not isinstance(update, dict):
            continue
        item_html = render_update_item(update, hidden=index >= 3)
        if not item_html:
            continue
        items.append(item_html)

    if not items:
        return """<div class="updates-block"><p class="updates-title">版本更新记录</p><p class="updates-detail">当前还没有可显示的更新记录。</p></div>"""

    more_html = ""
    hidden_count = max(len(items) - 3, 0)
    if hidden_count:
        extra_group = f'updates-extra-{hidden_count}-{abs(hash("".join(items)))}'
        rendered_items = "".join(items[:3]) + "".join(
            item.replace("<li ", f'<li data-extra-group="{extra_group}" ', 1) for item in items[3:]
        )
        more_html = f'<div class="updates-more"><button class="updates-toggle" type="button" data-toggle-updates="{extra_group}" data-expanded="false">展开更多</button></div>'
    else:
        rendered_items = "".join(items)

    return f"""<div class="updates-block">
  <p class="updates-title">版本更新记录</p>
  <ul class="updates-list">
    {rendered_items}
  </ul>
  {more_html}
</div>"""


def render_update_item(update: dict[str, object], *, hidden: bool = False) -> str:
    date_label = str(update.get("date", "")).strip()
    text = update_display_text(update)
    if not date_label or not text:
        return ""
    signature = f"{date_label}|{text}"
    hidden_attr = ' hidden' if hidden else ""
    return f'<li class="updates-item" data-update-signature="{escape_attr(signature)}" data-unread="false"{hidden_attr}><span class="updates-line"><span class="update-dot" aria-hidden="true"></span>{escape_html(date_label)} · {escape_html(text)}</span></li>'


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


def write_admin_console_page(demos: list[dict[str, object]], site_config: dict[str, object]) -> None:
    admin_data = build_admin_console_data(demos, site_config)
    embedded_data = json.dumps(admin_data, ensure_ascii=False)
    page = f"""<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JetCheck 发布站管理台原型</title>
    <style>
      :root {{
        color-scheme: light;
        --bg: #f4efe5;
        --panel: rgba(255, 251, 245, 0.94);
        --panel-strong: rgba(255, 255, 255, 0.98);
        --text: #182433;
        --muted: #5d6d7c;
        --line: rgba(24, 36, 51, 0.1);
        --accent: #0f766e;
        --accent-2: #1d4ed8;
        --warning: #9a5b00;
        --danger: #b42318;
        --shadow: 0 24px 70px rgba(85, 59, 16, 0.12);
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
          radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 36%),
          radial-gradient(circle at top right, rgba(29, 78, 216, 0.1), transparent 34%),
          linear-gradient(180deg, #fdfaf4 0%, var(--bg) 100%);
      }}

      .page {{
        width: min(1360px, calc(100vw - 28px));
        margin: 0 auto;
        padding: 24px 0 40px;
      }}

      .topbar {{
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }}

      .topbar a {{
        color: var(--accent);
        text-decoration: none;
      }}

      .hero {{
        padding: 24px;
        border-radius: 24px;
        background: var(--panel);
        border: 1px solid var(--line);
        box-shadow: var(--shadow);
        margin-bottom: 18px;
      }}

      .hero h1 {{
        margin: 0 0 10px;
        font-size: clamp(28px, 4vw, 44px);
      }}

      .hero p {{
        margin: 0;
        color: var(--muted);
        line-height: 1.75;
      }}

      .hero-meta {{
        margin-top: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }}

      .meta-pill {{
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.78);
        border: 1px solid var(--line);
        font-size: 13px;
      }}

      .layout {{
        display: grid;
        grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
        gap: 18px;
      }}

      .panel {{
        padding: 20px;
        border-radius: 24px;
        background: var(--panel);
        border: 1px solid var(--line);
        box-shadow: var(--shadow);
      }}

      .panel h2, .panel h3 {{
        margin: 0 0 12px;
      }}

      .hint {{
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        font-size: 14px;
      }}

      .tabs {{
        display: inline-flex;
        gap: 10px;
        padding: 6px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.56);
        margin: 14px 0 16px;
      }}

      .tab {{
        appearance: none;
        border: 0;
        background: transparent;
        color: var(--muted);
        border-radius: 999px;
        padding: 10px 16px;
        font: inherit;
        cursor: pointer;
      }}

      .tab.is-active {{
        color: white;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
      }}

      .workspace-list {{
        display: grid;
        gap: 12px;
      }}

      .global-block {{
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid rgba(24, 36, 51, 0.08);
      }}

      .global-head {{
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }}

      .global-summary {{
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }}

      .global-details {{
        display: grid;
        gap: 10px;
        margin-top: 14px;
      }}

      .global-settings {{
        display: grid;
        gap: 14px;
      }}

      .global-settings-grid {{
        display: grid;
        gap: 12px;
      }}

      .global-settings-note {{
        margin: 0;
      }}

      .overview-entry {{
        width: 100%;
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.72);
        text-align: left;
        cursor: pointer;
        margin: 16px 0 18px;
      }}

      .overview-entry.is-active {{
        border-color: rgba(15, 118, 110, 0.28);
        box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.16);
      }}

      .overview-entry h3 {{
        margin: 0 0 8px;
        font-size: 20px;
      }}

      .overview-entry p {{
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        font-size: 14px;
      }}

      .overview-entry-meta {{
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }}

      .detail-view[hidden] {{
        display: none !important;
      }}

      .workspace-card {{
        width: 100%;
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.72);
        text-align: left;
        cursor: pointer;
      }}

      .workspace-card.is-active {{
        border-color: rgba(15, 118, 110, 0.28);
        box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.16);
      }}

      .workspace-card h3 {{
        margin: 0 0 8px;
        font-size: 20px;
      }}

      .workspace-card p {{
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        font-size: 14px;
      }}

      .workspace-meta {{
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }}

      .badge {{
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 10px;
        border-radius: 999px;
        font-size: 12px;
        background: rgba(24, 36, 51, 0.08);
      }}

      .badge[data-tone="design"] {{
        background: rgba(217, 119, 6, 0.12);
        color: var(--warning);
      }}

      .badge[data-tone="active"] {{
        background: rgba(15, 118, 110, 0.12);
        color: var(--accent);
      }}

      .badge[data-tone="archived"] {{
        background: rgba(71, 85, 105, 0.12);
        color: #475569;
      }}

      .detail-head {{
        display: flex;
        justify-content: space-between;
        gap: 14px;
        align-items: flex-start;
        margin-bottom: 18px;
      }}

      .detail-head-main {{
        min-width: 0;
      }}

      .detail-head-side {{
        display: grid;
        justify-items: end;
        gap: 10px;
        min-width: 280px;
      }}

      .detail-title {{
        margin: 0;
        font-size: clamp(24px, 4vw, 34px);
      }}

      .detail-subtitle {{
        margin: 8px 0 0;
        color: var(--muted);
        line-height: 1.7;
      }}

      .field-grid {{
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }}

      .field {{
        display: grid;
        gap: 8px;
      }}

      .field.wide {{
        grid-column: 1 / -1;
      }}

      .field label {{
        font-size: 13px;
        color: var(--muted);
      }}

      .field input,
      .field textarea,
      .field select {{
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 11px 12px;
        font: inherit;
        background: var(--panel-strong);
        color: var(--text);
      }}

      .field textarea {{
        min-height: 108px;
        resize: vertical;
      }}

      .section {{
        margin-top: 22px;
        padding-top: 22px;
        border-top: 1px solid rgba(24, 36, 51, 0.08);
      }}

      .section:first-of-type {{
        margin-top: 0;
        padding-top: 0;
        border-top: 0;
      }}

      .section-title {{
        margin: 0 0 10px;
        font-size: 18px;
      }}

      .table {{
        display: grid;
        gap: 10px;
      }}

      .row {{
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) auto;
        gap: 10px;
        align-items: start;
        padding: 12px;
        border: 1px solid rgba(24, 36, 51, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.72);
      }}

      .row.updates {{
        grid-template-columns: 150px minmax(0, 1fr);
      }}

      .row h4 {{
        margin: 0 0 4px;
        font-size: 15px;
      }}

      .row p {{
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
        font-size: 13px;
        word-break: break-all;
      }}

      .link-button {{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 9px 12px;
        border-radius: 999px;
        text-decoration: none;
        border: 1px solid rgba(24, 36, 51, 0.1);
        background: white;
        color: var(--text);
        font-size: 13px;
        white-space: nowrap;
      }}

      .changes {{
        display: grid;
        gap: 10px;
      }}

      .change-item {{
        display: grid;
        gap: 6px;
        padding: 12px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(24, 36, 51, 0.08);
      }}

      .change-meta {{
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }}

      .change-chip {{
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 12px;
      }}

      .change-chip.status-modified {{ background: rgba(29, 78, 216, 0.12); color: #1d4ed8; }}
      .change-chip.status-added {{ background: rgba(15, 118, 110, 0.12); color: var(--accent); }}
      .change-chip.status-deleted {{ background: rgba(180, 35, 24, 0.12); color: var(--danger); }}
      .change-chip.status-untracked {{ background: rgba(217, 119, 6, 0.12); color: var(--warning); }}
      .change-chip.category-config {{ background: rgba(24, 36, 51, 0.08); color: var(--text); }}
      .change-chip.category-demo {{ background: rgba(15, 118, 110, 0.08); color: var(--accent); }}
      .change-chip.category-docs {{ background: rgba(29, 78, 216, 0.08); color: #1d4ed8; }}
      .change-chip.category-updates {{ background: rgba(217, 119, 6, 0.08); color: var(--warning); }}
      .change-chip.category-other {{ background: rgba(71, 85, 105, 0.08); color: #475569; }}

      .actions {{
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }}

      .detail-actions {{
        justify-content: flex-end;
      }}

      .action-button {{
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 10px 14px;
        font: inherit;
        cursor: pointer;
        color: white;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        box-shadow: 0 12px 28px rgba(15, 118, 110, 0.18);
      }}

      .action-button.secondary {{
        color: var(--text);
        background: rgba(255, 255, 255, 0.86);
        border: 1px solid var(--line);
        box-shadow: none;
      }}

      .action-button[disabled] {{
        cursor: not-allowed;
        opacity: 0.55;
      }}

      .action-button[hidden] {{
        display: none !important;
      }}

      .row-fields {{
        display: grid;
        gap: 8px;
      }}

      .row-fields label {{
        font-size: 12px;
        color: var(--muted);
      }}

      .row-fields input {{
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 9px 10px;
        font: inherit;
        background: var(--panel-strong);
        color: var(--text);
      }}

      .row-tools {{
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }}

      .mini-button {{
        appearance: none;
        border: 1px solid rgba(24, 36, 51, 0.1);
        background: white;
        color: var(--text);
        border-radius: 999px;
        padding: 8px 12px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }}

      .mini-button.danger {{
        color: var(--danger);
        border-color: rgba(180, 35, 24, 0.15);
      }}

      .section-actions {{
        margin-top: 10px;
      }}

      .status-line {{
        display: flex;
        justify-content: flex-end;
      }}

      .head-status-note {{
        margin: 0;
        text-align: right;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.6;
      }}

      .empty {{
        color: var(--muted);
        font-size: 14px;
      }}

      @media (max-width: 1080px) {{
        .layout {{
          grid-template-columns: 1fr;
        }}
      }}

      @media (max-width: 720px) {{
        .page {{
          width: min(100vw - 18px, 1360px);
        }}

        .detail-head {{
          flex-direction: column;
        }}

        .detail-head-side {{
          width: 100%;
          min-width: 0;
          justify-items: stretch;
        }}

        .status-line,
        .detail-actions {{
          justify-content: flex-start;
        }}

        .head-status-note {{
          text-align: left;
        }}

        .field-grid {{
          grid-template-columns: 1fr;
        }}

        .row,
        .row.updates {{
          grid-template-columns: 1fr;
        }}
      }}
    </style>
  </head>
  <body>
    <main class="page">
      <div class="topbar">
        <a href="../index.html">返回发布站首页</a>
        <span class="hint">当前是本地管理台第一版：已支持保存当前工作区，发布能力会只推送当前工作区相关改动。</span>
      </div>

      <section class="hero">
        <h1>JetCheck 发布站管理台</h1>
        <p>这一版先聚焦“看工作区、看改动、改文案结构”的体验，不先接入复杂的在线权限和后台系统。</p>
        <div class="hero-meta" id="hero-meta"></div>
      </section>

      <div class="layout">
        <section class="panel">
          <h2>工作区总览</h2>
          <p class="hint">左侧先选“全局配置”或某个工作区，右侧会切换到对应的详情和操作。</p>
          <button class="overview-entry" id="global-entry-button" type="button"></button>
          <div class="tabs" id="workspace-tabs"></div>
          <div class="workspace-list" id="workspace-list"></div>
          <div class="global-block">
            <div class="global-head">
              <div>
                <h3 class="section-title">全局改动</h3>
                <p class="hint">这里放不属于某个单独工作区的改动，例如脚本、说明文档、参考资料迁移和站点级配置。</p>
              </div>
              <button class="mini-button" id="global-toggle" type="button">展开查看</button>
            </div>
            <div class="global-summary" id="global-summary"></div>
            <div class="global-details" id="global-details" hidden></div>
          </div>
        </section>

        <section class="panel">
          <div class="detail-head">
            <div class="detail-head-main">
              <h2 class="detail-title" id="detail-title">选择一个工作区</h2>
              <p class="detail-subtitle" id="detail-subtitle">这里会显示该工作区的当前展示信息和最近本地改动。</p>
            </div>
            <div class="detail-head-side">
              <div class="status-line">
                <span class="badge" id="detail-status">未选择</span>
              </div>
              <div class="actions detail-actions">
                <button class="action-button secondary" id="reload-button" type="button">重新读取数据</button>
                <button class="action-button secondary" id="save-button" type="button" disabled>保存当前工作区</button>
                <button class="action-button" id="publish-button" type="button" disabled>发布当前工作区</button>
                <button class="action-button secondary" id="global-save-button" type="button" disabled hidden>保存全局设置</button>
                <button class="action-button" id="global-publish-button" type="button" disabled hidden>发布全局改动</button>
              </div>
              <p class="head-status-note" id="save-status">保存当前工作区后，会自动重新生成本地发布站；发布时也会自动执行这一步。</p>
            </div>
          </div>

          <div class="detail-view" id="global-detail-view" hidden>
            <div class="section">
              <h3 class="section-title">基础信息</h3>
              <div class="global-settings-grid">
                <div class="field">
                  <label for="global-site-title">站点标题</label>
                  <input id="global-site-title" />
                </div>
                <div class="field">
                  <label for="global-site-intro">站点介绍</label>
                  <textarea id="global-site-intro"></textarea>
                </div>
              </div>
              <p class="hint">这里对应的真实文件是 `publish-site/site.json`，主要影响发布站标题、介绍和分组文案。</p>
            </div>

            <div class="section">
              <h3 class="section-title">分组文案</h3>
              <div class="table" id="global-sections-table"></div>
            </div>

            <div class="section">
              <h3 class="section-title">发布范围</h3>
              <div class="changes">
                <div class="change-item">
                  <p>点击“发布全局改动”时，会保存当前全局设置，并发布 `README / scripts / site / docs` 这些全局路径。</p>
                </div>
                <div class="change-item">
                  <p>`reference / archive` 这类更容易混入资料和备份的目录，不会被这个按钮自动带上。</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="section-title">当前状态</h3>
              <p class="hint global-settings-note" id="global-status">当前全局设置还没有连接保存能力。</p>
            </div>
          </div>

          <div class="detail-view" id="workspace-detail-view">
            <div class="section">
              <h3 class="section-title">基础信息</h3>
              <div class="field-grid">
                <div class="field">
                  <label for="field-title">工作区标题</label>
                  <input id="field-title" />
                </div>
                <div class="field">
                  <label for="field-group">所属分组</label>
                  <input id="field-group" />
                </div>
                <div class="field">
                  <label for="field-status-label">状态文案</label>
                  <input id="field-status-label" />
                </div>
                <div class="field">
                  <label for="field-status-tone">状态色调</label>
                  <input id="field-status-tone" />
                </div>
                <div class="field wide">
                  <label for="field-summary">工作区说明</label>
                  <textarea id="field-summary"></textarea>
                </div>
              </div>
              <p class="hint">这一组对应的真实文件主要是 `workspaces/&lt;workspace&gt;/site.json`。</p>
            </div>

            <div class="section">
              <h3 class="section-title">入口按钮</h3>
              <div class="table" id="buttons-table"></div>
            </div>

            <div class="section">
              <h3 class="section-title">版本更新记录</h3>
              <div class="table" id="updates-table"></div>
            </div>

            <div class="section">
              <h3 class="section-title">最近本地改动</h3>
              <div class="changes" id="changes-list"></div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <script>
      const apiBase = '../api';
      let adminData = {embedded_data};
      let sections = [];
      let workspaces = [];
      let grouped = new Map();

      const tabsRoot = document.getElementById('workspace-tabs');
      const listRoot = document.getElementById('workspace-list');
      const heroMeta = document.getElementById('hero-meta');
      const globalEntryButton = document.getElementById('global-entry-button');
      const globalSummary = document.getElementById('global-summary');
      const globalDetails = document.getElementById('global-details');
      const globalToggle = document.getElementById('global-toggle');
      const globalDetailView = document.getElementById('global-detail-view');
      const workspaceDetailView = document.getElementById('workspace-detail-view');
      const globalSiteTitle = document.getElementById('global-site-title');
      const globalSiteIntro = document.getElementById('global-site-intro');
      const globalSectionsTable = document.getElementById('global-sections-table');
      const globalSaveButton = document.getElementById('global-save-button');
      const globalPublishButton = document.getElementById('global-publish-button');
      const globalStatus = document.getElementById('global-status');

      const detailTitle = document.getElementById('detail-title');
      const detailSubtitle = document.getElementById('detail-subtitle');
      const detailStatus = document.getElementById('detail-status');
      const fieldTitle = document.getElementById('field-title');
      const fieldGroup = document.getElementById('field-group');
      const fieldStatusLabel = document.getElementById('field-status-label');
      const fieldStatusTone = document.getElementById('field-status-tone');
      const fieldSummary = document.getElementById('field-summary');
      const buttonsTable = document.getElementById('buttons-table');
      const updatesTable = document.getElementById('updates-table');
      const changesList = document.getElementById('changes-list');
      const saveButton = document.getElementById('save-button');
      const publishButton = document.getElementById('publish-button');
      const reloadButton = document.getElementById('reload-button');
      const saveStatus = document.getElementById('save-status');

      const state = {{
        activeTab: 'main',
        activeScope: 'workspace',
        activeWorkspace: '',
        liveMode: false,
        isSaving: false,
        isPublishing: false,
        isGlobalSaving: false,
        isGlobalPublishing: false,
        globalExpanded: false,
        workspaceMessage: '保存当前工作区后，会自动重新生成本地发布站；发布时也会自动执行这一步。',
        globalMessage: '当前全局设置还没有连接保存能力。',
      }};

      function normalizeCollections() {{
        sections = adminData.sections || [];
        workspaces = adminData.workspaces || [];
        grouped = new Map(sections.map((section) => [section.key, []]));

        workspaces.forEach((workspace) => {{
          const key = workspace.group || 'main';
          if (!grouped.has(key)) {{
            grouped.set(key, []);
          }}
          grouped.get(key).push(workspace);
        }});

        if (!sections.some((section) => section.key === state.activeTab)) {{
          state.activeTab = sections[0] ? sections[0].key : 'main';
        }}

        const currentItems = grouped.get(state.activeTab) || [];
        if (!currentItems.some((item) => item.workspace === state.activeWorkspace)) {{
          state.activeWorkspace = currentItems[0] ? currentItems[0].workspace : (workspaces[0]?.workspace || '');
        }}
      }}

      async function loadLiveData() {{
        if (!window.location.protocol.startsWith('http')) {{
          saveStatus.textContent = '当前是静态预览模式，可以先看结构；真正保存需要通过本地管理服务打开。';
          return;
        }}

        try {{
          const response = await fetch(`${{apiBase}}/admin-data`, {{ cache: 'no-store' }});
          if (!response.ok) {{
            throw new Error(`HTTP ${{response.status}}`);
          }}
          adminData = await response.json();
          state.liveMode = true;
          state.workspaceMessage = '已连接本地管理服务。现在可以直接保存当前工作区；发布时也会自动先保存并重建。';
          state.globalMessage = '已连接本地管理服务。现在可以直接保存全局设置，也可以发布全局改动。';
        }} catch (error) {{
          state.workspaceMessage = '还没有连接本地管理服务。当前可以先看结构；真正保存和发布需要通过本地服务打开。';
          state.globalMessage = '还没有连接本地管理服务。当前只能查看全局设置，真正保存和发布需要通过本地服务打开。';
        }}
      }}

      function renderHeroMeta() {{
        const totalChanges = workspaces.reduce((sum, item) => sum + (item.local_changes || []).length, 0);
        const globalChanges = (adminData.global_changes || []).length;
        heroMeta.innerHTML = `
          <span class="meta-pill">工作区 ${{workspaces.length}} 个</span>
          <span class="meta-pill">本地工作区改动 ${{totalChanges}} 项</span>
          <span class="meta-pill">全局改动 ${{globalChanges}} 项</span>
          <span class="meta-pill">当前站点标题：${{escapeHtml((adminData.site || {{}}).title || '')}}</span>
          <span class="meta-pill">${{state.liveMode ? '保存模式已连接' : '当前是原型预览'}}</span>
        `;
      }}

      function renderTabs() {{
        tabsRoot.innerHTML = sections.map((section) => {{
          const active = section.key === state.activeTab;
          return `<button class="tab${{active ? ' is-active' : ''}}" type="button" data-tab="${{escapeHtml(section.key)}}">${{escapeHtml(section.title)}}</button>`;
        }}).join('');

        tabsRoot.querySelectorAll('[data-tab]').forEach((button) => {{
          button.addEventListener('click', () => {{
            state.activeTab = button.dataset.tab;
            normalizeCollections();
            renderAll();
          }});
        }});
      }}

      function renderGlobalEntry() {{
        const site = adminData.site || {{}};
        const globalChanges = (adminData.global_changes || []).length;
        globalEntryButton.classList.toggle('is-active', state.activeScope === 'global');
        globalEntryButton.innerHTML = `
          <h3>全局配置</h3>
          <p>${{escapeHtml(site.intro || '这里集中管理发布站标题、介绍和分组文案，不用在左侧一大块表单里来回找。')}}</p>
          <div class="overview-entry-meta">
            <span class="badge">${{escapeHtml(site.config_path || 'publish-site/site.json')}}</span>
            <span class="badge">分组 ${{escapeHtml(String((site.sections || []).length))}} 个</span>
            <span class="badge">${{globalChanges ? `全局改动 ${{globalChanges}} 项` : '当前没有全局改动'}}</span>
          </div>
        `;
      }}

      function renderWorkspaceList() {{
        const items = grouped.get(state.activeTab) || [];
        listRoot.innerHTML = items.map((item) => {{
          const active = state.activeScope === 'workspace' && item.workspace === state.activeWorkspace;
          const updates = item.updates || [];
          const latest = updates[0] ? `${{updates[0].date}} · ${{updates[0].text}}` : '还没有更新记录';
          const changeCount = (item.local_changes || []).length;
          return `
            <button class="workspace-card${{active ? ' is-active' : ''}}" type="button" data-workspace="${{escapeHtml(item.workspace)}}">
              <h3>${{escapeHtml(item.title)}}</h3>
              <p>${{escapeHtml(item.summary || '当前还没有工作区说明。')}}</p>
              <div class="workspace-meta">
                <span class="badge" data-tone="${{escapeHtml((item.status || {{}}).tone || 'neutral')}}">${{escapeHtml((item.status || {{}}).label || '未标注')}}</span>
                <span class="badge">按钮 ${{escapeHtml(String((item.buttons || []).length))}} 个</span>
                <span class="badge">更新 ${{escapeHtml(String(updates.length))}} 条</span>
                <span class="badge">${{changeCount ? `本地改动 ${{changeCount}} 项` : '当前无本地改动'}}</span>
              </div>
              <div class="workspace-meta">
                <span class="hint">${{escapeHtml(latest)}}</span>
              </div>
            </button>
          `;
        }}).join('');

        listRoot.querySelectorAll('[data-workspace]').forEach((button) => {{
          button.addEventListener('click', () => {{
            state.activeScope = 'workspace';
            state.activeWorkspace = button.dataset.workspace || '';
            renderAll();
          }});
        }});
      }}

      function renderGlobalChanges() {{
        const changes = adminData.global_changes || [];
        const counts = new Map();
        changes.forEach((change) => {{
          const label = change.category_label || '其他';
          counts.set(label, (counts.get(label) || 0) + 1);
        }});

        if (!changes.length) {{
          globalSummary.innerHTML = '<span class="badge">当前没有全局改动</span>';
          globalDetails.innerHTML = '<p class="empty">当前没有需要单独关注的全局改动。</p>';
          globalDetails.hidden = !state.globalExpanded;
          globalToggle.textContent = state.globalExpanded ? '收起' : '展开查看';
          return;
        }}

        globalSummary.innerHTML = Array.from(counts.entries()).map(([label, count]) => `
          <span class="badge">${{escapeHtml(label)}} ${{escapeHtml(String(count))}} 项</span>
        `).join('');

        globalDetails.innerHTML = changes.map((change) => `
          <div class="change-item">
            <div class="change-meta">
              <span class="change-chip status-${{escapeHtml(change.status_key || 'modified')}}">${{escapeHtml(change.status_label || '已修改')}}</span>
              <span class="change-chip category-${{escapeHtml(change.category_key || 'other')}}">${{escapeHtml(change.category_label || '其他')}}</span>
            </div>
            <p>${{escapeHtml(change.path || '')}}</p>
          </div>
        `).join('');

        globalDetails.hidden = !state.globalExpanded;
        globalToggle.textContent = state.globalExpanded ? '收起' : `展开查看（${{changes.length}}）`;
      }}

      function renderGlobalSettings() {{
        const site = adminData.site || {{}};
        globalSiteTitle.value = site.title || '';
        globalSiteIntro.value = site.intro || '';

        const sections = Array.isArray(site.sections) ? site.sections : [];
        globalSectionsTable.innerHTML = sections.length
          ? sections.map((section) => `
              <div class="row updates" data-global-section-row>
                <div class="row-fields">
                  <label>分组键</label>
                  <input data-role="section-key" value="${{escapeAttr(section.key || '')}}" readonly />
                </div>
                <div class="row-fields">
                  <label>分组标题</label>
                  <input data-role="section-title" value="${{escapeAttr(section.title || '')}}" />
                  <label>分组说明</label>
                  <input data-role="section-description" value="${{escapeAttr(section.description || '')}}" />
                </div>
              </div>
            `).join('')
          : '<p class="empty">当前没有全局分组配置。</p>';

        globalSaveButton.disabled = !state.liveMode || state.isGlobalSaving || state.isGlobalPublishing;
        globalPublishButton.disabled = !state.liveMode || state.isGlobalSaving || state.isGlobalPublishing;
      }}

      function renderGlobalDetail() {{
        const site = adminData.site || {{}};
        detailTitle.textContent = '全局配置';
        detailSubtitle.textContent = `${{site.config_path || 'publish-site/site.json'}} · 这里管理发布站标题、介绍和主线/定制分组文案。`;
        detailStatus.textContent = '全局';
        detailStatus.dataset.tone = 'active';
        saveButton.hidden = true;
        publishButton.hidden = true;
        globalSaveButton.hidden = false;
        globalPublishButton.hidden = false;
        workspaceDetailView.hidden = true;
        globalDetailView.hidden = false;
        saveStatus.textContent = '保存全局设置时会自动重新生成本地发布站；发布全局改动时会一并提交 README / scripts / site / docs。';
        renderGlobalSettings();
        globalStatus.textContent = state.globalMessage;
      }}

      function renderWorkspaceDetail() {{
        const workspace = getCurrentWorkspace();
        saveButton.disabled = !state.liveMode || !workspace || state.isSaving || state.isPublishing;
        publishButton.disabled = !state.liveMode || !workspace || state.isSaving || state.isPublishing;
        saveButton.hidden = false;
        publishButton.hidden = false;
        globalSaveButton.hidden = true;
        globalPublishButton.hidden = true;
        workspaceDetailView.hidden = false;
        globalDetailView.hidden = true;
        saveStatus.textContent = state.workspaceMessage;

        if (!workspace) {{
          detailTitle.textContent = '当前分组没有工作区';
          detailSubtitle.textContent = '可以先切换到另一个分组，或者后面在这里补“新建工作区”的入口。';
          detailStatus.textContent = '未选择';
          detailStatus.dataset.tone = 'neutral';
          fieldTitle.value = '';
          fieldGroup.value = '';
          fieldStatusLabel.value = '';
          fieldStatusTone.value = '';
          fieldSummary.value = '';
          buttonsTable.innerHTML = '<p class="empty">当前没有可展示内容。</p>';
          updatesTable.innerHTML = '<p class="empty">当前没有可展示内容。</p>';
          changesList.innerHTML = '<p class="empty">当前没有可展示内容。</p>';
          return;
        }}

        detailTitle.textContent = workspace.title;
        detailSubtitle.textContent = `${{workspace.workspace}} · 配置文件：${{workspace.config_path}} · 更新文件：${{workspace.updates_path}}`;
        detailStatus.textContent = (workspace.status || {{}}).label || '未标注';
        detailStatus.dataset.tone = (workspace.status || {{}}).tone || 'neutral';

        fieldTitle.value = workspace.title || '';
        fieldGroup.value = workspace.group || '';
        fieldStatusLabel.value = (workspace.status || {{}}).label || '';
        fieldStatusTone.value = (workspace.status || {{}}).tone || '';
        fieldSummary.value = workspace.summary || '';

        buttonsTable.innerHTML = renderButtonRows(workspace.buttons || []);
        updatesTable.innerHTML = renderUpdateRows(workspace.updates || []);
        changesList.innerHTML = renderChanges(workspace.local_changes || []);

        bindEditableRows();
      }}

      function renderButtonRows(buttons) {{
        const rows = buttons.length ? buttons.map((button) => renderSingleButtonRow(button)).join('') : '<p class="empty">当前没有配置入口按钮，可以直接新增。</p>';
        return `${{rows}}<div class="section-actions"><button class="mini-button" id="add-button-row" type="button">新增按钮</button></div>`;
      }}

      function renderSingleButtonRow(button) {{
        return `
          <div class="row" data-button-row>
            <div class="row-fields">
              <label>按钮名称</label>
              <input data-role="button-label" value="${{escapeAttr(button.label || '')}}" />
            </div>
            <div class="row-fields">
              <label>链接地址</label>
              <input data-role="button-url" value="${{escapeAttr(button.direct_path || button.url || '')}}" />
            </div>
            <div class="row-tools">
              <button class="mini-button danger" type="button" data-remove-button>删除</button>
            </div>
          </div>
        `;
      }}

      function renderUpdateRows(updates) {{
        const rows = updates.length ? updates.map((update) => renderSingleUpdateRow(update)).join('') : '<p class="empty">当前没有更新记录，可以直接新增。</p>';
        return `${{rows}}<div class="section-actions"><button class="mini-button" id="add-update-row" type="button">新增更新</button></div>`;
      }}

      function bindEditableRows() {{
        buttonsTable.querySelectorAll('[data-remove-button]').forEach((button) => {{
          button.onclick = () => {{
            button.closest('[data-button-row]')?.remove();
          }};
        }});

        updatesTable.querySelectorAll('[data-remove-update]').forEach((button) => {{
          button.onclick = () => {{
            button.closest('[data-update-row]')?.remove();
          }};
        }});

        const addButton = document.getElementById('add-button-row');
        if (addButton) {{
          addButton.onclick = () => {{
            const actionRow = buttonsTable.querySelector('.section-actions');
            if (actionRow) {{
              actionRow.insertAdjacentHTML('beforebegin', renderSingleButtonRow({{ label: '', direct_path: '' }}));
              bindEditableRows();
            }}
          }};
        }}

        const addUpdate = document.getElementById('add-update-row');
        if (addUpdate) {{
          addUpdate.onclick = () => {{
            const actionRow = updatesTable.querySelector('.section-actions');
            if (actionRow) {{
              actionRow.insertAdjacentHTML('beforebegin', renderSingleUpdateRow({{ date: '', text: '' }}));
              bindEditableRows();
            }}
          }};
        }}
      }}

      function renderSingleUpdateRow(update) {{
        return `
          <div class="row updates" data-update-row>
            <div class="row-fields">
              <label>日期</label>
              <input data-role="update-date" value="${{escapeAttr(update.date || '')}}" placeholder="2026-04-23" />
            </div>
            <div class="row-fields">
              <label>一句描述</label>
              <div style="display:grid; gap:8px;">
                <input data-role="update-text" value="${{escapeAttr(update.text || '')}}" />
                <div class="row-tools" style="justify-content:flex-start;">
                  <button class="mini-button danger" type="button" data-remove-update>删除</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }}

      function renderChanges(changes) {{
        if (!changes.length) {{
          return '<p class="empty">当前这个工作区没有本地未发布改动。</p>';
        }}

        return changes.map((change) => `
          <div class="change-item">
            <div class="change-meta">
              <span class="change-chip status-${{escapeHtml(change.status_key || 'modified')}}">${{escapeHtml(change.status_label || '已修改')}}</span>
              <span class="change-chip category-${{escapeHtml(change.category_key || 'other')}}">${{escapeHtml(change.category_label || '其他')}}</span>
            </div>
            <p>${{escapeHtml(change.path || '')}}</p>
          </div>
        `).join('');
      }}

      function getCurrentWorkspace() {{
        return workspaces.find((item) => item.workspace === state.activeWorkspace);
      }}

      function collectWorkspacePayload() {{
        const workspace = getCurrentWorkspace();
        if (!workspace) {{
          return null;
        }}

        const buttons = Array.from(buttonsTable.querySelectorAll('[data-button-row]')).map((row) => {{
          const label = row.querySelector('[data-role="button-label"]')?.value.trim() || '';
          const url = row.querySelector('[data-role="button-url"]')?.value.trim() || '';
          return {{ label, url }};
        }}).filter((item) => item.label && item.url);

        const updates = Array.from(updatesTable.querySelectorAll('[data-update-row]')).map((row) => {{
          const date = row.querySelector('[data-role="update-date"]')?.value.trim() || '';
          const text = row.querySelector('[data-role="update-text"]')?.value.trim() || '';
          return {{ date, text }};
        }}).filter((item) => item.date && item.text);

        return {{
          title: fieldTitle.value.trim(),
          summary: fieldSummary.value.trim(),
          group: fieldGroup.value.trim() || workspace.group,
          status: {{
            label: fieldStatusLabel.value.trim(),
            tone: fieldStatusTone.value.trim() || 'neutral',
          }},
          buttons,
          updates,
        }};
      }}

      function collectGlobalPayload() {{
        const sections = Array.from(globalSectionsTable.querySelectorAll('[data-global-section-row]')).map((row) => {{
          const key = row.querySelector('[data-role="section-key"]')?.value.trim() || '';
          const title = row.querySelector('[data-role="section-title"]')?.value.trim() || '';
          const description = row.querySelector('[data-role="section-description"]')?.value.trim() || '';
          return {{ key, title, description }};
        }}).filter((item) => item.key && item.title);

        return {{
          title: globalSiteTitle.value.trim(),
          intro: globalSiteIntro.value.trim(),
          sections,
        }};
      }}

      async function saveCurrentWorkspace() {{
        if (!state.liveMode || state.isSaving || state.isPublishing) {{
          return;
        }}

        const workspace = getCurrentWorkspace();
        const payload = collectWorkspacePayload();
        if (!workspace || !payload) {{
          return;
        }}

        state.isSaving = true;
        saveButton.disabled = true;
        state.workspaceMessage = `正在保存 ${{workspace.title}} ...`;
        renderAll();

        try {{
          const response = await fetch(`${{apiBase}}/workspaces/${{encodeURIComponent(workspace.workspace)}}/save`, {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(payload),
          }});

          if (!response.ok) {{
            const text = await response.text();
            throw new Error(text || `HTTP ${{response.status}}`);
          }}

          adminData = await response.json();
          normalizeCollections();
          state.workspaceMessage = `已保存 ${{workspace.title}}，并重新生成了本地发布站页面。`;
          renderAll();
        }} catch (error) {{
          state.workspaceMessage = `保存失败：${{error.message || '未知错误'}}`;
          renderAll();
        }} finally {{
          state.isSaving = false;
          const currentWorkspace = getCurrentWorkspace();
          saveButton.disabled = !state.liveMode || !currentWorkspace;
          publishButton.disabled = !state.liveMode || !currentWorkspace;
        }}
      }}

      async function publishCurrentWorkspace() {{
        if (!state.liveMode || state.isSaving || state.isPublishing) {{
          return;
        }}

        const workspace = getCurrentWorkspace();
        const payload = collectWorkspacePayload();
        if (!workspace || !payload) {{
          return;
        }}

        state.isPublishing = true;
        saveButton.disabled = true;
        publishButton.disabled = true;
        state.workspaceMessage = `正在发布 ${{workspace.title}} ...`;
        renderAll();

        try {{
          const response = await fetch(`${{apiBase}}/workspaces/${{encodeURIComponent(workspace.workspace)}}/publish`, {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(payload),
          }});

          if (!response.ok) {{
            const text = await response.text();
            throw new Error(text || `HTTP ${{response.status}}`);
          }}

          const result = await response.json();
          adminData = result.admin_data || adminData;
          normalizeCollections();

          const publish = result.publish || {{}};
          state.workspaceMessage = publish.message || `已完成 ${{workspace.title}} 的发布。`;
          renderAll();
        }} catch (error) {{
          state.workspaceMessage = `发布失败：${{error.message || '未知错误'}}`;
          renderAll();
        }} finally {{
          state.isPublishing = false;
          const currentWorkspace = getCurrentWorkspace();
          saveButton.disabled = !state.liveMode || !currentWorkspace;
          publishButton.disabled = !state.liveMode || !currentWorkspace;
        }}
      }}

      async function saveGlobalSettings() {{
        if (!state.liveMode || state.isGlobalSaving || state.isGlobalPublishing) {{
          return;
        }}

        const payload = collectGlobalPayload();
        state.isGlobalSaving = true;
        globalSaveButton.disabled = true;
        globalPublishButton.disabled = true;
        state.globalMessage = '正在保存全局设置...';
        renderAll();

        try {{
          const response = await fetch(`${{apiBase}}/global/save`, {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(payload),
          }});

          if (!response.ok) {{
            const text = await response.text();
            throw new Error(text || `HTTP ${{response.status}}`);
          }}

          adminData = await response.json();
          normalizeCollections();
          state.globalMessage = '已保存全局设置，并重新生成了本地发布站。';
          renderAll();
        }} catch (error) {{
          state.globalMessage = `保存全局设置失败：${{error.message || '未知错误'}}`;
          renderAll();
        }} finally {{
          state.isGlobalSaving = false;
          globalSaveButton.disabled = !state.liveMode;
          globalPublishButton.disabled = !state.liveMode;
        }}
      }}

      async function publishGlobalSettings() {{
        if (!state.liveMode || state.isGlobalSaving || state.isGlobalPublishing) {{
          return;
        }}

        const payload = collectGlobalPayload();
        state.isGlobalPublishing = true;
        globalSaveButton.disabled = true;
        globalPublishButton.disabled = true;
        state.globalMessage = '正在发布全局改动...';
        renderAll();

        try {{
          const response = await fetch(`${{apiBase}}/global/publish`, {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(payload),
          }});

          if (!response.ok) {{
            const text = await response.text();
            throw new Error(text || `HTTP ${{response.status}}`);
          }}

          const result = await response.json();
          adminData = result.admin_data || adminData;
          normalizeCollections();
          const publish = result.publish || {{}};
          state.globalMessage = publish.message || '已完成全局改动发布。';
          renderAll();
        }} catch (error) {{
          state.globalMessage = `发布全局改动失败：${{error.message || '未知错误'}}`;
          renderAll();
        }} finally {{
          state.isGlobalPublishing = false;
          globalSaveButton.disabled = !state.liveMode;
          globalPublishButton.disabled = !state.liveMode;
        }}
      }}

      function escapeHtml(value) {{
        return String(value ?? '')
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }}

      function escapeAttr(value) {{
        return escapeHtml(value);
      }}

      function renderAll() {{
        renderHeroMeta();
        renderGlobalEntry();
        renderTabs();
        renderWorkspaceList();
        renderGlobalChanges();
        if (state.activeScope === 'global') {{
          renderGlobalDetail();
        }} else {{
          renderWorkspaceDetail();
        }}
      }}

      globalEntryButton.addEventListener('click', () => {{
        state.activeScope = 'global';
        renderAll();
      }});

      globalToggle.addEventListener('click', () => {{
        state.globalExpanded = !state.globalExpanded;
        renderGlobalChanges();
      }});

      reloadButton.addEventListener('click', async () => {{
        if (!state.liveMode) {{
          if (state.activeScope === 'global') {{
            state.globalMessage = '当前还没有连接本地管理服务，重新读取功能需要本地服务支持。';
          }} else {{
            state.workspaceMessage = '当前还没有连接本地管理服务，重新读取功能需要本地服务支持。';
          }}
          renderAll();
          return;
        }}

        if (state.activeScope === 'global') {{
          state.globalMessage = '正在重新读取磁盘内容...';
        }} else {{
          state.workspaceMessage = '正在重新读取磁盘内容...';
        }}
        renderAll();
        try {{
          const response = await fetch(`${{apiBase}}/admin-data`, {{ cache: 'no-store' }});
          adminData = await response.json();
          normalizeCollections();
          if (state.activeScope === 'global') {{
            state.globalMessage = '已重新读取最新全局数据。';
          }} else {{
            state.workspaceMessage = '已重新读取最新工作区数据。';
          }}
          renderAll();
        }} catch (error) {{
          if (state.activeScope === 'global') {{
            state.globalMessage = `重新读取失败：${{error.message || '未知错误'}}`;
          }} else {{
            state.workspaceMessage = `重新读取失败：${{error.message || '未知错误'}}`;
          }}
          renderAll();
        }}
      }});

      saveButton.addEventListener('click', saveCurrentWorkspace);
      publishButton.addEventListener('click', publishCurrentWorkspace);
      globalSaveButton.addEventListener('click', saveGlobalSettings);
      globalPublishButton.addEventListener('click', publishGlobalSettings);

      (async function init() {{
        await loadLiveData();
        normalizeCollections();
        renderAll();
      }})();
    </script>
  </body>
</html>
"""
    write_text(OUTPUT_DIR / "admin" / "index.html", page)


def build_admin_console_data(demos: list[dict[str, object]], site_config: dict[str, object]) -> dict[str, object]:
    site_meta = site_config.get("site", {}) if isinstance(site_config.get("site", {}), dict) else {}
    sections = build_sections(demos, site_config)
    changes = get_local_changes()
    global_changes = [change for change in changes if change["workspace"] is None]
    workspace_changes = group_changes_by_workspace(changes)

    section_titles = {str(section["key"]): str(section.get("title", section["key"])) for section in sections}
    workspace_items: list[dict[str, object]] = []

    for demo in demos:
        workspace_name = str(demo["workspace"])
        workspace_dir = WORKSPACE_ROOT / workspace_name
        workspace_items.append(
            {
                "workspace": workspace_name,
                "title": str(demo.get("title", workspace_name)),
                "summary": str(demo.get("summary", "")),
                "group": str(demo.get("group", "main")),
                "group_title": section_titles.get(str(demo.get("group", "main")), str(demo.get("group", "main"))),
                "status": demo.get("status", {"label": "未标注", "tone": "neutral"}),
                "buttons": build_admin_buttons(demo.get("links", [])),
                "updates": demo.get("updates", []),
                "config_path": f"workspaces/{workspace_name}/{WORKSPACE_SITE_CONFIG_NAME}",
                "updates_path": f"workspaces/{workspace_name}/{WORKSPACE_UPDATES_NAME}",
                "local_changes": workspace_changes.get(workspace_name, []),
            }
        )

    return {
        "site": {
            "title": str(site_meta.get("title") or "JetCheck Demo 发布站"),
            "intro": str(site_meta.get("intro") or ""),
            "config_path": str(SITE_CONFIG_PATH.relative_to(REPO_ROOT)),
            "sections": [
                {
                    "key": str(item.get("key", "")),
                    "title": str(item.get("title", "")),
                    "description": str(item.get("description", "")),
                }
                for item in (site_meta.get("sections", []) if isinstance(site_meta.get("sections", []), list) else [])
                if isinstance(item, dict)
            ],
        },
        "sections": [{"key": str(section["key"]), "title": str(section.get("title", section["key"]))} for section in sections],
        "workspaces": workspace_items,
        "global_changes": global_changes,
    }


def get_admin_console_payload() -> dict[str, object]:
    site_config = load_site_config()
    demos = discover_demos(site_config)
    return build_admin_console_data(demos, site_config)


def build_admin_buttons(links: object) -> list[dict[str, str]]:
    if not isinstance(links, list):
        return []

    items: list[dict[str, str]] = []
    for entry in links:
        if not isinstance(entry, dict):
            continue
        direct_path = str(entry.get("direct_path", "")).strip()
        if not direct_path:
            continue
        preview_href = direct_path if is_external_url(direct_path) else relative_href("admin/index.html", direct_path)
        items.append(
            {
                "label": str(entry.get("label", "")).strip(),
                "direct_path": direct_path,
                "preview_href": preview_href,
                "source": "workspaces/<workspace>/site.json",
            }
        )
    return items


def get_local_changes() -> list[dict[str, object]]:
    command = ["git", "status", "--porcelain=v1", "-z"]
    try:
        result = subprocess.run(
            command,
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=False,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return []

    payload = result.stdout.decode("utf-8", errors="replace")
    if not payload:
        return []

    entries = payload.split("\0")
    changes: list[dict[str, object]] = []
    index = 0
    while index < len(entries):
        record = entries[index]
        index += 1
        if not record:
            continue

        status_code = record[:2]
        path = record[3:]

        if status_code[:1] in {"R", "C"} and index < len(entries):
            # porcelain -z emits an extra target path for renames/copies.
            path = entries[index]
            index += 1

        normalized_path = path.strip()
        if not normalized_path:
            continue

        workspace_name = detect_workspace_name(normalized_path)
        category_key, category_label = categorize_change(normalized_path, workspace_name)
        status_key, status_label = normalize_git_status(status_code)

        changes.append(
            {
                "path": normalized_path,
                "workspace": workspace_name,
                "category_key": category_key,
                "category_label": category_label,
                "status_key": status_key,
                "status_label": status_label,
            }
        )

    return changes


def group_changes_by_workspace(changes: list[dict[str, object]]) -> dict[str, list[dict[str, object]]]:
    grouped: dict[str, list[dict[str, object]]] = {}
    for change in changes:
        workspace_name = change.get("workspace")
        if not isinstance(workspace_name, str) or not workspace_name:
            continue
        grouped.setdefault(workspace_name, []).append(change)
    return grouped


def detect_workspace_name(path: str) -> str | None:
    if not path.startswith("workspaces/"):
        return None
    parts = path.split("/", 2)
    if len(parts) < 2:
        return None
    return parts[1]


def categorize_change(path: str, workspace_name: str | None) -> tuple[str, str]:
    if workspace_name:
        prefix = f"workspaces/{workspace_name}/"
        if path == f"{prefix}{WORKSPACE_SITE_CONFIG_NAME}":
            return ("config", "配置")
        if path == f"{prefix}{WORKSPACE_UPDATES_NAME}":
            return ("updates", "更新")
        if path.startswith(f"{prefix}demo/"):
            return ("demo", "页面")
        if path.startswith(f"{prefix}docs/"):
            return ("docs", "文档")
        return ("other", "其他")

    if path == "publish-site/site.json":
        return ("config", "全局配置")
    if path.startswith("publish-site/"):
        return ("other", "脚本")
    if path == "README.md":
        return ("docs", "说明")
    return ("other", "其他")


def normalize_git_status(status_code: str) -> tuple[str, str]:
    code = status_code.strip()
    if code == "??":
        return ("untracked", "未跟踪")
    if "D" in code:
        return ("deleted", "已删除")
    if "A" in code:
        return ("added", "新增")
    return ("modified", "已修改")


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
