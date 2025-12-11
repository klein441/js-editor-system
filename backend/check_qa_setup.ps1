# PowerShell 脚本：在线答疑系统诊断工具
# 使用方法：.\check_qa_setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "在线答疑系统诊断工具" -ForegroundColor Cyan
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

# 检查1：数据库连接
Write-Host "[1/4] 检查数据库连接..." -ForegroundColor Yellow
try {
    $result = mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库连接正常" -ForegroundColor Green
    } else {
        throw "连接失败"
    }
} catch {
    Write-Host "❌ 数据库连接失败" -ForegroundColor Red
    Write-Host "   请检查 .env 文件中的数据库配置" -ForegroundColor Red
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit
}

# 检查2：数据库是否存在
Write-Host ""
Write-Host "[2/4] 检查数据库是否存在..." -ForegroundColor Yellow
try {
    $result = mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库 $DB_NAME 存在" -ForegroundColor Green
    } else {
        throw "数据库不存在"
    }
} catch {
    Write-Host "❌ 数据库 $DB_NAME 不存在" -ForegroundColor Red
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit
}

# 检查3：qa_questions 表是否存在
Write-Host ""
Write-Host "[3/4] 检查 qa_questions 表是否存在..." -ForegroundColor Yellow
try {
    $result = mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE qa_questions" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ qa_questions 表已存在" -ForegroundColor Green
        Write-Host ""
        Write-Host "表结构：" -ForegroundColor Cyan
        mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE qa_questions"
    } else {
        throw "表不存在"
    }
} catch {
    Write-Host "❌ qa_questions 表不存在" -ForegroundColor Red
    Write-Host ""
    Write-Host "请运行以下命令创建表：" -ForegroundColor Yellow
    Write-Host "   .\setup_qa.ps1" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit
}

# 检查4：后端服务
Write-Host ""
Write-Host "[4/4] 检查后端服务..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 后端服务运行正常 (http://localhost:5000)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 后端服务未启动" -ForegroundColor Red
    Write-Host ""
    Write-Host "请运行以下命令启动后端：" -ForegroundColor Yellow
    Write-Host "   node index.js" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键退出"
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 所有检查通过！系统可以正常使用" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "测试步骤：" -ForegroundColor Cyan
Write-Host "1. 学生登录系统"
Write-Host "2. 点击作业详情中的'在线答疑'"
Write-Host "3. 提交一个测试问题"
Write-Host "4. 教师登录查看问题并回复"
Write-Host ""

Read-Host "按 Enter 键退出"
