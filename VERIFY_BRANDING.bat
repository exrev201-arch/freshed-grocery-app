@echo off
echo ========================================
echo Freshed Grocery App - Branding Verification
echo ========================================
echo.

echo Checking that all "fresh" references have been updated to "freshed":
echo.

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

findstr /i /c:"freshed-grocery-tz" package.json >nul
if %ERRORLEVEL% == 0 (
    echo ✓ package.json contains "freshed-grocery-tz"
) else (
    echo ✗ package.json missing "freshed-grocery-tz"
)

findstr /i /c:"freshed-grocery-backend" backend\package.json >nul
if %ERRORLEVEL% == 0 (
    echo ✓ backend\package.json contains "freshed-grocery-backend"
) else (
    echo ✗ backend\package.json missing "freshed-grocery-backend"
)

echo.
echo Checking for any remaining "fresh" references that should be "freshed":
echo.

REM Check for "fresh grocery" (should be "freshed grocery")
findstr /i /c:"fresh grocery" package.json >nul
if %ERRORLEVEL% == 0 (
    echo ✗ Found "fresh grocery" in package.json - should be "freshed grocery"
) else (
    echo ✓ No "fresh grocery" in package.json
)

findstr /i /c:"fresh grocery" README.md >nul
if %ERRORLEVEL% == 0 (
    echo ✗ Found "fresh grocery" in README.md - should be "freshed grocery"
) else (
    echo ✓ No "fresh grocery" in README.md
)

findstr /i /c:"fresh grocery" DEPLOYMENT.md >nul
if %ERRORLEVEL% == 0 (
    echo ✗ Found "fresh grocery" in DEPLOYMENT.md - should be "freshed grocery"
) else (
    echo ✓ No "fresh grocery" in DEPLOYMENT.md
)

echo.
echo Verification complete!
echo If all checks show ✓, your application branding is correct for deployment.
echo.
echo Next steps:
echo 1. Go to https://dashboard.render.com
echo 2. Connect your GitHub repository
echo 3. Configure environment variables as specified in RENDER_DEPLOYMENT_FROM_GITHUB.md
echo 4. Deploy both services
echo.
pause