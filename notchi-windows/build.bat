@echo off
title Notchi Build
echo ============================================
echo   Notchi for Windows - Build Script
echo ============================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 goto :nopython

for /f "tokens=*" %%V in ('python --version 2^>^&1') do echo [*] %%V
echo.

echo [1/4] Bagimliliklar kuruluyor...
python -m pip install --upgrade pip
python -m pip install Pillow pystray requests pyinstaller
echo.

echo [2/4] Uygulama ikonu olusturuluyor...
python generate_icon.py
echo.

echo [3/4] Notchi.exe derleniyor...
python -m PyInstaller --onefile --noconsole --name Notchi --hidden-import=pystray._win32 --hidden-import=PIL.ImageTk --exclude-module=pystray._xorg --exclude-module=pystray._gtk --exclude-module=pystray._darwin --exclude-module=pystray._appindicator main.py
if %errorlevel% neq 0 goto :buildfail
echo.

echo [3b/4] Debug versiyonu derleniyor...
python -m PyInstaller --onefile --console --name NotchiDebug --hidden-import=pystray._win32 --hidden-import=PIL.ImageTk --exclude-module=pystray._xorg --exclude-module=pystray._gtk --exclude-module=pystray._darwin --exclude-module=pystray._appindicator main.py
echo.

echo [4/4] Tamamlandi!
copy dist\Notchi.exe Notchi.exe >nul 2>&1
copy dist\NotchiDebug.exe NotchiDebug.exe >nul 2>&1
echo.
echo ============================================
echo   Notchi.exe ve NotchiDebug.exe hazir!
echo   Konum: dist\
echo ============================================
pause
exit /b 0

:nopython
echo [HATA] Python bulunamadi!
echo.
echo Lutfen Python 3.10+ kurun:
echo   https://python.org/downloads
echo.
echo ONEMLI: Kurulumda "Add Python to PATH" kutusunu isaretleyin!
echo Kurulumdan sonra bu terminali kapatip tekrar acin.
pause
exit /b 1

:buildfail
echo.
echo [HATA] Derleme basarisiz!
echo Yukaridaki hatalara bakin.
pause
exit /b 1
