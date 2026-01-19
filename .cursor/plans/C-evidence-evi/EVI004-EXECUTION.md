# EVI004 Evidence Capture - Execution Commands

## Preconditions
- DATABASE_URL set to Neon PostgreSQL
- Dev server running on port 3000
- Worker not yet started

## Step 1: Start Worker (Terminal A)

```powershell
.\scripts\start-worker.ps1
```

**Alternative (if env vars already set):**
```bash
pnpm worker
```

**Expected output:**
```
[timestamp] INFO: Starting Graphile Worker...
[timestamp] INFO: { jobCount: 2 } Starting Graphile Worker
[timestamp] INFO: Worker ready
```

**Evidence to capture:**
- Startup log showing 2 job handlers registered

---

## Step 2: Enqueue system.ping (Terminal B)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID" = "11fd9cff-a017-4708-a2f6-3575ba4827d5"
    "Authorization" = "Bearer dev"
    "X-Actor-ID" = "550e8400-e29b-41d4-a716-446655440000"
}
$body = '{"jobName":"system.ping","payload":{}}'
Invoke-RestMethod -Uri "http://localhost:3000/api/jobs/enqueue" -Method POST -Headers $headers -Body $body | ConvertTo-Json
```

**Expected response:**
```json
{
  "data": {
    "jobId": "...",
    "jobName": "system.ping",
    "enqueuedAt": "2026-01-20T..."
  },
  "meta": {
    "traceId": "..."
  }
}
```

**Evidence to capture:**
- Full JSON response
- Note the jobId and traceId

---

## Step 3: Enqueue requests.reminder (Terminal B)

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID" = "11fd9cff-a017-4708-a2f6-3575ba4827d5"
    "Authorization" = "Bearer dev"
    "X-Actor-ID" = "550e8400-e29b-41d4-a716-446655440000"
}
$body = '{"jobName":"requests.reminder","payload":{"requestId":"efb75502-8fc4-4625-b401-1b03eea10322"}}'
Invoke-RestMethod -Uri "http://localhost:3000/api/jobs/enqueue" -Method POST -Headers $headers -Body $body | ConvertTo-Json
```

**Expected response:**
```json
{
  "data": {
    "jobId": "...",
    "jobName": "requests.reminder",
    "enqueuedAt": "2026-01-20T..."
  },
  "meta": {
    "traceId": "..."
  }
}
```

**Evidence to capture:**
- Full JSON response
- Note the jobId and traceId

---

## Step 4: Capture Worker Logs (Terminal A)

After enqueuing both jobs, capture logs from Terminal A showing:

**Expected logs:**
```
[timestamp] INFO: { jobName: "system.ping", tenantId: "...", traceId: "..." } Enqueueing job
[timestamp] INFO: { traceId: "...", tenantId: "...", actorId: "..." } system.ping executed

[timestamp] INFO: { jobName: "requests.reminder", tenantId: "...", traceId: "..." } Enqueueing job
[timestamp] INFO: { traceId: "...", tenantId: "...", actorId: "...", requestId: "..." } requests.reminder executed
```

**Evidence to capture:**
- Worker execution logs showing both jobs processed
- Confirm tenant context (tenantId, actorId) present in logs
- Confirm traceId correlation

---

## Step 5: DB Proof Query

Connect to Neon PostgreSQL and run:

```sql
SELECT 
  id,
  task_identifier,
  payload->>'tenantId' as tenant_id,
  payload->>'traceId' as trace_id,
  created_at,
  completed_at,
  last_error
FROM graphile_worker.jobs
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result:**
- At least 2 rows (system.ping + requests.reminder)
- Both should have completed_at timestamp
- last_error should be NULL
- tenant_id should match test tenant
- trace_id should match API response

**Alternative (if no psql):**
```sql
SELECT COUNT(*) as total_jobs FROM graphile_worker.jobs;
SELECT COUNT(*) as completed_jobs FROM graphile_worker.jobs WHERE completed_at IS NOT NULL;
```

**Evidence to capture:**
- Query result showing job rows
- Confirm jobs completed successfully

---

## Evidence Template (paste into EVI004-JOBS-QUEUE.md)

```markdown
## Evidence Captured - 2026-01-20

### 1. Worker Startup

\`\`\`
<paste worker startup log>
\`\`\`

### 2. Enqueue system.ping

**Response:**
\`\`\`json
<paste response JSON>
\`\`\`

### 3. Enqueue requests.reminder

**Response:**
\`\`\`json
<paste response JSON>
\`\`\`

### 4. Worker Execution Logs

\`\`\`
<paste worker logs showing both jobs executed>
\`\`\`

### 5. DB Proof

**Query:**
\`\`\`sql
SELECT id, task_identifier, completed_at, last_error 
FROM graphile_worker.jobs 
ORDER BY created_at DESC LIMIT 5;
\`\`\`

**Result:**
\`\`\`
<paste query result>
\`\`\`
```

---

## Completion Criteria

- [ ] Worker started and registered 2 handlers
- [ ] system.ping enqueued successfully (got jobId + traceId)
- [ ] requests.reminder enqueued successfully (got jobId + traceId)
- [ ] Worker logs show both jobs executed with tenant context
- [ ] DB query confirms jobs completed successfully
- [ ] All 5 evidence blocks pasted into EVI004-JOBS-QUEUE.md

When complete, **EVI004 = COMPLETE** ✅
