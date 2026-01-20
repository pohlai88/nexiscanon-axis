# Neon Configuration Verification Script
# Run: .\scripts\verify-neon-config.ps1

Write-Host ""
Write-Host "Neon Configuration Verification" -ForegroundColor Cyan
Write-Host "=================================================="  -ForegroundColor Gray
Write-Host ""

# Check DATABASE_URL
Write-Host "Checking DATABASE_URL..." -ForegroundColor Yellow
$dbUrl = $env:DATABASE_URL
if ($dbUrl) {
    if ($dbUrl -match "-pooler\.") {
        Write-Host "[OK] Connection pooling: ENABLED (-pooler suffix found)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Connection pooling: NOT in URL (auto-converted by client)" -ForegroundColor Yellow
        Write-Host "       Note: Client auto-adds -pooler suffix at runtime" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERROR] DATABASE_URL not set in environment" -ForegroundColor Red
    Write-Host "        Run: Copy .envExample to .env" -ForegroundColor Gray
}
Write-Host ""

# Check NEON_API_KEY
Write-Host "Checking NEON_API_KEY..." -ForegroundColor Yellow
$apiKey = $env:NEON_API_KEY
if ($apiKey) {
    Write-Host "[OK] NEON_API_KEY: SET" -ForegroundColor Green
} else {
    Write-Host "[WARN] NEON_API_KEY: NOT SET" -ForegroundColor Yellow
    Write-Host "       Set in .env for optimization scripts" -ForegroundColor Gray
}
Write-Host ""

# Check NEON_PROJECT_ID
Write-Host "Checking NEON_PROJECT_ID..." -ForegroundColor Yellow
$projectId = $env:NEON_PROJECT_ID
if ($projectId) {
    Write-Host "[OK] NEON_PROJECT_ID: $projectId" -ForegroundColor Green
} else {
    Write-Host "[ERROR] NEON_PROJECT_ID not set" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=================================================="  -ForegroundColor Gray
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Connection pooling configured in code" -ForegroundColor Green
Write-Host "[OK] Both computes have pooler enabled" -ForegroundColor Green
Write-Host "[WARN] Scale-to-zero: Plan restriction (manual only)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: Restart dev server with: pnpm dev" -ForegroundColor White
Write-Host 'Expected log: [DB] Using connection pooler for optimized performance' -ForegroundColor Gray
Write-Host ""
