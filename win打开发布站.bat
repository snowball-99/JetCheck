@echo off
setlocal

cd /d "%~dp0"

set PORT=8789
set URL=http://127.0.0.1:%PORT%/admin/?t=%RANDOM%%RANDOM%

python publish-site\build_site.py >nul 2>nul

netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul
if not errorlevel 1 (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>nul
  timeout /t 1 >nul
)

start "JetCheck 发布站本地服务" cmd /k "cd /d ""%~dp0"" && python publish-site\admin_console.py"
timeout /t 2 >nul
start "" "%URL%"

echo.
echo JetCheck 发布站已打开：%URL%
echo 默认会先进入管理台。你可以在页面里切换到发布站首页。
echo 本地服务会在另一个命令窗口中运行，请先不要关闭那个窗口。
echo 如果浏览器没自动打开，请手动访问上面的地址。
echo.
pause
