@echo off
echo ===================================================
echo       AlgoPulse - Prerequisites Diagnostic Check
echo ===================================================
echo.

<<<<<<< HEAD
echo [1/6] Checking Python...
=======
echo [1/5] Checking Python...
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
python --version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed or not in PATH!
    echo         Please install Python 3.10+ from https://www.python.org/
) else (
    echo [OK] Python is installed.
)
echo.

<<<<<<< HEAD
echo [2/6] Checking Pip...
=======
echo [2/5] Checking Pip...
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
pip --version 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Pip is NOT installed or not in PATH!
) else (
    echo [OK] Pip is installed.
)
echo.

<<<<<<< HEAD
echo [3/6] Checking Node.js...
=======
echo [3/5] Checking Node.js...
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
node -v 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed or not in PATH!
    echo         Please install Node.js 18+ from https://nodejs.org/
) else (
    echo [OK] Node.js is installed.
)
echo.

<<<<<<< HEAD
echo [4/6] Checking NPM...
=======
echo [4/5] Checking NPM...
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
npm -v 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] NPM is NOT installed or not in PATH!
) else (
    echo [OK] NPM is installed.
)
echo.

<<<<<<< HEAD
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
=======
echo [5/5] Checking MongoDB...
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
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
