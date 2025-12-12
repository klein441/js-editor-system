@echo off
chcp 65001 >nul
echo ========================================
echo     数据库迁移脚本
echo     保持现有配置: js_editor + root用户
echo ========================================
echo.

:: 设置变量
set DB_NAME=js_editor
set DB_USER=root
set PROJECT_ROOT=%~dp0..

echo 当前配置:
echo   数据库名: %DB_NAME%
echo   用户名: %DB_USER%
echo   项目路径: %PROJECT_ROOT%
echo.

:: 获取MySQL密码
set /p DB_PASS="请输入MySQL root密码: "

:: 测试MySQL连接
echo 1. 测试MySQL连接...
mysql -u %DB_USER% -p%DB_PASS% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL连接失败，请检查密码
    pause
    exit /b 1
)
echo ✅ MySQL连接成功

:: 检查数据库是否存在
echo.
echo 2. 检查数据库状态...
mysql -u %DB_USER% -p%DB_PASS% -e "USE %DB_NAME%;" >nul 2>&1
if errorlevel 1 (
    echo 📝 数据库不存在，将创建新数据库
    set CREATE_DB=1
) else (
    echo ⚠️  数据库已存在
    set /p RECREATE="是否重新创建数据库? (会删除现有数据) (y/n): "
    if /i "%RECREATE%"=="y" (
        set CREATE_DB=1
    ) else (
        set CREATE_DB=0
    )
)

:: 创建或重建数据库
if "%CREATE_DB%"=="1" (
    echo.
    echo 3. 创建数据库...
    mysql -u %DB_USER% -p%DB_PASS% -e "DROP DATABASE IF EXISTS %DB_NAME%;"
    mysql -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo ✅ 数据库创建完成
)

:: 检查是否有完整备份文件
echo.
echo 4. 检查备份文件...
if exist "%PROJECT_ROOT%\js_editor_full_backup.sql" (
    echo 📁 发现完整备份文件，导入中...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < "%PROJECT_ROOT%\js_editor_full_backup.sql"
    if errorlevel 1 (
        echo ❌ 备份文件导入失败
        goto :create_tables
    ) else (
        echo ✅ 备份文件导入成功
        goto :verify_tables
    )
) else (
    echo 📝 未找到备份文件，将使用SQL脚本创建表结构
    goto :create_tables
)

:create_tables
echo.
echo 5. 使用SQL脚本创建表结构...
cd /d "%PROJECT_ROOT%\backend"

:: 导入基础表结构
if exist "init_data.sql" (
    echo 导入基础表结构...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < init_data.sql
    if errorlevel 1 (
        echo ⚠️  基础表导入失败，可能已存在
    ) else (
        echo ✅ 基础表导入成功
    )
) else (
    echo ⚠️  未找到 init_data.sql
)

:: 创建课件表
if exist "create_courseware_table.sql" (
    echo 创建课件表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < create_courseware_table.sql 2>nul
    echo ✅ 课件表处理完成
)

:: 创建问答表
if exist "create_qa_table.sql" (
    echo 创建问答表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < create_qa_table.sql 2>nul
    echo ✅ 问答表处理完成
)

:: 创建通知表
if exist "setup_notifications_simple.sql" (
    echo 创建通知表...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < setup_notifications_simple.sql 2>nul
    echo ✅ 通知表处理完成
)

:: 添加用户字段
if exist "add_user_fields.sql" (
    echo 添加用户字段...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < add_user_fields.sql 2>nul
    echo ✅ 用户字段处理完成
)

:: 修复重做字段
if exist "fix_redo_column.sql" (
    echo 修复重做字段...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < fix_redo_column.sql 2>nul
    echo ✅ 重做字段处理完成
)

:: 添加评分字段
if exist "..\add_score_column.sql" (
    echo 添加评分字段...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < ..\add_score_column.sql 2>nul
    echo ✅ 评分字段处理完成
)

:: 创建锚点表
echo 创建锚点表...
if exist "init-anchor-tables.js" (
    node init-anchor-tables.js
    if errorlevel 1 (
        echo ⚠️  锚点表创建失败，可能已存在
    ) else (
        echo ✅ 锚点表创建成功
    )
) else (
    echo ⚠️  未找到 init-anchor-tables.js
)

:verify_tables
echo.
echo 6. 验证数据库表结构...
echo 检查主要数据表:
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SHOW TABLES;"

echo.
echo 检查关键表是否存在:
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT COUNT(*) as user_table FROM information_schema.tables WHERE table_schema='%DB_NAME%' AND table_name='user';" 2>nul
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT COUNT(*) as courseware_table FROM information_schema.tables WHERE table_schema='%DB_NAME%' AND table_name='courseware';" 2>nul
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT COUNT(*) as anchor_table FROM information_schema.tables WHERE table_schema='%DB_NAME%' AND table_name='knowledge_anchors';" 2>nul

:: 验证配置文件
echo.
echo 7. 验证配置文件...
if exist ".env" (
    echo ✅ 发现 .env 配置文件
    findstr "DB_NAME=%DB_NAME%" .env >nul
    if errorlevel 1 (
        echo ⚠️  配置文件中数据库名不匹配
    ) else (
        echo ✅ 数据库配置匹配
    )
    
    findstr "DB_USER=%DB_USER%" .env >nul
    if errorlevel 1 (
        echo ⚠️  配置文件中用户名不匹配
    ) else (
        echo ✅ 用户名配置匹配
    )
) else (
    echo ❌ 未找到 .env 配置文件
    echo 请确保 backend/.env 文件存在并配置正确
)

:: 创建测试数据 (可选)
echo.
set /p CREATE_TEST="是否创建测试用户数据? (y/n): "
if /i "%CREATE_TEST%"=="y" (
    echo 创建测试数据...
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "INSERT IGNORE INTO user (username, password, role, status) VALUES ('teacher1', 'password123', 'teacher', 1);"
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "INSERT IGNORE INTO user (username, password, role, status) VALUES ('student1', 'password123', 'student', 1);"
    mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "INSERT IGNORE INTO student_list (student_id, name, class_name) VALUES ('student1', '测试学生', '测试班级');"
    echo ✅ 测试数据创建完成
    echo 测试账户: teacher1/password123 (教师), student1/password123 (学生)
)

echo.
echo ========================================
echo ✅ 数据库迁移完成！
echo ========================================
echo.
echo 📊 数据库信息:
echo   数据库名: %DB_NAME%
echo   用户名: %DB_USER%
echo   主机: localhost:3306
echo.
echo 🔧 下一步操作:
echo 1. 启动后端服务: pm2 start ecosystem.config.js
echo 2. 测试数据库连接
echo 3. 访问前端应用进行测试
echo.
echo 💡 测试连接:
echo   mysql -u %DB_USER% -p %DB_NAME%
echo.

cd /d "%PROJECT_ROOT%"
pause