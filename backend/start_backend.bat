@echo off
echo ===================================================
echo     AlgoPulse - Launching FastAPI Backend Server
echo ===================================================
echo.

cd /d "%~dp0"

echo Server URL: http://localhost:8000
echo Swagger UI Docs: http://localhost:8000/docs
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
