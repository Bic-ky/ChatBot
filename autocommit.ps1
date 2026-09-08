# ChatBot Autonomous Auto-Commit Watcher (PowerShell)
$Host.UI.RawUI.WindowTitle = "ChatBot Auto-Commit Daemon (>=20 lines)"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "          ChatBot Autonomous Auto-Commit Daemon" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Threshold       : >= 20 changed lines"
Write-Host "Permission      : Completely Autonomous (No confirmation required)"
Write-Host "Git Author      : Bicky Yadav <114137746+Bic-ky@users.noreply.github.com>"
Write-Host "Target Remote   : origin/main"
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$PythonExe = "python"
if (Test-Path "backend\env\Scripts\python.exe") {
    $PythonExe = "backend\env\Scripts\python.exe"
} elseif (Test-Path ".venv\Scripts\python.exe") {
    $PythonExe = ".venv\Scripts\python.exe"
}

Write-Host "Using Python runtime: $PythonExe" -ForegroundColor Yellow
Write-Host "Starting watcher daemon..." -ForegroundColor Yellow
Write-Host ""

while ($true) {
    & $PythonExe scripts\auto_commit.py --watch --threshold 20
    Write-Host "[ALERT] Watcher stopped or interrupted. Restarting in 5s..." -ForegroundColor Red
    Start-Sleep -Seconds 5
}
