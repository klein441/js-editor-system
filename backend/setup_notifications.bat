@echo off
echo ========================================
echo 通知系统数据库初始化
echo ========================================
echo.

REM 从.env文件读取数据库配置
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#"') do (
    if "%%a"=="DB_HOST" set DB_HOST=%%b
    if "%%a"=="DB_USER" set DB_USER=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_NAME" set DB_NAME=%%b
)

echo 数据库配置:
echo 主机: %DB_HOST%
echo 用户: %DB_USER%
echo 数据库: %DB_NAME%
echo.

echo 正在创建通知表和重做申请表...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < setup_notifications.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 通知系统初始化成功！
    echo ========================================
    echo.
    echo 已创建以下表:
    echo - notifications ^(通知表^)
    echo - redo_requests ^(重做申请表^)
    echo.
    echo 已修改以下表:
    echo - homework_submit ^(添加重做相关字段^)
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ 初始化失败！
    echo ========================================
    echo 请检查:
    echo 1. MySQL服务是否运行
    echo 2. .env文件配置是否正确
    echo 3. 数据库是否存在
    echo.
)

pause
