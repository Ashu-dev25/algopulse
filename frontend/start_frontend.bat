@echo off
echo ===================================================
echo   AlgoPulse Phase 1 - Launching Frontend Client
echo ===================================================
echo.

cd /d "%~dp0"

echo Frontend URL: http://localhost:3000
echo.

call npm run dev

pause
