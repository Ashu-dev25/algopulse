@echo off
echo Cleaning up future phase files to keep ONLY Phase 1...

del /f /q "app\services\leetcode.py" 2>nul
del /f /q "app\services\streak.py" 2>nul
del /f /q "app\services\agent.py" 2>nul

del /f /q "app\api\sync.py" 2>nul
del /f /q "app\api\streak.py" 2>nul
del /f /q "app\api\analytics.py" 2>nul
del /f /q "app\api\agent.py" 2>nul
del /f /q "app\api\problems.py" 2>nul

rd /s /q "..\frontend" 2>nul
del /f /q "..\start_all.bat" 2>nul
del /f /q "..\setup_all.bat" 2>nul

echo.
echo [DONE] Cleaned up all future phase files. Only Phase 1 remains.
echo.
pause
