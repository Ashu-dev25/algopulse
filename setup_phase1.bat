@echo off
echo ===================================================
echo     🚀 AlgoPulse - Phase 1 Full Stack Setup
echo ===================================================
echo.

echo ==================== [1/2] BACKEND ====================
cd /d "%~dp0backend"
echo Installing backend Python requirements...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Backend dependency install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ==================== [2/2] FRONTEND ===================
cd /d "%~dp0frontend"
echo Installing frontend npm packages...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend dependency install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo [SUCCESS] Phase 1 Full-Stack Installation Complete!
echo You can now start both services with: start_phase1.bat
echo ===================================================
pause
