#!/bin/zsh
cd "$(dirname "$0")"

PORT=5189
URL="http://127.0.0.1:${PORT}/"

echo "生字日语 PWA"
echo "项目位置：$(pwd)"
echo "访问地址：${URL}"
echo

if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  echo "本地服务已经在运行，正在打开浏览器..."
  open "${URL}"
  exit 0
fi

echo "正在启动本地服务..."
(sleep 1 && open "${URL}") &
python3 -m http.server "${PORT}" --bind 127.0.0.1
