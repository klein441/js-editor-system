@echo off
chcp 65001 >nul
echo ========================================
echo 用户注册功能 - 数据库设置
echo ========================================
echo.

set /p DB_USER="请输入 MySQL 用户名 (默认: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="请输入 MySQL 密码: "

echo.
echo 正在更新数据库...
echo.

mysql -u %DB_USER% -p%DB_PASS% < add_user_fields.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 数据库更新成功！
    echo.
    echo 注册功能已启用，可以开始使用了。
    echo 请运行 npm start 启动后端服务。
) else (
    echo.
    echo ❌ 数据库更新失败！
    echo 请检查：
    echo 1. MySQL 是否已启动
    echo 2. 用户名和密码是否正确
    echo 3. js_editor 数据库是否存在
)

echo.
pause
