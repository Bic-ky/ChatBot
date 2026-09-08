@echo off
title ChatBot Auto-Commit Daemon (>=20 lines)
color 0A

echo ================================================================
echo           ChatBot Autonomous Auto-Commit Daemon
echo ================================================================
echo Threshold       : >= 20 changed lines (staged, unstaged, untracked)
echo Permission      : Completely Autonomous (No confirmation required)
echo Git Author      : Bicky Yadav ^<114137746+Bic-ky@users.noreply.github.com^>
echo Target Remote   : origin/main
echo ================================================================
echo.

cd /d "%~dp0"

:: Check for virtual environment python
if exist "backend\env\Scripts\python.exe" (
    set "PY_EXE=backend\env\Scripts\python.exe"
) else if exist ".venv\Scripts\python.exe" (
    set "PY_EXE=.venv\Scripts\python.exe"
) else (
    set "PY_EXE=python"
)

echo Using Python runtime: %PY_EXE%
echo Starting watcher...
echo.

:loop
%PY_EXE% scripts\auto_commit.py --watch --threshold 20
if %errorlevel% neq 0 (
    echo [ALERT] Watcher exited with error code %errorlevel%. Restarting in 5 seconds...
    timeout /t 5 /nobreak >nul
    goto loop
)

pause
