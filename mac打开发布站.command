#!/bin/zsh

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

PORT=8789
STAMP="$(date +%s)"
URL="http://127.0.0.1:$PORT/admin/?t=$STAMP"

python3 publish-site/build_site.py >/dev/null

EXISTING_PID="$(lsof -tiTCP:$PORT -sTCP:LISTEN 2>/dev/null || true)"
if [[ -n "$EXISTING_PID" ]]; then
  kill "$EXISTING_PID" 2>/dev/null || true
  sleep 1
fi

python3 publish-site/admin_console.py &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT INT TERM

sleep 2
open "$URL"

echo
echo "JetCheck 发布站已打开：$URL"
echo "默认会先进入管理台。你可以在页面里切换到发布站首页。"
echo "这个窗口请先不要关闭。关闭后，本地服务会停止。"
echo "如果浏览器没自动打开，请手动访问上面的地址。"
echo
echo "按 Ctrl+C 可以停止本地服务。"

wait $SERVER_PID
