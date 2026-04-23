from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BUILD_SCRIPT = REPO_ROOT / "publish-site" / "build_site.py"
PUBLISH_PATHS = [
    "README.md",
    ".gitignore",
    "publish-site",
    "workspaces",
    "archive",
    "mac打开发布站.command",
    "win打开发布站.bat",
]


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=REPO_ROOT, check=True)


def capture(command: list[str]) -> str:
    result = subprocess.run(command, cwd=REPO_ROOT, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Cloudflare Pages output, then commit and push the current repo changes.")
    parser.add_argument("message", nargs="?", default="Update demo site", help="Git commit message")
    args = parser.parse_args()

    print("1/4 Rebuilding Pages output...")
    run([sys.executable, str(BUILD_SCRIPT)])

    print("2/4 Staging repo changes...")
    run(["git", "add", "-A", *PUBLISH_PATHS])

    staged = capture(["git", "diff", "--cached", "--name-only"])
    if not staged:
        print("No staged changes to publish.")
        return

    print("3/4 Creating commit...")
    run(["git", "commit", "-m", args.message])

    print("4/4 Pushing to origin/main...")
    run(["git", "push", "origin", "main"])

    print("Publish complete. Cloudflare Pages will deploy the new commit automatically.")


if __name__ == "__main__":
    main()
