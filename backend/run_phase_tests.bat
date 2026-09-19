@echo off
setlocal

echo ===================================================
echo     AlgoPulse - Running Phase Validation Tests
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Running Phase 1 validation tests...
python tests\test_phase1.py
if %errorlevel% neq 0 (
    echo [ERROR] Phase 1 validation tests failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Running Phase 2 timezone regression tests...
python tests\test_phase2.py
if %errorlevel% neq 0 (
    echo [ERROR] Phase 2 validation tests failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo     [SUCCESS] All Phase Validation Tests Passed
echo ===================================================
pause
endlocal