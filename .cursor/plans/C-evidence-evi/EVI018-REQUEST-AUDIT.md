# EVI018 — Request Creation Audit Trail (Template Usage)

## Status

**✅ IMPLEMENTED + EVIDENCE CAPTURED (2026-01-20)**

## Deliverable

Append `request.created` audit event when `POST /api/requests` succeeds, capturing template usage and effective policy.

**Event:** `request.created`

**Event Payload:**
```json
{
  "requestId": "<uuid>",
  "requesterId": "<uuid>",
  "templateId": "<uuid|null>",
  "effectivePolicy": {
    "evidenceRequiredForApproval": true/false,
    "evidenceTtlSeconds": 3600|null
  },
  "source": "template"|"override"|"default"
}
```

## Implementation

### Files Changed

```diff
~ packages/domain/src/addons/requests/manifest.ts  (emit audit with full policy context)
~ packages/db/src/repos/requests-repo.ts           (return policy metadata for source determination)
~ packages/app-runtime/src/index.ts                (wire audit event listeners to DB)
+ scripts/run-evi018.ts
~ package.json
```

### Architecture

**Canon-compliant placement:** Audit emission happens in the **domain layer** (Requests service), not in routes.

**Event flow:**
1. Request service creates request via repository
2. Repository resolves policy (template inheritance + override) and returns `_policySource` metadata
3. Service emits `audit.request.created` domain event via `AuditService`
4. App-runtime wires event listener to persist to `audit_logs` table via `AuditLogsRepository`

**Source determination logic:**
- `"template"`: Policy inherited from template (no overrides)
- `"override"`: Policy overridden in request creation input
- `"default"`: No template, no overrides (system defaults apply)

### Integration Points

**`packages/domain/src/addons/requests/manifest.ts` (RequestService):**
- After `repo.create()` succeeds, emit audit event with full policy context
- Extract `_policySource` from repository response to determine source

**`packages/db/src/repos/requests-repo.ts` (RequestRepository):**
- Compute policy source during create (template/override/default)
- Return `_policySource` metadata (not persisted to DB, only for audit)
- Return policy fields in response for audit payload

**`packages/app-runtime/src/index.ts` (Composition Root):**
- Wire `audit.request.created` event listener on domain runtime startup
- Listener persists events to DB via `AuditLogsRepository`
- Handler is async to allow DB write to complete

### Correlation

- `audit.traceId` matches HTTP response `meta.traceId`
- `audit.tenantId` is tenant-scoped
- `audit.actorId` is the creator

---

## Evidence (Captured 2026-01-20)

### Test Context

```
Tenant A: 7509c48a-31c5-47b6-8c06-b1394683a7d6
Actor A:  f3d87b9b-cb30-4fa4-9792-85468e905fe5
Template ID: 91b4278b-b3e0-442f-9131-d1994368af4e
  - evidenceRequiredForApproval: true
  - evidenceTtlSeconds: 7200

Request A (template): 617629d7-b769-4db6-a94b-d966da4ca34f
Request B (override): 0dd74b44-63c5-408e-89ed-cacf36f90d3c
Request C (default): 0bd08745-64ec-402d-9942-575f4ac5e9d9

TraceId A: 6595ad24-13bb-4c52-bbe4-3f7414102a17
TraceId B: 3924d070-7f52-4bfc-a467-2689a9bdaa57
TraceId C: f02bf08d-baea-42d7-89b8-c6993e4e848f
```

---

### [A] Template Source → audit with `source:"template"`

**Response:**

```
Status: 200
{
  "data": {
    "id": "617629d7-b769-4db6-a94b-d966da4ca34f",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "status": "SUBMITTED",
    "createdAt": "2026-01-20T01:51:26.429Z"
  },
  "meta": {
    "traceId": "6595ad24-13bb-4c52-bbe4-3f7414102a17"
  }
}
```

**Audit Row:**

```json
{
  "eventName": "request.created",
  "traceId": "6595ad24-13bb-4c52-bbe4-3f7414102a17",
  "eventData": {
    "requestId": "617629d7-b769-4db6-a94b-d966da4ca34f",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "templateId": "91b4278b-b3e0-442f-9131-d1994368af4e",
    "effectivePolicy": {
      "evidenceRequiredForApproval": true,
      "evidenceTtlSeconds": 7200
    },
    "source": "template"
  },
  "createdAt": "2026-01-20T01:51:26.943Z"
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Audit row appended with `eventName: "request.created"`
- ✅ TraceId matches: `6595ad24-13bb-4c52-bbe4-3f7414102a17` (response == audit)
- ✅ **Source: "template"** (policy inherited from template)
- ✅ `templateId` matches template used (91b4278b-b3e0-442f-9131-d1994368af4e)
- ✅ `effectivePolicy` matches template policy (required=true, ttl=7200s)

---

### [B] Override Source → audit with `source:"override"`

**Response:**

```
Status: 200
{
  "data": {
    "id": "0dd74b44-63c5-408e-89ed-cacf36f90d3c",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "status": "SUBMITTED",
    "createdAt": "2026-01-20T01:51:27.200Z"
  },
  "meta": {
    "traceId": "3924d070-7f52-4bfc-a467-2689a9bdaa57"
  }
}
```

**Audit Row:**

```json
{
  "eventName": "request.created",
  "traceId": "3924d070-7f52-4bfc-a467-2689a9bdaa57",
  "eventData": {
    "requestId": "0dd74b44-63c5-408e-89ed-cacf36f90d3c",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "templateId": "91b4278b-b3e0-442f-9131-d1994368af4e",
    "effectivePolicy": {
      "evidenceRequiredForApproval": false,
      "evidenceTtlSeconds": 1800
    },
    "source": "override"
  },
  "createdAt": "2026-01-20T01:51:27.562Z"
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Audit row appended with `eventName: "request.created"`
- ✅ TraceId matches: `3924d070-7f52-4bfc-a467-2689a9bdaa57` (response == audit)
- ✅ **Source: "override"** (policy overridden in request creation input)
- ✅ `templateId` still present (template was referenced but overridden)
- ✅ `effectivePolicy` reflects overridden values (required=false, ttl=1800s)
  - Original template: required=true, ttl=7200s
  - Overridden: required=false, ttl=1800s ✅

---

### [C] Default Source → audit with `source:"default"`

**Response:**

```
Status: 200
{
  "data": {
    "id": "0bd08745-64ec-402d-9942-575f4ac5e9d9",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "status": "SUBMITTED",
    "createdAt": "2026-01-20T01:51:27.604Z"
  },
  "meta": {
    "traceId": "f02bf08d-baea-42d7-89b8-c6993e4e848f"
  }
}
```

**Audit Row:**

```json
{
  "eventName": "request.created",
  "traceId": "f02bf08d-baea-42d7-89b8-c6993e4e848f",
  "eventData": {
    "requestId": "0bd08745-64ec-402d-9942-575f4ac5e9d9",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "templateId": null,
    "effectivePolicy": {
      "evidenceRequiredForApproval": false,
      "evidenceTtlSeconds": null
    },
    "source": "default"
  },
  "createdAt": "2026-01-20T01:51:27.832Z"
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Audit row appended with `eventName: "request.created"`
- ✅ TraceId matches: `f02bf08d-baea-42d7-89b8-c6993e4e848f` (response == audit)
- ✅ **Source: "default"** (no template, no overrides, system defaults applied)
- ✅ `templateId: null` (no template referenced)
- ✅ `effectivePolicy` reflects system defaults (required=false, ttl=null)

---

## Acceptance Criteria (Pass ✅)

- ✅ Each successful request creation appends exactly **one** `request.created` audit row
- ✅ Audit rows are **tenant-scoped**, include `actorId`, and share the same `traceId` as response
- ✅ Event data contains **all** required fields:
  - `requestId`, `requesterId`, `templateId` (nullable), `effectivePolicy`, `source`
- ✅ Source determination is correct:
  - `"template"`: policy inherited, no overrides
  - `"override"`: policy overridden in input
  - `"default"`: no template, no overrides
- ✅ Audit emission happens **in domain layer** (Requests service), not in route
- ✅ TraceId correlation enforced (response `meta.traceId` == `audit.traceId`)

---

## What This Enables

**Complete request lifecycle audit trail:**

1. **Compliance & Governance:**
   - Track which template was used for each request (or if no template)
   - Audit who created requests and when
   - Track evidence policy decisions at request creation time
   - Full traceability for template usage patterns

2. **Observability Integration:**
   - TraceId correlation enables joining audit logs with application logs (CAN003)
   - Stitched observability across kernel, domain, and audit layers
   - Source field enables filtering by policy origin (template/override/default)

3. **Security & Forensics:**
   - Detect policy override patterns (who overrides templates and how often)
   - Audit trail for governance decisions (why was evidence required/not required)
   - Tenant-scoped isolation prevents cross-tenant audit leakage

4. **Operational Insight:**
   - Track template adoption (how many requests use templates vs defaults)
   - Identify override patterns (which templates are frequently overridden)
   - Measure policy compliance (are templates being used as intended)

---

## Integration with Existing Features

**Works with:**
- **EVI013 (Template Policy Inheritance):** Audit captures the inheritance decision
- **EVI016 (Template Validation):** Audit only fires after validation succeeds
- **EVI011-EVI012 (Approval Audit):** Now full lifecycle is audited (create → approve)
- **EVI015 (Template Audit):** Template usage audited from both sides (template CRUD + request creation)

**Completes audit story:**
- ✅ Template CRUD → audited (EVI015)
- ✅ Request creation → audited (EVI018) **NEW**
- ✅ Request approval → audited (EVI011-EVI012)

---

## Next Steps (Optional)

- **EVI019:** Request update/status change audit events
- **EVI020:** Evidence linking audit (when evidence is attached to request)
- **EVI021:** Audit query API (search audit logs by event type, date range, etc.)

---

## Implementation Notes

- Audit emission is **domain-layer concern**, not route concern (routes remain spec-only shells)
- Event listeners are wired in **app-runtime** (composition root), maintaining separation of concerns
- Async event handling with small delay in evidence script to ensure DB writes complete
- Source determination logic lives in **repository layer** where policy resolution happens
- `_policySource` is metadata (not persisted to DB), used only for audit enrichment
