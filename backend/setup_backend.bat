@echo off
echo ===================================================
echo     AlgoPulse - Backend Setup & Dependency Install
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Upgrading pip...
python -m pip install --upgrade pip

echo.
echo [2/2] Installing requirements.txt...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install some dependencies. Please check Python installation.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo [SUCCESS] Backend dependencies installed successfully!
echo You can now start the backend with: start_backend.bat
echo ===================================================
pause
