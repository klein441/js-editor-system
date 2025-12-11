# Fix Redo Feature Database Fields
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Redo Feature Database Fields" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Adding redo_count and can_redo fields..." -ForegroundColor Yellow

# Execute SQL file
$mysqlPath = "mysql"
$dbUser = "root"
$dbPassword = "520"
$dbName = "js_editor"
$sqlFile = "fix_redo_column.sql"

try {
    # Execute SQL
    $process = Start-Process -FilePath $mysqlPath -ArgumentList "-u$dbUser -p$dbPassword $dbName" -RedirectStandardInput $sqlFile -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Database fields added successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Added fields:" -ForegroundColor Green
        Write-Host "- homework_submit.redo_count" -ForegroundColor Green
        Write-Host "- homework_submit.can_redo" -ForegroundColor Green
        Write-Host "- redo_requests table" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Failed to add fields" -ForegroundColor Red
        Write-Host "Exit code: $($process.ExitCode)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to execute SQL" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. MySQL service is running" -ForegroundColor Yellow
    Write-Host "2. Database password is correct: 520" -ForegroundColor Yellow
    Write-Host "3. Database js_editor exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
