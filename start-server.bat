@echo off
chcp 65001 >nul
echo ========================================
echo     JS编辑器系统 - 服务器启动
echo ========================================
echo.

:: 检查是否在正确目录
if not exist "backend\index.js" (
    echo ❌ 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 1. 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

echo.
echo 2. 检查PM2...
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo 📦 安装PM2...
    npm install -g pm2
)
echo ✅ PM2已准备就绪

echo.
echo 3. 启动后端服务...
pm2 start ecosystem.config.js
if errorlevel 1 (
    echo ❌ 后端服务启动失败
    pause
    exit /b 1
)

echo.
echo 4. 等待服务启动...
timeout /t 3 /nobreak >nul

echo.
echo 5. 检查服务状态...
pm2 list

echo.
echo 6. 启动Web服务器...
iisreset /start >nul 2>&1
if errorlevel 1 (
    echo ⚠️  IIS启动失败或未安装，请手动配置Web服务器
) else (
    echo ✅ IIS已启动
)

echo.
echo ========================================
echo ✅ 系统启动完成！
echo ========================================
echo.
echo 🌐 访问地址:
echo    前端应用: http://localhost
echo    前端应用: http://你的服务器IP
echo    后端API: http://localhost:5000
echo.
echo 📊 服务管理:
echo    查看日志: pm2 logs js-editor-backend
echo    重启服务: pm2 restart js-editor-backend
echo    停止服务: pm2 stop js-editor-backend
echo.
pause