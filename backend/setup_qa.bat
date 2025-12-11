@echo off
chcp 65001 >nul
echo ========================================
echo 创建在线答疑表
echo ========================================
echo.

REM 从 .env 文件读取数据库配置
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#"') do (
    if "%%a"=="DB_HOST" set DB_HOST=%%b
    if "%%a"=="DB_USER" set DB_USER=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_NAME" set DB_NAME=%%b
)

echo 数据库配置:
echo Host: %DB_HOST%
echo User: %DB_USER%
echo Database: %DB_NAME%
echo.

echo 正在创建在线答疑表...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < create_qa_table.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ 在线答疑表创建成功！
    echo.
    echo 现在学生可以提问，教师可以回复了。
) else (
    echo.
    echo ❌ 创建失败，请检查数据库连接和权限
)

echo.
pause
