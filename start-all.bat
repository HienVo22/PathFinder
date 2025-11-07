@echo off
echo 🚀 Starting PathFinder...
echo.

REM Set MongoDB data path
set "MONGODB_DATA_PATH=%CD%\data\db_new"

REM Check if MongoDB is already running
netstat -ano | findstr "27017" > nul
if %ERRORLEVEL% == 0 (
    echo ✓ MongoDB is already running
) else (
    echo Starting MongoDB...
    
    REM Create MongoDB data directory if it doesn't exist
    if not exist "%MONGODB_DATA_PATH%" (
        echo Creating MongoDB data directory: %MONGODB_DATA_PATH%
        mkdir "%MONGODB_DATA_PATH%"
        if errorlevel 1 (
            echo ❌ Failed to create MongoDB data directory: %MONGODB_DATA_PATH%
            echo Please check permissions or create the directory manually
            exit /b 1
        )
    )
    
    REM Start MongoDB
    start /B mongod --dbpath "%MONGODB_DATA_PATH%" --port 27017
    timeout /t 2 /nobreak > nul
    
    REM Verify MongoDB started successfully
    netstat -ano | findstr "27017" > nul
    if %ERRORLEVEL% == 0 (
        echo ✓ MongoDB started on port 27017 with data path: %MONGODB_DATA_PATH%
    ) else (
        echo ❌ Failed to start MongoDB. Check if MongoDB is installed and in PATH
        echo Try running 'mongod --dbpath "%MONGODB_DATA_PATH%" --port 27017' manually
        exit /b 1
    )
)

REM Check if Next.js is running
netstat -ano | findstr "3000" > nul
if %ERRORLEVEL% == 0 (
    echo ✓ Next.js is already running on port 3000
) else (
    echo Starting Next.js...
    start /B cmd /c "npm run dev"
    timeout /t 3 /nobreak > nul
    echo ✓ Next.js started on port 3000
)

echo.
echo ✅ All services are running!
echo.
echo Open your browser: http://localhost:3000
echo.
echo To stop all services, use Task Manager or 'taskkill'