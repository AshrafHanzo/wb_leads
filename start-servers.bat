@echo off
echo Starting WorkBooster Leads Application...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not found in PATH
    echo Please restart your terminal or add Node.js to your PATH
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo npm version:
npm --version
echo.

REM Install backend dependencies if needed
echo Installing backend dependencies...
cd server
if not exist node_modules (
    npm install
)

REM Start backend server in a new window
echo Starting backend server...
start "Backend Server" cmd /k "node index.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go back to root and start frontend
cd ..
echo Starting frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:8080
echo.
pause
