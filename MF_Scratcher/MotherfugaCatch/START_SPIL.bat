@echo off
title Motherfuga Catch
cd /d "%~dp0"

echo.
echo  ========================================
echo    MOTHERFUGA CATCH - Starter spil...
echo  ========================================
echo.

:: Tjek om Python findes
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo FEJL: Python er ikke installeret.
    echo Download Python fra https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Aabn browser efter kort pause
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8765"

:: Start lokal webserver
echo Spillet koerer paa: http://localhost:8765
echo.
echo Luk dette vindue for at stoppe serveren.
echo.
python -m http.server 8765