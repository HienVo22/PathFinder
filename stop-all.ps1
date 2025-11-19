# PathFinder - Stop All Services

Write-Host " Stopping PathFinder services..." -ForegroundColor Cyan
Write-Host ""

# Stop MongoDB
$mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "Stopping MongoDB..." -ForegroundColor Yellow
    Stop-Process -Name mongod -Force
    Start-Sleep -Seconds 1
    Write-Host " MongoDB stopped" -ForegroundColor Green
} else {
    Write-Host " MongoDB is not running" -ForegroundColor Gray
}

# Stop Ollama
$ollamaProcess = Get-Process -Name ollama* -ErrorAction SilentlyContinue
if ($ollamaProcess) {
    Write-Host "Stopping Ollama..." -ForegroundColor Yellow
    Stop-Process -Name ollama* -Force
    Start-Sleep -Seconds 1
    Write-Host " Ollama stopped" -ForegroundColor Green
} else {
    Write-Host " Ollama is not running" -ForegroundColor Gray
}

# Stop Next.js (node processes running dev server)
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Stopping Next.js..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { Stop-Process -Id $_.Id -Force }
    Start-Sleep -Seconds 1
    Write-Host " Next.js stopped" -ForegroundColor Green
} else {
    Write-Host " Next.js is not running" -ForegroundColor Gray
}

Write-Host ""
Write-Host " All PathFinder services stopped!" -ForegroundColor Green
