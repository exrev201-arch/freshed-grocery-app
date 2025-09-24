# PowerShell script to initialize Git repository and push to GitHub
Write-Host "Initializing Git repository and pushing to GitHub" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host ""

# Initialize git repository
Write-Host "1. Initializing Git repository..." -ForegroundColor Cyan
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "Or use GitHub Desktop to initialize and push your repository" -ForegroundColor Yellow
    pause
    exit 1
}

# Add all files
Write-Host "2. Adding files to repository..." -ForegroundColor Cyan
git add .

# Create initial commit
Write-Host "3. Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Fresh Grocery App ready for deployment"

# Instructions for pushing to GitHub
Write-Host ""
Write-Host "4. Repository initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps to push to GitHub:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A: If you have a GitHub repository already created:" -ForegroundColor Yellow
Write-Host "   git remote add origin YOUR_REPOSITORY_URL" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Option B: If you need to create a new repository:" -ForegroundColor Yellow
Write-Host "   1. Go to https://github.com/new" -ForegroundColor White
Write-Host "   2. Create a new repository" -ForegroundColor White
Write-Host "   3. Follow the instructions on GitHub to push an existing repository" -ForegroundColor White
Write-Host ""
Write-Host "For GitHub CLI users:" -ForegroundColor Yellow
Write-Host "   gh repo create fresh-grocery-app --private --source=. --remote=origin" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "For GitHub Desktop users:" -ForegroundColor Yellow
Write-Host "   Open GitHub Desktop and add this folder as a local repository" -ForegroundColor White
Write-Host "   Publish to GitHub from the application" -ForegroundColor White
Write-Host ""
pause