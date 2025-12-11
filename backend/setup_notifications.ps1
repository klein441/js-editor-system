# PowerShell脚本 - 通知系统数据库初始化
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "通知系统数据库初始化" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 读取.env文件
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.+)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $key -Value $value -Scope Script
        }
    }
    
    Write-Host "数据库配置:" -ForegroundColor Yellow
    Write-Host "主机: $DB_HOST"
    Write-Host "用户: $DB_USER"
    Write-Host "数据库: $DB_NAME"
    Write-Host ""
} else {
    Write-Host "错误: 找不到.env文件" -ForegroundColor Red
    Write-Host "请确保在backend目录下运行此脚本" -ForegroundColor Red
    pause
    exit
}

# 询问使用哪个SQL文件
Write-Host "请选择初始化方式:" -ForegroundColor Yellow
Write-Host "1. 完整版（包含外键约束）"
Write-Host "2. 简化版（无外键约束，推荐）"
Write-Host ""
$choice = Read-Host "请输入选择 (1 或 2)"

if ($choice -eq "2") {
    $sqlFile = "setup_notifications_simple.sql"
    Write-Host "使用简化版SQL文件..." -ForegroundColor Green
} else {
    $sqlFile = "setup_notifications.sql"
    Write-Host "使用完整版SQL文件..." -ForegroundColor Green
}

Write-Host ""
Write-Host "正在创建通知表和重做申请表..." -ForegroundColor Yellow

# 执行SQL文件
$mysqlCmd = "mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME"

if (Test-Path $sqlFile) {
    Get-Content $sqlFile | & mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME 2>&1 | Out-String | Write-Host
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ 通知系统初始化成功！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "已创建以下表:" -ForegroundColor Green
        Write-Host "- notifications (通知表)"
        Write-Host "- redo_requests (重做申请表)"
        Write-Host ""
        Write-Host "已修改以下表:" -ForegroundColor Green
        Write-Host "- homework_submit (添加重做相关字段)"
        Write-Host ""
        Write-Host "下一步:" -ForegroundColor Yellow
        Write-Host "1. 重启后端服务: node index.js"
        Write-Host "2. 登录学生账号测试通知功能"
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "✗ 初始化失败！" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "请检查:" -ForegroundColor Yellow
        Write-Host "1. MySQL服务是否运行"
        Write-Host "2. .env文件配置是否正确"
        Write-Host "3. 数据库是否存在"
        Write-Host "4. 用户是否有足够权限"
        Write-Host ""
        Write-Host "如果遇到外键错误，请选择简化版（选项2）" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "错误: 找不到SQL文件 $sqlFile" -ForegroundColor Red
}

pause
