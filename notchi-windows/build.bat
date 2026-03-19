@echo off
title Notchi Build
echo ============================================
echo   Notchi for Windows - Build Script
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Install dependencies
echo [1/4] Installing dependencies...
python -m pip install -r requirements.txt pyinstaller 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Some dependencies may have failed. Trying to continue...
)

:: Generate icon
echo [2/4] Generating application icon...
python generate_icon.py 2>&1

:: Build exe
echo [3/4] Building Notchi.exe (this may take a minute)...
if exist notchi_icon.ico (
    python -m PyInstaller --onefile --noconsole --name Notchi --icon=notchi_icon.ico ^
        --hidden-import=pystray._win32 ^
        --hidden-import=PIL.ImageTk ^
        --exclude-module=pystray._xorg ^
        --exclude-module=pystray._gtk ^
        --exclude-module=pystray._darwin ^
        --exclude-module=pystray._appindicator ^
        main.py
) else (
    python -m PyInstaller --onefile --noconsole --name Notchi ^
        --hidden-import=pystray._win32 ^
        --hidden-import=PIL.ImageTk ^
        --exclude-module=pystray._xorg ^
        --exclude-module=pystray._gtk ^
        --exclude-module=pystray._darwin ^
        --exclude-module=pystray._appindicator ^
        main.py
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Check the output above for details.
    pause
    exit /b 1
)

:: Done
echo [4/4] Build complete!
echo.
echo ============================================
echo   Notchi.exe is ready in the dist\ folder
echo ============================================
echo.
echo To run: dist\Notchi.exe
echo To run with emotion analysis: dist\Notchi.exe --api-key YOUR_KEY
echo.

:: Copy to root for convenience
copy dist\Notchi.exe Notchi.exe >nul 2>&1

pause
