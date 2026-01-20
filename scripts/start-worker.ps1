# Start worker with environment loaded from .env.local
# Run: .\scripts\start-worker.ps1

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
    }
}

Write-Host "DATABASE_URL: $($env:DATABASE_URL.Substring(0, 50))..." -ForegroundColor Green
Write-Host ""
Write-Host "Starting Graphile Worker..." -ForegroundColor Cyan

# Start worker
pnpm worker
