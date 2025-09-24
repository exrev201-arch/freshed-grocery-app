@echo off
echo ========================================
echo Freshed Grocery App - Final Verification
echo ========================================
echo.

echo Checking key files for "freshed" branding:
echo.

findstr /i /c:"freshed" package.json >nul
if %ERRORLEVEL% == 0 (
    echo ✓ package.json contains "freshed"
) else (
    echo ✗ package.json missing "freshed"
)

findstr /i /c:"freshed" README.md >nul
if %ERRORLEVEL% == 0 (
    echo ✓ README.md contains "freshed"
) else (
    echo ✗ README.md missing "freshed"
)

findstr /i /c:"freshed-grocery-frontend" render.yaml >nul
if %ERRORLEVEL% == 0 (
    echo ✓ render.yaml contains "freshed-grocery-frontend"
) else (
    echo ✗ render.yaml missing "freshed-grocery-frontend"
)

findstr /i /c:"freshed-grocery-backend" render.yaml >nul
if %ERRORLEVEL% == 0 (
    echo ✓ render.yaml contains "freshed-grocery-backend"
) else (
    echo ✗ render.yaml missing "freshed-grocery-backend"
)

findstr /i /c:"admin@freshed.co.tz" .env >nul
if %ERRORLEVEL% == 0 (
    echo ✓ .env contains "admin@freshed.co.tz"
) else (
    echo ✗ .env missing "admin@freshed.co.tz"
)

findstr /i /c:"admin@freshed.co.tz" backend\.env >nul
if %ERRORLEVEL% == 0 (
    echo ✓ backend\.env contains "admin@freshed.co.tz"
) else (
    echo ✗ backend\.env missing "admin@freshed.co.tz"
)

echo.
echo Checking for remaining "fresh" references (ignoring legitimate ones):
echo.

findstr /i /c:"fresh grocery" package.json >nul
if %ERRORLEVEL% == 0 (
    echo ✗ Found "fresh grocery" in package.json
) else (
    echo ✓ No "fresh grocery" in package.json
)

findstr /i /c:"fresh grocery" README.md >nul
if %ERRORLEVEL% == 0 (
    echo ✗ Found "fresh grocery" in README.md
) else (
    echo ✓ No "fresh grocery" in README.md
)

echo.
echo Verification complete!
echo If all checks show ✓, your application is ready for deployment.
echo.
pause