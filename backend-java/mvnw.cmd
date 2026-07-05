@echo off
@REM ── MoodScript Maven shim ─────────────────────────────────────────────
@REM Uses a project-local Maven downloaded by scripts\setup.ps1, or a system
@REM Maven if one is on PATH. No wrapper jar needed.
setlocal
set "BASEDIR=%~dp0"
set "LOCAL_MVN=%BASEDIR%.tools\apache-maven-3.9.9\bin\mvn.cmd"

if exist "%LOCAL_MVN%" (
  call "%LOCAL_MVN%" %*
  exit /b %ERRORLEVEL%
)

where mvn >nul 2>nul
if %ERRORLEVEL%==0 (
  call mvn %*
  exit /b %ERRORLEVEL%
)

echo.
echo Maven not found. Run the setup script first to download a local Maven:
echo   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
echo.
exit /b 1
