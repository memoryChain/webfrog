@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  where py >nul 2>nul
  if errorlevel 1 (
    echo [ERROR] 未找到 python 或 py。请先安装 Python 并加入 PATH。
    pause
    exit /b 1
  ) else (
    echo [INFO] 使用 py 启动本地服务器...
    start "" "http://localhost:5173"
    py -m http.server 5173
  )
) else (
  echo [INFO] 使用 python 启动本地服务器...
  start "" "http://localhost:5173"
  python -m http.server 5173
)
