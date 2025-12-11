@echo off
chcp 65001 >nul
echo ========================================
echo 在线答疑系统诊断工具
echo ========================================
echo.

REM 从 .env 文件读取数据库配置
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#"') do (
    if "%%a"=="DB_HOST" set DB_HOST=%%b
    if "%%a"=="DB_USER" set DB_USER=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_NAME" set DB_NAME=%%b
)

echo [1/4] 检查数据库连接...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1" 2>nul
if %errorlevel% equ 0 (
    echo ✅ 数据库连接正常
) else (
    echo ❌ 数据库连接失败
    echo    请检查 .env 文件中的数据库配置
    goto :end
)

echo.
echo [2/4] 检查数据库是否存在...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "USE %DB_NAME%" 2>nul
if %errorlevel% equ 0 (
    echo ✅ 数据库 %DB_NAME% 存在
) else (
    echo ❌ 数据库 %DB_NAME% 不存在
    goto :end
)

echo.
echo [3/4] 检查 qa_questions 表是否存在...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "DESCRIBE qa_questions" 2>nul
if %errorlevel% equ 0 (
    echo ✅ qa_questions 表已存在
    echo.
    echo 表结构：
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "DESCRIBE qa_questions"
) else (
    echo ❌ qa_questions 表不存在
    echo.
    echo 请运行以下命令创建表：
    echo    setup_qa.bat
    goto :end
)

echo.
echo [4/4] 检查后端服务...
curl -s http://localhost:5000/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常 (http://localhost:5000)
) else (
    echo ❌ 后端服务未启动
    echo.
    echo 请运行以下命令启动后端：
    echo    node index.js
    goto :end
)

echo.
echo ========================================
echo ✅ 所有检查通过！系统可以正常使用
echo ========================================
echo.
echo 测试步骤：
echo 1. 学生登录系统
echo 2. 点击作业详情中的"在线答疑"
echo 3. 提交一个测试问题
echo 4. 教师登录查看问题并回复
echo.

:end
pause
