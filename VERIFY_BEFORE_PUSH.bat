@echo off
echo Verifying Fresh Grocery App files before GitHub push
echo ====================================================
echo.

set found=0
set missing=0

REM List of required files and directories
set requiredItems="package.json" "vite.config.ts" "tsconfig.json" "tsconfig.app.json" "render.yaml" "README.md" "GITHUB_README.md" "DEPLOYMENT.md" "DEPLOYMENT_CHECKLIST.md" "DEPLOYMENT_SUMMARY.md" "DEPLOYMENT_READY.md" "GITHUB_DEPLOYMENT_GUIDE.md" "index.html" "public/manifest.json" "public/sw-enhanced.js" "public/health.html" ".env.example" "backend/package.json" "backend/src/server.ts" "backend/.env.example" ".gitignore"

echo Checking required files:
echo.

for %%f in (%requiredItems%) do (
    if exist %%f (
        echo ✓ Found: %%f
        set /a found+=1
    ) else (
        echo ✗ Missing: %%f
        set /a missing+=1
    )
)

echo.
echo Summary:
echo ========
echo Found: %found% items
echo Missing: %missing% items

if %missing% == 0 (
    echo.
    echo 🎉 All required files are present! Ready to push to GitHub.
    echo.
    echo Next steps:
    echo 1. Run INITIALIZE_AND_PUSH.bat to initialize and push to GitHub
    echo 2. Follow GITHUB_DEPLOYMENT_GUIDE.md to deploy to Render
) else (
    echo.
    echo ⚠️  Some required files are missing. Please check the list above.
)

echo.
pause