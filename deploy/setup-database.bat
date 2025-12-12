@echo off
chcp 65001 >nul
echo ========================================
echo   数据库初始化脚本
echo   基于当前项目结构
echo ========================================
echo.

:: 设置变量
set PROJECT_ROOT=%~dp0..
set MYSQL_USER=root
set DB_NAME=js_editor

echo 当前项目根目录: %PROJECT_ROOT%
echo.

:: 检查MySQL
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL未安装或未配置PATH
    echo 请安装MySQL并确保mysql命令可用
    pause
    exit /b 1
)

:: 获取MySQL密码
set /p MYSQL_PASS="请输入MySQL root密码: "

:: 测试连接
echo 测试MySQL连接...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL连接失败，请检查用户名和密码
    pause
    exit /b 1
)

echo ✅ MySQL连接成功
echo.

:: 创建数据库和用户
echo 1. 创建数据库和用户...
set /p DB_USER="请输入新的数据库用户名 (默认: jseditor): "
if "%DB_USER%"=="" set DB_USER=jseditor

set /p DB_PASS="请输入新的数据库密码: "
if "%DB_PASS%"=="" (
    echo ❌ 数据库密码不能为空
    pause
    exit /b 1
)

echo 创建数据库 %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 创建用户 %DB_USER%...
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "CREATE USER IF NOT EXISTS '%DB_USER%'@'localhost' IDENTIFIED BY '%DB_PASS%';"
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "GRANT ALL PRIVILEGES ON %DB_NAME%.* TO '%DB_USER%'@'localhost';"
mysql -u %MYSQL_USER% -p%MYSQL_PASS% -e "FLUSH PRIVILEGES;"

echo ✅ 数据库和用户创建完成
echo.

:: 导入数据表
echo 2. 导入数据表结构...

:: 检查并导入基础表
if exist "%PROJECT_ROOT%\backend\init_data.sql" (
    echo 导入基础数据表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\init_data.sql"
    if errorlevel 1 (
        echo ⚠️  基础表导入失败，可能已存在
    ) else (
        echo ✅ 基础表导入成功
    )
) else (
    echo ⚠️  未找到 backend\init_data.sql
)

:: 导入课件表
if exist "%PROJECT_ROOT%\backend\create_courseware_table.sql" (
    echo 导入课件表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\create_courseware_table.sql"
    if errorlevel 1 (
        echo ⚠️  课件表导入失败，可能已存在
    ) else (
        echo ✅ 课件表导入成功
    )
)

:: 导入问答表
if exist "%PROJECT_ROOT%\backend\create_qa_table.sql" (
    echo 导入问答表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\create_qa_table.sql"
    if errorlevel 1 (
        echo ⚠️  问答表导入失败，可能已存在
    ) else (
        echo ✅ 问答表导入成功
    )
)

:: 导入通知表
if exist "%PROJECT_ROOT%\backend\setup_notifications_simple.sql" (
    echo 导入通知表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\setup_notifications_simple.sql"
    if errorlevel 1 (
        echo ⚠️  通知表导入失败，可能已存在
    ) else (
        echo ✅ 通知表导入成功
    )
)

:: 导入锚点表
if exist "%PROJECT_ROOT%\backend\sql\anchor_tables.sql" (
    echo 导入锚点表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\sql\anchor_tables.sql"
    if errorlevel 1 (
        echo ⚠️  锚点表导入失败，可能已存在
    ) else (
        echo ✅ 锚点表导入成功
    )
)

:: 执行其他SQL修复脚本
echo.
echo 3. 执行数据库修复和优化...

if exist "%PROJECT_ROOT%\backend\add_user_fields.sql" (
    echo 添加用户字段...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\add_user_fields.sql" 2>nul
)

if exist "%PROJECT_ROOT%\backend\fix_redo_column.sql" (
    echo 修复重做字段...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\backend\fix_redo_column.sql" 2>nul
)

if exist "%PROJECT_ROOT%\add_score_column.sql" (
    echo 添加评分字段...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\add_score_column.sql" 2>nul
)

:: 验证数据库结构
echo.
echo 4. 验证数据库结构...
echo 检查主要数据表...
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SHOW TABLES;" | findstr -i "user courseware homework knowledge_anchors anchor_resources qa_questions notifications"

if errorlevel 1 (
    echo ⚠️  部分表可能未创建成功
) else (
    echo ✅ 主要数据表验证成功
)

:: 创建环境配置文件
echo.
echo 5. 创建环境配置文件...
set ENV_FILE=%PROJECT_ROOT%\backend\.env.production

if not exist "%ENV_FILE%" (
    echo 创建生产环境配置文件...
    (
        echo # 生产环境数据库配置
        echo NODE_ENV=production
        echo.
        echo # 数据库配置
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=%DB_USER%
        echo DB_PASSWORD=%DB_PASS%
        echo DB_NAME=%DB_NAME%
        echo.
        echo # 服务器配置
        echo PORT=5000
        echo HOST=0.0.0.0
        echo.
        echo # 安全配置
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo CORS_ORIGIN=http://your-domain.com
        echo.
        echo # 文件上传配置
        echo UPLOAD_MAX_SIZE=52428800
        echo VIDEO_MAX_SIZE=524288000
    ) > "%ENV_FILE%"
    
    echo ✅ 环境配置文件已创建: %ENV_FILE%
    echo ⚠️  请根据实际情况修改配置参数
) else (
    echo ✅ 环境配置文件已存在: %ENV_FILE%
)

echo.
echo ========================================
echo ✅ 数据库初始化完成！
echo ========================================
echo.
echo 📊 数据库信息:
echo    数据库名: %DB_NAME%
echo    用户名: %DB_USER%
echo    主机: localhost:3306
echo.
echo 📁 配置文件:
echo    环境配置: %ENV_FILE%
echo.
echo 🔧 下一步操作:
echo 1. 检查并修改环境配置文件中的参数
echo 2. 运行后端服务测试数据库连接
echo 3. 执行完整的系统部署
echo.
echo 💡 测试数据库连接:
echo    mysql -u %DB_USER% -p %DB_NAME%
echo.

pause