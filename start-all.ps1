# PathFinder - Start All Services
# Run this script to start MongoDB, Ollama, and Next.js

Write-Host "🚀 Starting PathFinder..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
$mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✓ MongoDB is already running" -ForegroundColor Green
} else {
    Write-Host "Starting MongoDB..." -ForegroundColor Yellow
    
    # Set configurable MongoDB data path
    $mongoDataPath = if ($env:MONGODB_DATA_PATH) { $env:MONGODB_DATA_PATH } else { "data/db_new" }
    
    # Ensure MongoDB data directory exists
    if (-not (Test-Path $mongoDataPath)) {
        Write-Host "Creating MongoDB data directory: $mongoDataPath" -ForegroundColor Yellow
        try {
            New-Item -ItemType Directory -Path $mongoDataPath -Force | Out-Null
        } catch {
            Write-Host "❌ Failed to create MongoDB data directory: $mongoDataPath" -ForegroundColor Red
            Write-Host "Please check permissions or create the directory manually" -ForegroundColor Red
            exit 1
        }
    }
    
    # Check if directory is writable
    try {
        $testFile = Join-Path $mongoDataPath "test_write.tmp"
        [System.IO.File]::WriteAllText($testFile, "test")
        Remove-Item $testFile -Force
    } catch {
        Write-Host "❌ MongoDB data directory is not writable: $mongoDataPath" -ForegroundColor Red
        Write-Host "Please check permissions" -ForegroundColor Red
        exit 1
    }
    
    # Start MongoDB in background
    Start-Process -FilePath "mongod" -ArgumentList "--dbpath", $mongoDataPath, "--port", "27017" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    
    # Verify MongoDB started successfully
    $mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✓ MongoDB started on port 27017 with data path: $mongoDataPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start MongoDB. Check the logs for more details." -ForegroundColor Red
        Write-Host "You can run 'mongod --dbpath $mongoDataPath --port 27017' manually to see error messages." -ForegroundColor Yellow
        exit 1
    }
}

# Check if Ollama is running
$ollamaProcess = Get-Process -Name ollama* -ErrorAction SilentlyContinue
if ($ollamaProcess) {
    Write-Host "✓ Ollama is already running" -ForegroundColor Green
} else {
    Write-Host "Starting Ollama AI service..." -ForegroundColor Yellow
    try {
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction Stop
        Start-Sleep -Seconds 2
        Write-Host "✓ Ollama started on port 11434" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not start Ollama (it may not be installed)" -ForegroundColor Yellow
    }
}

# Check if Next.js is running on port 3000
$nextRunning = $false
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    # Check if any node process is listening on port 3000
    $port3000 = netstat -ano | Select-String ":3000" | Select-String "LISTENING"
    if ($port3000) {
        $nextRunning = $true
    }
}

if ($nextRunning) {
    Write-Host "✓ Next.js is already running on port 3000" -ForegroundColor Green
} else {
    Write-Host "Starting Next.js..." -ForegroundColor Yellow
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start npm run dev in a new PowerShell window that stays open
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
    Start-Sleep -Seconds 3
    Write-Host "✓ Next.js started on port 3000" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All services are running!" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, run: .\stop-all.ps1" -ForegroundColor Yellow
