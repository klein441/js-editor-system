@echo off
chcp 65001 >nul
echo ========================================
echo 修复数据库中文乱码问题
echo ========================================
echo.

set /p DB_PASSWORD="请输入 MySQL root 密码: "

echo.
echo [1/1] 重新创建数据库（使用正确的编码）...
mysql -u root -p%DB_PASSWORD% --default-character-set=utf8mb4 < fix_encoding.sql

if %errorlevel% neq 0 (
    echo ❌ 修复失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 修复完成！
echo.
echo 请在 Navicat 中刷新并查看数据
echo 中文应该正常显示了
echo ========================================
echo.
pause
