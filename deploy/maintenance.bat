@echo off
chcp 65001 >nul
echo ========================================
echo    JS编辑器系统 - 维护脚本
echo ========================================
echo.

set DEPLOY_DIR=C:\inetpub\js-editor-system

:menu
echo 请选择维护操作:
echo.
echo 1. 查看系统状态
echo 2. 查看日志
echo 3. 重启服务
echo 4. 清理日志
echo 5. 数据库备份
echo 6. 文件清理
echo 7. 性能监控
echo 8. 健康检查
echo 9. 退出
echo.
set /p choice="请输入选项 (1-9): "

if "%choice%"=="1" goto :status
if "%choice%"=="2" goto :logs
if "%choice%"=="3" goto :restart
if "%choice%"=="4" goto :cleanup_logs
if "%choice%"=="5" goto :backup_db
if "%choice%"=="6" goto :cleanup_files
if "%choice%"=="7" goto :monitor
if "%choice%"=="8" goto :health_check
if "%choice%"=="9" goto :exit

echo 无效选项，请重新选择
goto :menu

:status
echo ========================================
echo 系统状态检查
echo ========================================
echo.
echo PM2进程状态:
pm2 list
echo.
echo 系统资源使用:
pm2 show js-editor-backend
echo.
echo 磁盘空间:
dir "%DEPLOY_DIR%" /-c
echo.
pause
goto :menu

:logs
echo ========================================
echo 日志查看
echo ========================================
echo.
echo 1. 应用日志 (最近50行)
echo 2. 错误日志 (最近50行)
echo 3. 实时日志
echo 4. 返回主菜单
echo.
set /p log_choice="请选择 (1-4): "

if "%log_choice%"=="1" (
    pm2 logs js-editor-backend --lines 50
) else if "%log_choice%"=="2" (
    pm2 logs js-editor-backend --err --lines 50
) else if "%log_choice%"=="3" (
    echo 按 Ctrl+C 退出实时日志查看
    pm2 logs js-editor-backend -f
) else if "%log_choice%"=="4" (
    goto :menu
)
pause
goto :menu

:restart
echo ========================================
echo 重启服务
echo ========================================
echo.
echo 正在重启后端服务...
pm2 restart js-editor-backend

echo 等待服务启动...
timeout /t 5 /nobreak >nul

pm2 show js-editor-backend | findstr "online" >nul
if errorlevel 1 (
    echo ❌ 服务重启失败
    pm2 logs js-editor-backend --lines 10
) else (
    echo ✅ 服务重启成功
)
echo.
pause
goto :menu

:cleanup_logs
echo ========================================
echo 清理日志文件
echo ========================================
echo.
set /p confirm="确定要清理7天前的日志文件吗? (y/n): "
if /i not "%confirm%"=="y" goto :menu

echo 清理应用日志...
forfiles /p "%DEPLOY_DIR%\logs" /s /m *.log /d -7 /c "cmd /c del @path" 2>nul

echo 清理PM2日志...
pm2 flush

echo ✅ 日志清理完成
pause
goto :menu

:backup_db
echo ========================================
echo 数据库备份
echo ========================================
echo.
set backup_file=%DEPLOY_DIR%\backup\db_backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
set backup_file=%backup_file: =0%

if not exist "%DEPLOY_DIR%\backup" mkdir "%DEPLOY_DIR%\backup"

echo 正在备份数据库到: %backup_file%
mysqldump -u root -p520 js_editor > "%backup_file%"

if errorlevel 1 (
    echo ❌ 数据库备份失败
) else (
    echo ✅ 数据库备份成功
    echo 备份文件: %backup_file%
)
pause
goto :menu

:cleanup_files
echo ========================================
echo 文件清理
echo ========================================
echo.
echo 1. 清理临时文件
echo 2. 清理上传的临时文件 (7天前)
echo 3. 清理转换缓存 (30天前)
echo 4. 返回主菜单
echo.
set /p cleanup_choice="请选择 (1-4): "

if "%cleanup_choice%"=="1" (
    echo 清理临时文件...
    del /q "%TEMP%\*.*" 2>nul
    del /q "%DEPLOY_DIR%\backend\temp\*.*" 2>nul
    echo ✅ 临时文件清理完成
) else if "%cleanup_choice%"=="2" (
    echo 清理7天前的上传文件...
    forfiles /p "%DEPLOY_DIR%\backend\uploads\submissions" /s /m *.* /d -7 /c "cmd /c del @path" 2>nul
    echo ✅ 上传文件清理完成
) else if "%cleanup_choice%"=="3" (
    echo 清理30天前的转换缓存...
    forfiles /p "%DEPLOY_DIR%\backend\uploads\ppt-images" /s /m *.* /d -30 /c "cmd /c del @path" 2>nul
    echo ✅ 转换缓存清理完成
) else if "%cleanup_choice%"=="4" (
    goto :menu
)
pause
goto :menu

:monitor
echo ========================================
echo 性能监控
echo ========================================
echo.
echo 启动PM2监控面板...
echo 在浏览器中访问: http://localhost:9615
echo 按任意键关闭监控...
pm2 web
pause
goto :menu

:health_check
echo ========================================
echo 健康检查
echo ========================================
echo.

echo 检查后端API...
curl -s http://localhost:5000/ >nul
if errorlevel 1 (
    echo ❌ 后端API无响应
) else (
    echo ✅ 后端API正常
)

echo 检查数据库连接...
mysql -u root -p520 -e "SELECT 1;" js_editor >nul 2>&1
if errorlevel 1 (
    echo ❌ 数据库连接失败
) else (
    echo ✅ 数据库连接正常
)

echo 检查磁盘空间...
for /f "tokens=3" %%a in ('dir C:\ ^| findstr "可用字节"') do (
    echo 可用磁盘空间: %%a 字节
)

echo 检查内存使用...
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:list | findstr "="

echo.
pause
goto :menu

:exit
echo 退出维护脚本
exit /b 0