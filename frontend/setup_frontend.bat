@echo off
echo ===================================================
echo   AlgoPulse Phase 1 - Frontend Dependency Setup
echo ===================================================
echo.

cd /d "%~dp0"

echo Installing npm packages...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install npm packages.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo [SUCCESS] Frontend packages installed successfully!
echo You can start the frontend client with: start_frontend.bat
echo ===================================================
pause
