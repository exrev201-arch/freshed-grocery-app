@echo off
echo ========================================
echo Freshed Grocery App - Secret Generator
echo ========================================
echo.

echo Generating secure JWT secrets...
echo.

REM Generate JWT_SECRET
for /f "delims=" %%a in ('powershell -command "(-join (1..32 | % { [char[]](33..126) | Get-Random }))"') do set "JWT_SECRET=%%a"

REM Generate JWT_REFRESH_SECRET
for /f "delims=" %%a in ('powershell -command "(-join (1..32 | % { [char[]](33..126) | Get-Random }))"') do set "JWT_REFRESH_SECRET=%%a"

REM Generate CLICKPESA_WEBHOOK_SECRET
for /f "delims=" %%a in ('powershell -command "(-join (1..32 | % { [char[]](33..126) | Get-Random }))"') do set "CLICKPESA_WEBHOOK_SECRET=%%a"

echo Your generated secrets:
echo ======================
echo JWT_SECRET=%JWT_SECRET%
echo JWT_REFRESH_SECRET=%JWT_REFRESH_SECRET%
echo CLICKPESA_WEBHOOK_SECRET=%CLICKPESA_WEBHOOK_SECRET%
echo.

echo Instructions:
echo 1. Copy these values to your environment variables
echo 2. Store them securely
echo 3. Never share them publicly
echo.

pause