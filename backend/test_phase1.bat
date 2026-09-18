@echo off
echo ===================================================
echo     AlgoPulse - Running Phase 1 Validation Suite
echo ===================================================
echo.

cd /d "%~dp0"

python tests\test_phase1.py

echo.
pause
