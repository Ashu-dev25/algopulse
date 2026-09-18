@echo off
echo ===================================================
echo       AlgoPulse - Prerequisites Diagnostic Check
echo ===================================================
echo.

echo [1/6] Checking Python...
python --version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed or not in PATH!
    echo         Please install Python 3.10+ from https://www.python.org/
) else (
    echo [OK] Python is installed.
)
echo.

echo [2/6] Checking Pip...
pip --version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Pip is NOT installed or not in PATH!
) else (
    echo [OK] Pip is installed.
)
echo.

echo [3/6] Checking Node.js...
node -v 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed or not in PATH!
    echo         Please install Node.js 18+ from https://nodejs.org/
) else (
    echo [OK] Node.js is installed.
)
echo.

echo [4/6] Checking NPM...
npm -v 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] NPM is NOT installed or not in PATH!
) else (
    echo [OK] NPM is installed.
)
echo.

echo [5/6] Checking Git...
git --version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is NOT installed or not in PATH!
    echo         Please install Git from https://git-scm.com/download/win
) else (
    echo [OK] Git is installed.
)
echo.

echo [6/6] Checking MongoDB...
echo Note: For MongoDB Atlas (Cloud), you only need your Connection String.
echo Checking for local MongoDB service/CLI...
mongosh --version 2>nul || mongo --version 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Local Mongo CLI not in PATH. If using MongoDB Atlas Cloud, this is normal and OK!
) else (
    echo [OK] Local Mongo CLI found.
)
echo.
echo ===================================================
echo Diagnostic complete. Press any key to exit.
pause
