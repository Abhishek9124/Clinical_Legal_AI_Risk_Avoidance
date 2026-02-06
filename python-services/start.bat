@echo off
echo ========================================
echo CLARA Python ML Services Startup
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting CLARA Python Analytics Service
echo ========================================
echo.
echo Service will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the service
echo.

python app.py
