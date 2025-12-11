# PowerShell 脚本：重启后端服务
# 自动关闭占用5000端口的进程并重启

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "重启后端服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 查找占用5000端口的进程
Write-Host "正在查找占用端口5000的进程..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":5000"

if ($connections) {
    Write-Host "找到以下进程占用端口5000：" -ForegroundColor Yellow
    Write-Host $connections -ForegroundColor Gray
    Write-Host ""
    
    # 提取PID
    $pids = @()
    foreach ($line in $connections) {
        if ($line -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            if ($pid -notin $pids) {
                $pids += $pid
            }
        }
    }
    
    # 关闭进程
    foreach ($pid in $pids) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "正在关闭进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force
                Write-Host "✅ 进程已关闭" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  无法关闭进程 $pid" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1
} else {
    Write-Host "✅ 端口5000未被占用" -ForegroundColor Green
    Write-Host ""
}

# 启动新的后端服务
Write-Host "正在启动后端服务..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "后端服务已启动" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 启动 node
node index.js
