# PowerShell 脚本：创建课件管理表

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "创建课件管理表" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 读取 .env 文件
$envFile = Get-Content .env
$dbConfig = @{}

foreach ($line in $envFile) {
    if ($line -match '^([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $dbConfig[$key] = $value
    }
}

$DB_HOST = $dbConfig['DB_HOST']
$DB_USER = $dbConfig['DB_USER']
$DB_PASSWORD = $dbConfig['DB_PASSWORD']
$DB_NAME = $dbConfig['DB_NAME']

Write-Host "数据库配置:" -ForegroundColor Yellow
Write-Host "Host: $DB_HOST"
Write-Host "User: $DB_USER"
Write-Host "Database: $DB_NAME"
Write-Host ""

Write-Host "正在创建课件管理表..." -ForegroundColor Yellow

try {
    Get-Content create_courseware_table.sql | mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
    
    Write-Host ""
    Write-Host "✅ 课件管理表创建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "接下来：" -ForegroundColor Cyan
    Write-Host "1. 安装 multer 包: npm install"
    Write-Host "2. 重启后端服务: node index.js"
    Write-Host "3. 教师端可以上传课件了"
} catch {
    Write-Host ""
    Write-Host "❌ 创建失败，请检查数据库连接和权限" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
