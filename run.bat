@echo off
chcp 65001 >nul
title Instagram Clone Launcher
cd /d "%~dp0"

echo ========================================================
echo   📸 Instagram Clone - One-Click Launcher
echo   FastAPI (8000) + React Vite (5173)
echo ========================================================
echo.

python run.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] 실행 도중 오류가 발생했습니다.
    pause
)
