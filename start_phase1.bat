@echo off
echo ===================================================
echo     🚀 AlgoPulse - Launching Phase 1 Services
echo ===================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "AlgoPulse Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:3000 ...
start "AlgoPulse Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo Phase 1 Services are online:
echo - Frontend Web UI:  http://localhost:3000
echo - Backend API Docs: http://localhost:8000/docs
echo ===================================================
echo Press any key to exit this launcher window.
pause
