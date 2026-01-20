# Start dev server with OTEL + GlitchTip enabled
# Run: .\scripts\start-with-otel.ps1

Write-Host "Loading environment from .env.local..." -ForegroundColor Cyan

# Load env file
$envFile = Get-Content ".env.local" -ErrorAction Stop
foreach ($line in $envFile) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue  # Skip comments and empty lines
    }
    
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $Matches[1].Trim()
        $value = $Matches[2].Trim()
        
        # Set environment variable
        [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
        
        # Show critical observability vars
        if ($key -match 'OTEL|SENTRY') {
            $displayValue = if ($value.Length -gt 50) { $value.Substring(0, 50) + "..." } else { $value }
            Write-Host "  $key = $displayValue" -ForegroundColor Green
        }
    }
}

Write-Host "`nStarting dev server with observability enabled..." -ForegroundColor Cyan
Write-Host "  - OTEL endpoint: $env:OTEL_EXPORTER_OTLP_ENDPOINT" -ForegroundColor Yellow
Write-Host "  - Sentry DSN: $env:SENTRY_DSN" -ForegroundColor Yellow
Write-Host ""

# Start server in webpack mode
pnpm --filter web dev:webpack
