# EVI003 Trace Stitch - Execution Instructions

## Critical Fix Applied (2026-01-20)

**Issue:** `instrumentation.ts` wasn't passing `OTEL_EXPORTER_OTLP_HEADERS` to exporter
**Fix:** Added header parsing and passing to `OTLPTraceExporter`

```diff
apps/web/instrumentation.ts
+ Parse OTEL_EXPORTER_OTLP_HEADERS from env
+ Pass headers to OTLPTraceExporter({ url, headers })
```

## Security Notice

**BEFORE PROCEEDING:**
1. Rotate Grafana Cloud token (exposed in env.localCopy)
2. Rotate GlitchTip DSN if considered compromised
3. Update env.localCopy with new credentials
4. Verify env.localCopy is in .gitignore

## Execution Steps

### 1. Kill existing dev server

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

### 2. Start server with OTEL enabled

```powershell
.\scripts\start-with-otel.ps1
```

**Expected output:**
```
Loading environment from env.localCopy...
  OTEL_EXPORTER_OTLP_ENDPOINT = https://otlp-gateway-prod-ap-southeast-1...
  SENTRY_DSN = https://e8d9cea2a88548c8ac82c07a74b2d3e3@app...
  
Starting dev server with observability enabled...
...
[OTel] Tracing initialized: https://otlp-gateway-prod-ap-southeast-1.grafana.net/otlp
[Sentry] Error tracking initialized (GlitchTip DSN)
```

### 3. Generate Success Request

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID" = "11fd9cff-a017-4708-a2f6-3575ba4827d5"
    "Authorization" = "Bearer dev"
    "X-Actor-ID" = "550e8400-e29b-41d4-a716-446655440000"
}
$body = '{"title":"EVI003 Trace Test","description":"Testing trace stitch","priority":"high"}'
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/requests" -Method POST -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

**Capture:**
- Save full JSON response
- Note the `meta.traceId` value

### 4. Generate Error Request

Use the request ID from step 3:

```powershell
curl.exe -X POST "http://localhost:3000/api/requests/<REQUEST_ID>/approve" `
  -H "Content-Type: application/json" `
  -H "X-Tenant-ID: different-tenant-00000000-0000-0000-0000-000000000000" `
  -H "Authorization: Bearer dev" `
  -H "X-Actor-ID: 550e8400-e29b-41d4-a716-446655440000" `
  -d "{}" -i 2>&1 | Select-String -Pattern "."
```

**Capture:**
- Save full response including error JSON
- Note the `error.traceId` value

### 5. Verify Traces in Grafana Cloud

For EACH traceId captured:

1. Go to Grafana Cloud → **Explore**
2. Select **Tempo** datasource
3. Query by **Trace ID**: paste the traceId
4. Take screenshot showing:
   - Trace ID in search bar
   - Trace spans displayed
   - Service name: `nexuscanon-axis-web`

### 6. Verify Errors in GlitchTip

For the error traceId:

1. Go to GlitchTip → Issues
2. Find the error event
3. Verify `axis.trace_id` tag matches the traceId

## Evidence Required for EVI003 Completion

Paste in order:

1. **Success response JSON** (with meta.traceId)
2. **Error response JSON** (with error.traceId)
3. **Grafana screenshot/text** showing trace exists for at least one traceId

## Troubleshooting

**No traces in Grafana?**
- Check server logs for "[OTel] Tracing initialized"
- Verify OTEL_EXPORTER_OTLP_HEADERS is set correctly
- Check Grafana Cloud for authentication errors

**No errors in GlitchTip?**
- Check server logs for "[Sentry] Error tracking initialized"
- Verify SENTRY_DSN is set correctly
- Check GlitchTip project settings

**Server won't start?**
- Check env.localCopy exists and has valid values
- Try manual env var setting in PowerShell before running pnpm
