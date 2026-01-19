# ERP Phase 1 Smoke Test Instructions

## Prerequisites

1. **Start dev server:**
   ```bash
   pnpm dev:web
   ```

2. **Ensure database is migrated:**
   ```bash
   pnpm db:migrate
   ```

## Run Smoke Test

### Minimal (manual audit verification):
```bash
pnpm smoke:erp
```

### With Auth Token:
```bash
SMOKE_AUTH_TOKEN=your-token-here pnpm smoke:erp
```

### Full Automated (with DB verification):
```bash
SMOKE_BASE_URL=http://localhost:3000 \
SMOKE_AUTH_TOKEN=your-token-here \
SMOKE_TENANT_ID=test-smoke-tenant \
SMOKE_DB_URL=postgresql://user:pass@localhost:5432/dbname \
pnpm smoke:erp
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMOKE_BASE_URL` | No | `http://localhost:3000` | API base URL |
| `SMOKE_AUTH_TOKEN` | Conditional* | - | Bearer token for auth |
| `SMOKE_TENANT_ID` | No | `test-smoke-tenant` | Tenant ID for testing |
| `SMOKE_DB_URL` | No | - | PostgreSQL URL for auto audit verify |

\* Required if kernel routes have `auth: { mode: "required" }`

## Expected Output

### Success:
```
🔥 ERP Phase 1 Smoke Test

🔍 Checking configuration...

Base URL: http://localhost:3000
Tenant ID: test-smoke-tenant
Auth Token: ✅ Provided
DB URL: ✅ Provided (auto audit verify)

1️⃣  Creating UoM...
   ✅ Created UoM: <uuid>

2️⃣  Listing UoMs...
   ✅ Found UoM in list (3 total items)

3️⃣  Updating UoM...
   ✅ Updated UoM

4️⃣  Verifying audit trail...
   🔍 Querying database for audit events...
   ✅ Audit trail verified: 2 events with correct types and tenant_id

✅ Smoke test PASSED

Next steps:
1. Clean up test data if needed
2. DELETE /api/erp/base/uoms/<uuid> (archive endpoint available)
3. Phase 1 is complete - ready for Phase 2 (Sales DocType)
```

### Manual Audit Verification (no SMOKE_DB_URL):
```
4️⃣  Verifying audit trail...
   ℹ️  No SMOKE_DB_URL provided - manual verification required
   SQL:
   SELECT event_type, occurred_at, actor_user_id FROM erp_audit_events WHERE entity_id = '<uuid>' ORDER BY occurred_at;
   Expected: 2 rows (erp.base.uom.created, erp.base.uom.updated)
```

## What Gets Verified

1. ✅ **Create endpoint** (`POST /api/erp/base/uoms`)
2. ✅ **List endpoint** (`GET /api/erp/base/uoms`)
3. ✅ **Update endpoint** (`PATCH /api/erp/base/uoms/:id`)
4. ✅ **Audit trail** (2 events: created + updated)
5. ✅ **Tenant isolation** (correct tenant_id in audit)
6. ✅ **Atomic write pattern** (entity + audit together)

## Troubleshooting

### "Request failed: connect ECONNREFUSED"
- Server not running. Start with `pnpm dev:web`

### "Create failed: 401"
- Missing or invalid auth token
- Set `SMOKE_AUTH_TOKEN=<token>`

### "Create failed: 403"
- Tenant not authorized or missing
- Check `SMOKE_TENANT_ID` matches a valid tenant

### "Expected 2 audit rows, found 0"
- Atomic audit helpers not being used
- Check service implementation uses `atomicInsertWithAudit` / `atomicUpdateWithAudit`

### JSON parse error
- Server returning HTML error page (likely 500)
- Check server logs for actual error
- Response body snippet will be shown in error message

## After Smoke Test Passes

Phase 1 is complete. You can proceed to:

**Phase 2: Sales DocType**
- Quote/Order entities
- Sequence integration (auto document numbers)
- State machine (draft → confirmed → fulfilled)
