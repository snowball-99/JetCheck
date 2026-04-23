from __future__ import annotations

import argparse
import json
import subprocess
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

from build_site import (
    OUTPUT_DIR,
    REPO_ROOT,
    SITE_CONFIG_PATH,
    WORKSPACE_ROOT,
    WORKSPACE_SITE_CONFIG_NAME,
    WORKSPACE_UPDATES_NAME,
    build_admin_console_data,
    discover_demos,
    load_site_config,
    main as build_site_main,
)


GLOBAL_PUBLISH_PATHS = ["README.md", "publish-site"]


def load_admin_payload() -> dict[str, object]:
    site_config = load_site_config()
    demos = discover_demos(site_config)
    return build_admin_console_data(demos, site_config)


def workspace_path(workspace_name: str) -> Path:
    candidate = (WORKSPACE_ROOT / workspace_name).resolve()
    if not candidate.is_dir() or WORKSPACE_ROOT.resolve() not in candidate.parents:
        raise ValueError(f"Workspace not found: {workspace_name}")
    return candidate


def read_json_file(file_path: Path) -> dict[str, object]:
    if not file_path.exists():
        return {}
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def normalize_button_url(url: str, workspace_name: str) -> str:
    normalized = url.strip()
    if not normalized:
        return normalized
    if normalized.startswith("http://") or normalized.startswith("https://"):
        return normalized

    normalized = normalized.lstrip("/")
    prefix = f"workspaces/{workspace_name}/"
    if normalized.startswith(prefix):
        normalized = normalized[len(prefix) :]
    return normalized


def save_workspace_payload(workspace_name: str, payload: dict[str, object]) -> None:
    workspace_dir = workspace_path(workspace_name)
    config_path = workspace_dir / WORKSPACE_SITE_CONFIG_NAME
    updates_path = workspace_dir / WORKSPACE_UPDATES_NAME

    current_config = read_json_file(config_path)

    title = str(payload.get("title", "")).strip()
    summary = str(payload.get("summary", "")).strip()
    group = str(payload.get("group", "")).strip()

    status_raw = payload.get("status", {})
    if isinstance(status_raw, dict):
        status_label = str(status_raw.get("label", "")).strip()
        status_tone = str(status_raw.get("tone", "")).strip() or "neutral"
        status = {"label": status_label, "tone": status_tone}
    else:
        status = {"label": "", "tone": "neutral"}

    buttons_raw = payload.get("buttons", [])
    buttons: list[dict[str, str]] = []
    if isinstance(buttons_raw, list):
        for item in buttons_raw:
            if not isinstance(item, dict):
                continue
            label = str(item.get("label", "")).strip()
            url = normalize_button_url(str(item.get("url", "")).strip(), workspace_name)
            if not label or not url:
                continue
            buttons.append({"label": label, "url": url})

    next_config = dict(current_config)
    next_config["title"] = title
    next_config["summary"] = summary
    next_config["group"] = group
    next_config["status"] = status
    next_config["buttons"] = buttons

    config_path.write_text(json.dumps(next_config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    updates_raw = payload.get("updates", [])
    lines: list[str] = []
    if isinstance(updates_raw, list):
        for item in updates_raw:
            if not isinstance(item, dict):
                continue
            date = str(item.get("date", "")).strip()
            text = str(item.get("text", "")).strip()
            if not date or not text:
                continue
            lines.append(f"- {date}｜{text}")

    updates_path.write_text(("\n".join(lines) + "\n") if lines else "", encoding="utf-8")


def save_global_payload(payload: dict[str, object]) -> None:
    current_root = read_json_file(SITE_CONFIG_PATH)
    current_site = current_root.get("site", {}) if isinstance(current_root.get("site", {}), dict) else {}

    title = str(payload.get("title", "")).strip()
    intro = str(payload.get("intro", "")).strip()

    sections_raw = payload.get("sections", [])
    sections: list[dict[str, str]] = []
    if isinstance(sections_raw, list):
        for item in sections_raw:
            if not isinstance(item, dict):
                continue
            key = str(item.get("key", "")).strip()
            section_title = str(item.get("title", "")).strip()
            description = str(item.get("description", "")).strip()
            if not key or not section_title:
                continue
            sections.append(
                {
                    "key": key,
                    "title": section_title,
                    "description": description,
                }
            )

    next_root = dict(current_root)
    next_root["site"] = {
        **current_site,
        "title": title,
        "intro": intro,
        "sections": sections,
    }
    SITE_CONFIG_PATH.write_text(json.dumps(next_root, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=REPO_ROOT, check=True)


def capture(command: list[str]) -> str:
    result = subprocess.run(command, cwd=REPO_ROOT, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def publish_workspace(workspace_name: str, payload: dict[str, object]) -> dict[str, object]:
    save_workspace_payload(workspace_name, payload)
    build_site_main()

    workspace_rel = f"workspaces/{workspace_name}"
    run(["git", "add", "-A", workspace_rel])

    staged = capture(["git", "diff", "--cached", "--name-only", "--", workspace_rel])
    if not staged:
        return {
            "published": False,
            "message": f"{workspace_name} 当前没有新的可发布改动。",
        }

    title = str(payload.get("title", "")).strip() or workspace_name
    commit_message = f"Publish {title}"
    run(["git", "commit", "-m", commit_message])
    run(["git", "push", "origin", "main"])

    return {
        "published": True,
        "message": f"{title} 已提交并推送到 main，Cloudflare Pages 会自动部署。",
        "commit_message": commit_message,
    }


def publish_global_payload(payload: dict[str, object]) -> dict[str, object]:
    save_global_payload(payload)
    build_site_main()

    run(["git", "add", "-A", *GLOBAL_PUBLISH_PATHS])

    staged = capture(["git", "diff", "--cached", "--name-only", "--", *GLOBAL_PUBLISH_PATHS])
    if not staged:
        return {
            "published": False,
            "message": "当前没有新的全局改动可发布。",
        }

    site_title = str(payload.get("title", "")).strip() or "site"
    commit_message = f"Publish global updates for {site_title}"
    run(["git", "commit", "-m", commit_message])
    run(["git", "push", "origin", "main"])

    return {
        "published": True,
        "message": "全局改动已提交并推送到 main，Cloudflare Pages 会自动部署。",
        "commit_message": commit_message,
        "paths": GLOBAL_PUBLISH_PATHS,
    }


class AdminRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(OUTPUT_DIR), **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        if self.path.rstrip("/") == "/api/admin-data":
            self.respond_json(load_admin_payload())
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if self.path == "/api/global/save":
            self.handle_global_save()
            return
        if self.path == "/api/global/publish":
            self.handle_global_publish()
            return
        if self.path.startswith("/api/workspaces/") and self.path.endswith("/save"):
            self.handle_workspace_save()
            return
        if self.path.startswith("/api/workspaces/") and self.path.endswith("/publish"):
            self.handle_workspace_publish()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Unknown API route")

    def handle_workspace_save(self) -> None:
        parts = self.path.split("/")
        if len(parts) < 5:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid workspace route")
            return

        workspace_name = unquote(parts[3]).strip()
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid content length")
            return

        try:
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON payload")
            return

        if not isinstance(payload, dict):
            self.send_error(HTTPStatus.BAD_REQUEST, "Payload must be a JSON object")
            return

        try:
            save_workspace_payload(workspace_name, payload)
            build_site_main()
            self.respond_json(load_admin_payload())
        except ValueError as exc:
            self.send_error(HTTPStatus.NOT_FOUND, str(exc))
        except Exception as exc:  # noqa: BLE001
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(exc))

    def handle_global_save(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid content length")
            return

        try:
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON payload")
            return

        if not isinstance(payload, dict):
            self.send_error(HTTPStatus.BAD_REQUEST, "Payload must be a JSON object")
            return

        try:
            save_global_payload(payload)
            build_site_main()
            self.respond_json(load_admin_payload())
        except Exception as exc:  # noqa: BLE001
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(exc))

    def handle_workspace_publish(self) -> None:
        parts = self.path.split("/")
        if len(parts) < 5:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid workspace route")
            return

        workspace_name = unquote(parts[3]).strip()
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid content length")
            return

        try:
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON payload")
            return

        if not isinstance(payload, dict):
            self.send_error(HTTPStatus.BAD_REQUEST, "Payload must be a JSON object")
            return

        try:
            publish_result = publish_workspace(workspace_name, payload)
            admin_payload = load_admin_payload()
            self.respond_json(
                {
                    "admin_data": admin_payload,
                    "publish": publish_result,
                }
            )
        except ValueError as exc:
            self.send_error(HTTPStatus.NOT_FOUND, str(exc))
        except Exception as exc:  # noqa: BLE001
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(exc))

    def handle_global_publish(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid content length")
            return

        try:
            raw = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON payload")
            return

        if not isinstance(payload, dict):
            self.send_error(HTTPStatus.BAD_REQUEST, "Payload must be a JSON object")
            return

        try:
            publish_result = publish_global_payload(payload)
            admin_payload = load_admin_payload()
            self.respond_json(
                {
                    "admin_data": admin_payload,
                    "publish": publish_result,
                }
            )
        except Exception as exc:  # noqa: BLE001
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(exc))

    def respond_json(self, payload: dict[str, object]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    parser = argparse.ArgumentParser(description="Start a local admin console server for the JetCheck demo site.")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=8789, help="Bind port")
    args = parser.parse_args()

    build_site_main()

    server = ThreadingHTTPServer((args.host, args.port), AdminRequestHandler)
    print(f"JetCheck admin console running at http://{args.host}:{args.port}/admin/")
    print(f"Serving repo: {REPO_ROOT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
