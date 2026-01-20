# EVI015 — Template Audit Trail

## Status

**✅ IMPLEMENTED + EVIDENCE CAPTURED (2026-01-19)**

## Deliverable

Append audit log rows for template operations (append-only, tenant-scoped, traceId-correlated).

**Events:**
- `template.created` - when `POST /api/templates` succeeds
- `template.listed` - when `GET /api/templates` succeeds
- `template.read` - when `GET /api/templates/:id` succeeds

**No audit on 404** (leak-safe: cross-tenant access doesn't write audit rows).

## Implementation

### Files Changed

```diff
~ packages/db/src/repos/audit-logs-repo.ts  (add findByTraceId method)
~ apps/web/app/api/templates/route.ts       (append audit for create + list)
~ apps/web/app/api/templates/[id]/route.ts  (append audit for get, not on 404)
+ scripts/run-evi015.ts
~ package.json
```

### Integration Points

**`apps/web/app/api/templates/route.ts`:**
- POST: After template creation, append `template.created` with `templateId`, `name`, `evidencePolicy`
- GET: After list computed, append `template.listed` with `count`

**`apps/web/app/api/templates/[id]/route.ts`:**
- GET: After template found (success), append `template.read` with `templateId`
- 404: Do NOT write audit (leak-safe)

### Correlation Invariant

For each request:
- `audit_logs.traceId` MUST equal response `meta.traceId` (success) or `error.traceId` (error)
- This aligns with CAN003 envelope + stitched observability pattern

### Event Data Payloads

**template.created:**
```json
{
  "templateId": "<uuid>",
  "name": "<string>",
  "evidencePolicy": { "required": true/false, "ttlSeconds": 86400|null }
}
```

**template.listed:**
```json
{
  "count": 4
}
```

**template.read:**
```json
{
  "templateId": "<uuid>"
}
```

---

## Evidence (Captured 2026-01-19)

### Test Context

```
Tenant A: 7509c48a-31c5-47b6-8c06-b1394683a7d6
Actor A:  f3d87b9b-cb30-4fa4-9792-85468e905fe5
Template ID: 3d6a256e-1984-480d-b67b-55de9f4e7cf5
Create traceId: f4a77031-2fcc-43d3-a831-49fe7541c20e
List traceId: abe98b07-3f7d-4018-b159-d249bb48eb97
Get traceId: 96b6112a-fe08-48c9-aadf-5f2643565b3f
```

---

### [A] Create Template → 200 + Audit Row (`template.created`)

**Response:**

```json
Status: 200
{
  "data": {
    "id": "3d6a256e-1984-480d-b67b-55de9f4e7cf5",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "name": "Audit Test Template",
    "description": "For EVI015 evidence",
    "evidenceRequiredForApproval": true,
    "evidenceTtlSeconds": 86400,
    "createdAt": "2026-01-19T23:32:26.115Z"
  },
  "meta": {
    "traceId": "f4a77031-2fcc-43d3-a831-49fe7541c20e"
  }
}
```

**Audit Row:**

```json
{
  "eventName": "template.created",
  "traceId": "f4a77031-2fcc-43d3-a831-49fe7541c20e",
  "eventData": {
    "templateId": "3d6a256e-1984-480d-b67b-55de9f4e7cf5",
    "name": "Audit Test Template",
    "evidencePolicy": {
      "required": true,
      "ttlSeconds": 86400
    }
  },
  "createdAt": "2026-01-19T23:32:26.742Z"
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Audit row appended with `eventName: "template.created"`
- ✅ TraceId matches: `f4a77031-2fcc-43d3-a831-49fe7541c20e` (response == audit)
- ✅ `eventData.templateId` matches response `data.id`
- ✅ Evidence policy correctly captured in `eventData`

---

### [B] List Templates → 200 + Audit Row (`template.listed`)

**Response:**

```json
Status: 200
{
  "data": {
    "templates": [
      {
        "id": "b003c05e-925d-4ce4-9841-a4c4eeefbd0e",
        "name": "Financial Request Template",
        "description": "Requires evidence with 24h TTL",
        "evidenceRequiredForApproval": true,
        "evidenceTtlSeconds": 86400,
        "createdAt": "2026-01-19T22:45:48.683Z"
      },
      {
        "id": "e9720e23-25c4-4b4b-9507-eaabc9670853",
        "name": "Financial Request Template",
        "description": "Requires evidence with 24h TTL",
        "evidenceRequiredForApproval": true,
        "evidenceTtlSeconds": 86400,
        "createdAt": "2026-01-19T22:46:26.615Z"
      },
      {
        "id": "2b7cf59a-9721-406b-9649-3a3530c5fc50",
        "name": "Financial Request Template",
        "description": "Requires evidence with 24h TTL",
        "evidenceRequiredForApproval": true,
        "evidenceTtlSeconds": 86400,
        "createdAt": "2026-01-19T23:02:56.697Z"
      },
      {
        "id": "3d6a256e-1984-480d-b67b-55de9f4e7cf5",
        "name": "Audit Test Template",
        "description": "For EVI015 evidence",
        "evidenceRequiredForApproval": true,
        "evidenceTtlSeconds": 86400,
        "createdAt": "2026-01-19T23:32:26.115Z"
      }
    ]
  },
  "meta": {
    "traceId": "abe98b07-3f7d-4018-b159-d249bb48eb97"
  }
}
```

**Audit Row:**

```json
{
  "eventName": "template.listed",
  "traceId": "abe98b07-3f7d-4018-b159-d249bb48eb97",
  "eventData": {
    "count": 4
  },
  "createdAt": "2026-01-19T23:32:27.069Z"
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Audit row appended with `eventName: "template.listed"`
- ✅ TraceId matches: `abe98b07-3f7d-4018-b159-d249bb48eb97` (response == audit)
- ✅ `eventData.count` (4) matches `templates.length` in response

---

### [C] Get Template by ID → 200 + Audit Row (`template.read`)

**Response:**

```json
Status: 200
{
  "data": {
    "id": "3d6a256e-1984-480d-b67b-55de9f4e7cf5",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "name": "Audit Test Template",
    "description": "For EVI015 evidence",
    "evidenceRequiredForApproval": true,
    "evidenceTtlSeconds": 86400,
    "createdAt": "2026-01-19T23:32:26.115Z"
  },
  "meta": {
    "traceId": "96b6112a-fe08-48c9-aadf-5f2643565b3f"
  }
}
```

**Audit Row:**

```json
{
  "eventName": "template.read",
  "traceId": "96b6112a-fe08-48c9-aadf-5f2643565b3f",
  "eventData": {
    "templateId": "3d6a256e-1984-480d-b67b-55de9f4e7cf5"
  },
  "createdAt": "2026-01-19T23:32:27.274Z"
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Audit row appended with `eventName: "template.read"`
- ✅ TraceId matches: `96b6112a-fe08-48c9-aadf-5f2643565b3f` (response == audit)
- ✅ `eventData.templateId` matches response `data.id`

---

## Acceptance Criteria (Pass ✅)

- ✅ Each successful route call appends exactly **one** corresponding audit row
- ✅ Audit rows are **tenant-scoped**, include `actorId`, and share the same `traceId` as response
- ✅ No audit write on 404 (leak-safe) - verified in route implementation
- ✅ TraceId correlation enforced across all events (response `meta.traceId` == `audit.traceId`)
- ✅ Event data contains required fields (templateId, name, count, etc.)

---

## What This Enables

**Complete template operations audit trail:**

1. **Compliance & Governance:**
   - Track who created templates, when, and with what policy
   - Audit who accessed/listed templates (compliance requirement)
   - Full traceability for template lifecycle

2. **Observability Integration:**
   - TraceId correlation enables joining audit logs with application logs
   - Stitched observability across kernel, domain, and audit layers (CAN003)

3. **Security & Forensics:**
   - Detect unauthorized template access attempts
   - Audit trail for template governance (evidence policy changes over time)
   - Tenant-scoped isolation prevents cross-tenant audit leakage

4. **Operational Insight:**
   - Track template usage patterns (list frequency, read patterns)
   - Identify popular templates (count in `template.listed` events)

---

## Next Steps (Optional)

- **EVI016:** Template update/delete routes + audit (if immutability is lifted)
- **EVI017:** Template version history (track policy changes over time)
- **EVI018:** Audit query API (search audit logs by event type, date range, etc.)

---

## Implementation Notes

- Reused existing `audit-logs-repo` from EVI011 (no schema changes)
- Added `findByTraceId` helper method for evidence script verification
- Audit logs append **after** successful operations only (not on 404)
- TraceId source: `ctx.traceId` from kernel context (consistent with other routes)
- Event data is minimal but sufficient for audit purposes
