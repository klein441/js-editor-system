@echo off
chcp 65001 >nul
echo ========================================
echo     数据库导出脚本 (开发环境使用)
echo ========================================
echo.

:: 设置变量
set DB_NAME=js_editor
set DB_USER=root
set DB_PASS=520

echo 正在导出数据库: %DB_NAME%
echo 用户: %DB_USER%
echo.

:: 导出完整数据库 (结构+数据)
echo 1. 导出完整数据库 (包含数据)...
mysqldump -u %DB_USER% -p%DB_PASS% %DB_NAME% > js_editor_full_backup.sql
if errorlevel 1 (
    echo ❌ 完整导出失败
) else (
    echo ✅ 完整导出成功: js_editor_full_backup.sql
)

:: 导出仅结构
echo.
echo 2. 导出数据库结构 (不含数据)...
mysqldump -u %DB_USER% -p%DB_PASS% --no-data %DB_NAME% > js_editor_structure.sql
if errorlevel 1 (
    echo ❌ 结构导出失败
) else (
    echo ✅ 结构导出成功: js_editor_structure.sql
)

:: 导出仅数据
echo.
echo 3. 导出数据 (不含结构)...
mysqldump -u %DB_USER% -p%DB_PASS% --no-create-info %DB_NAME% > js_editor_data.sql
if errorlevel 1 (
    echo ❌ 数据导出失败
) else (
    echo ✅ 数据导出成功: js_editor_data.sql
)

echo.
echo ========================================
echo ✅ 数据库导出完成！
echo ========================================
echo.
echo 📁 生成的文件:
echo   js_editor_full_backup.sql    - 完整备份 (推荐用于迁移)
echo   js_editor_structure.sql      - 仅表结构
echo   js_editor_data.sql           - 仅数据
echo.
echo 📤 下一步:
echo 1. 将 js_editor_full_backup.sql 上传到服务器
echo 2. 在服务器上运行 migrate-database.bat
echo.
pause