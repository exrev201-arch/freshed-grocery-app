# PowerShell script to verify all necessary files are in place before pushing to GitHub
Write-Host "Verifying Fresh Grocery App files before GitHub push" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

# List of required files and directories
$requiredItems = @(
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "render.yaml",
    "README.md",
    "GITHUB_README.md",
    "DEPLOYMENT.md",
    "DEPLOYMENT_CHECKLIST.md",
    "DEPLOYMENT_SUMMARY.md",
    "DEPLOYMENT_READY.md",
    "GITHUB_DEPLOYMENT_GUIDE.md",
    "index.html",
    "public/manifest.json",
    "public/sw-enhanced.js",
    "public/health.html",
    ".env.example",
    "backend/package.json",
    "backend/src/server.ts",
    "backend/.env.example",
    ".gitignore"
)

$missingItems = @()
$foundItems = @()

foreach ($item in $requiredItems) {
    if (Test-Path $item) {
        $foundItems += $item
        Write-Host "✓ Found: $item" -ForegroundColor Green
    } else {
        $missingItems += $item
        Write-Host "✗ Missing: $item" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "========" -ForegroundColor Yellow
Write-Host "Found: $($foundItems.Count) items" -ForegroundColor Green
Write-Host "Missing: $($missingItems.Count) items" -ForegroundColor Red

if ($missingItems.Count -eq 0) {
    Write-Host ""
    Write-Host "🎉 All required files are present! Ready to push to GitHub." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run INITIALIZE_AND_PUSH.ps1 to initialize and push to GitHub" -ForegroundColor White
    Write-Host "2. Follow GITHUB_DEPLOYMENT_GUIDE.md to deploy to Render" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Some required files are missing. Please check the list above." -ForegroundColor Yellow
}

Write-Host ""
pause