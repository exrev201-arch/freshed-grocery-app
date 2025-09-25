# PowerShell script to generate secure secrets for Freshed Grocery App
Write-Host "========================================" -ForegroundColor Green
Write-Host "Freshed Grocery App - Secret Generator" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Generating secure JWT secrets..." -ForegroundColor Yellow
Write-Host ""

# Function to generate a random string
function Generate-RandomString {
    param(
        [int]$Length = 32
    )
    
    $characters = [char[]](33..126)  # Printable ASCII characters
    $randomString = -join (1..$Length | ForEach-Object { $characters | Get-Random })
    return $randomString
}

# Generate secrets
$JWT_SECRET = Generate-RandomString -Length 32
$JWT_REFRESH_SECRET = Generate-RandomString -Length 32
$CLICKPESA_WEBHOOK_SECRET = Generate-RandomString -Length 32

Write-Host "Your generated secrets:" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host "JWT_SECRET=$JWT_SECRET"
Write-Host "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
Write-Host "CLICKPESA_WEBHOOK_SECRET=$CLICKPESA_WEBHOOK_SECRET"
Write-Host ""

Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Copy these values to your environment variables" -ForegroundColor White
Write-Host "2. Store them securely" -ForegroundColor White
Write-Host "3. Never share them publicly" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")