@echo off
title Notchi Build
echo ============================================
echo   Notchi for Windows - Build Script
echo ============================================
echo.

:: ── Check Python ─────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Python bulunamadi. Otomatik kurulum baslatiliyor...
    echo.

    :: Try winget first (Windows 10 1709+ / Windows 11)
    winget --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [*] winget ile Python kuruluyor...
        winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements
        if %errorlevel% equ 0 (
            echo [OK] Python kuruldu. PATH guncelleniyor...
            goto :refresh_path
        )
    )

    :: Fallback: download Python installer directly
    echo [*] Python indiriliyor...
    set "PYINSTALLER_URL=https://www.python.org/ftp/python/3.12.9/python-3.12.9-amd64.exe"
    set "PYINSTALLER_EXE=%TEMP%\python-installer.exe"

    :: Try PowerShell download
    powershell -Command "Invoke-WebRequest -Uri '%PYINSTALLER_URL%' -OutFile '%PYINSTALLER_EXE%'" 2>nul
    if not exist "%PYINSTALLER_EXE%" (
        :: Try curl
        curl -Lo "%PYINSTALLER_EXE%" "%PYINSTALLER_URL%" 2>nul
    )

    if not exist "%PYINSTALLER_EXE%" (
        echo.
        echo [HATA] Python indirilemedi.
        echo Lutfen Python 3.10+ manuel kurun: https://python.org/downloads
        echo Kurulumda "Add Python to PATH" kutusunu isaretlemeyi unutmayin!
        pause
        exit /b 1
    )

    echo [*] Python kuruluyor (bu birkaç dakika surebilir)...
    "%PYINSTALLER_EXE%" /quiet InstallAllUsers=0 PrependPath=1 Include_pip=1 Include_tcltk=1
    if %errorlevel% neq 0 (
        echo [!] Sessiz kurulum basarisiz. Kurulum penceresi aciliyor...
        "%PYINSTALLER_EXE%"
    )
    del "%PYINSTALLER_EXE%" >nul 2>&1

:refresh_path
    :: Refresh PATH from registry so we can find python immediately
    echo [*] PATH yenileniyor...
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%B"
    for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%B"
    set "PATH=%USER_PATH%;%SYS_PATH%"

    :: Also check common Python install locations
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"
    )
    if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%"
    )

    :: Verify
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo [HATA] Python hala bulunamiyor.
        echo Lutfen bu terminal penceresini kapatip yenisini acin,
        echo sonra build.bat'i tekrar calistirin.
        pause
        exit /b 1
    )
    echo [OK] Python hazir!
    echo.
)

:: Show Python version
for /f "tokens=*" %%V in ('python --version 2^>^&1') do echo [*] %%V

:: ── Install dependencies ─────────────────────
echo.
echo [1/4] Bagimliliklar kuruluyor...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt pyinstaller 2>&1
if %errorlevel% neq 0 (
    echo [UYARI] Bazi bagimliliklar kurulamadi. Devam ediliyor...
)

:: ── Generate icon ────────────────────────────
echo.
echo [2/4] Uygulama ikonu olusturuluyor...
python generate_icon.py 2>&1

:: ── Build exe (GUI + debug) ──────────────────
echo.
echo [3/4] Notchi.exe derleniyor (1-2 dakika surebilir)...

set PYINSTALLER_ARGS=--onefile --hidden-import=pystray._win32 --hidden-import=PIL.ImageTk --exclude-module=pystray._xorg --exclude-module=pystray._gtk --exclude-module=pystray._darwin --exclude-module=pystray._appindicator

:: Build GUI version (no console)
if exist notchi_icon.ico (
    python -m PyInstaller %PYINSTALLER_ARGS% --noconsole --name Notchi --icon=notchi_icon.ico main.py
) else (
    python -m PyInstaller %PYINSTALLER_ARGS% --noconsole --name Notchi main.py
)

:: Also build debug version (with console for troubleshooting)
echo [3b/4] Debug versiyonu derleniyor...
if exist notchi_icon.ico (
    python -m PyInstaller %PYINSTALLER_ARGS% --console --name NotchiDebug --icon=notchi_icon.ico main.py
) else (
    python -m PyInstaller %PYINSTALLER_ARGS% --console --name NotchiDebug main.py
)

if %errorlevel% neq 0 (
    echo.
    echo [HATA] Derleme basarisiz oldu!
    pause
    exit /b 1
)

:: ── Done ─────────────────────────────────────
copy dist\Notchi.exe Notchi.exe >nul 2>&1
copy dist\NotchiDebug.exe NotchiDebug.exe >nul 2>&1

echo.
echo ============================================
echo   Notchi.exe hazir!
echo ============================================
echo.
echo   Konum: dist\Notchi.exe
echo.
echo   Calistirmak icin:
echo     Notchi.exe
echo.
echo   Hata ayiklama icin (konsol penceresi ile):
echo     NotchiDebug.exe
echo.
echo   Duygu analizi ile:
echo     Notchi.exe --api-key ANTHROPIC_API_KEY
echo.
echo ============================================

pause
