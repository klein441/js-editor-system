@echo off
chcp 65001 >nul
echo ========================================
echo Fix Redo Feature Database Fields
echo ========================================
echo.

echo Adding redo_count and can_redo fields...
mysql -u root -p520 js_editor < fix_redo_column.sql

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Database fields added successfully!
    echo.
    echo Added fields:
    echo - homework_submit.redo_count
    echo - homework_submit.can_redo
    echo - redo_requests table
) else (
    echo.
    echo [ERROR] Failed to add fields. Please check:
    echo 1. MySQL service is running
    echo 2. Database password is correct: 520
    echo 3. Database js_editor exists
)

echo.
pause
