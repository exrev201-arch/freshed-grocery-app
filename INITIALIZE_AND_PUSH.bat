@echo off
echo Initializing Git repository and pushing to GitHub
echo ===============================================
echo.

REM Check if we're in the right directory
echo Current directory: %CD%
echo.

REM Initialize git repository
echo 1. Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/downloads
    echo Or use GitHub Desktop to initialize and push your repository
    pause
    exit /b 1
)

REM Add all files
echo 2. Adding files to repository...
git add .

REM Create initial commit
echo 3. Creating initial commit...
git commit -m "Initial commit: Fresh Grocery App ready for deployment"

REM Instructions for pushing to GitHub
echo.
echo 4. Repository initialized successfully!
echo.
echo Next steps to push to GitHub:
echo.
echo Option A: If you have a GitHub repository already created:
echo    git remote add origin YOUR_REPOSITORY_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo Option B: If you need to create a new repository:
echo    1. Go to https://github.com/new
echo    2. Create a new repository
echo    3. Follow the instructions on GitHub to push an existing repository
echo.
echo For GitHub CLI users:
echo    gh repo create fresh-grocery-app --private --source=. --remote=origin
echo    git push -u origin main
echo.
echo For GitHub Desktop users:
echo    Open GitHub Desktop and add this folder as a local repository
echo    Publish to GitHub from the application
echo.
pause