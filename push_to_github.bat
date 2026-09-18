@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo     Pushing AlgoPulse to GitHub Repository
echo     Target: https://github.com/Ashu-dev25/algopulse.git
echo ===================================================
echo.

set "GIT_CMD=git"

:: Check if git is available in PATH
where git >nul 2>nul
if %errorlevel% equ 0 goto :GIT_FOUND

:: Check standard Git installation paths
echo [INFO] Git not found in PATH. Searching standard installation folders...

if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    goto :GIT_FOUND
)
if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\bin\git.exe"
    goto :GIT_FOUND
)
if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    goto :GIT_FOUND
)
if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files (x86)\Git\cmd\git.exe"
    goto :GIT_FOUND
)

echo.
echo [ERROR] Git is not installed on this computer.
echo.
echo Please install Git for Windows from:
echo   https://git-scm.com/download/win
echo.
echo After installing Git, reopen Command Prompt and run this script again.
echo.
pause
exit /b 1

:GIT_FOUND
echo [OK] Using Git: "!GIT_CMD!"
echo.

echo [1/5] Initializing Git repository...
"!GIT_CMD!" init

echo [2/5] Staging files...
"!GIT_CMD!" add .

echo [3/5] Creating initial commit...
"!GIT_CMD!" commit -m "Initial commit: AlgoPulse architecture, plan, and diagnostic tools"

echo [4/5] Setting main branch and remote origin...
"!GIT_CMD!" branch -M main
"!GIT_CMD!" remote remove origin 2>nul
"!GIT_CMD!" remote add origin https://github.com/Ashu-dev25/algopulse.git

echo [5/5] Pushing to GitHub...
"!GIT_CMD!" push -u origin main

echo.
echo ===================================================
echo Process complete. Press any key to close.
pause
