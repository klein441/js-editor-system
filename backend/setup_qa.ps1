# PowerShell 脚本：创建在线答疑表
# 使用方法：.\setup_qa.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "创建在线答疑表" -ForegroundColor Cyan
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

Write-Host "正在创建在线答疑表..." -ForegroundColor Yellow

# 执行 SQL 文件
try {
    Get-Content create_qa_table.sql | mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
    
    Write-Host ""
    Write-Host "✅ 在线答疑表创建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在学生可以提问，教师可以回复了。" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ 创建失败，请检查数据库连接和权限" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
