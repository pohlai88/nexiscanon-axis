# EVI012 — Audit: approval.attempted + approval.succeeded

## Status

**✅ IMPLEMENTED + EVIDENCE CAPTURED (2026-01-19)**

## Deliverable

Audit events for approval attempts and successes (append-only, tenant-scoped).

**New events:**
- `approval.attempted` — logged at handler start (before guards)
- `approval.succeeded` — logged after DB approval write (truthful `approvedAt`)

**Existing blocked events (from EVI011):**
- `approval.blocked.evidence_required`
- `approval.blocked.evidence_stale`

## Implementation

### Files Changed

```diff
~ apps/web/app/api/requests/[id]/approve/route.ts   (add attempted + succeeded)
+ scripts/run-evi012.ts                             (evidence script)
~ package.json                                      (add "evi012" script)
```

### Integration Points

**`apps/web/app/api/requests/[id]/approve/route.ts`**

1. **Handler start:** Append `approval.attempted` with evidence policy
2. **Success path:** Append `approval.succeeded` after DB write, with truthful `approvedAt` and evidence check
3. **Blocked paths:** Continue appending `approval.blocked.*` events before throwing `KernelError` (EVI011)

### Correlation Invariant

All audit rows written during a single approval attempt share the same **kernel `traceId`** returned in the response envelope.

---

## Evidence (Captured 2026-01-19)

### Test Context

```
Tenant A: 7509c48a-31c5-47b6-8c06-b1394683a7d6
Actor A:  f3d87b9b-cb30-4fa4-9792-85468e905fe5
Request 1 (success):  5d2273e9-bff6-4dce-8e7d-4d4ab10d782f
Request 2 (blocked):  50e9a05c-e0c5-45f3-af9c-28dc0db0a734
Evidence File ID:     e8ce5b4b-0445-4d23-a93b-ed8a6f8dfeaf
```

---

### [A] Success → 200 + 2 Audit Rows (attempted + succeeded)

**Response:**

```json
Status: 200
{
  "data": {
    "requestId": "5d2273e9-bff6-4dce-8e7d-4d4ab10d782f",
    "status": "APPROVED",
    "approvedAt": "2026-01-19T22:26:59.790Z",
    "approvedBy": "f3d87b9b-cb30-4fa4-9792-85468e905fe5"
  },
  "meta": {
    "traceId": "424f2376-0b8c-405f-87e1-dcdb254ccaea"
  }
}
```

**Audit Rows:**

```json
[
  {
    "eventName": "approval.attempted",
    "traceId": "424f2376-0b8c-405f-87e1-dcdb254ccaea",
    "eventData": {
      "requestId": "5d2273e9-bff6-4dce-8e7d-4d4ab10d782f",
      "evidencePolicy": {
        "required": true,
        "ttlSeconds": null
      }
    },
    "createdAt": "2026-01-19T22:26:59.855Z"
  },
  {
    "eventName": "approval.succeeded",
    "traceId": "424f2376-0b8c-405f-87e1-dcdb254ccaea",
    "eventData": {
      "requestId": "5d2273e9-bff6-4dce-8e7d-4d4ab10d782f",
      "approvedBy": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
      "approvedAt": "2026-01-19T22:26:59.790Z",
      "evidenceCheck": {
        "hasEvidence": true,
        "isFresh": null,
        "ageSeconds": 0
      }
    },
    "createdAt": "2026-01-19T22:27:00.025Z"
  }
]
```

**Verification:**
- ✅ 200 APPROVED with canonical envelope
- ✅ 2 audit rows (`attempted` + `succeeded`)
- ✅ Same `traceId` in response and both audit rows
- ✅ `approvedAt` from audit matches response (truthful DB timestamp)

---

### [B] Blocked → 409 + 2 Audit Rows (attempted + blocked)

**Response:**

```json
Status: 409
{
  "error": {
    "code": "EVIDENCE_REQUIRED",
    "message": "Evidence is required for approval but none is attached",
    "traceId": "1006c19c-e204-4c5e-bb51-5119aaa5eba4",
    "details": {
      "evidenceRequired": true,
      "hasEvidence": false
    }
  }
}
```

**Audit Rows:**

```json
[
  {
    "eventName": "approval.attempted",
    "traceId": "1006c19c-e204-4c5e-bb51-5119aaa5eba4",
    "eventData": {
      "requestId": "50e9a05c-e0c5-45f3-af9c-28dc0db0a734",
      "evidencePolicy": {
        "required": true,
        "ttlSeconds": null
      }
    },
    "createdAt": "2026-01-19T22:27:00.262Z"
  },
  {
    "eventName": "approval.blocked.evidence_required",
    "traceId": "1006c19c-e204-4c5e-bb51-5119aaa5eba4",
    "eventData": {
      "requestId": "50e9a05c-e0c5-45f3-af9c-28dc0db0a734",
      "reason": "evidence_required",
      "details": {
        "evidenceRequired": true,
        "hasEvidence": false
      }
    },
    "createdAt": "2026-01-19T22:27:00.370Z"
  }
]
```

**Verification:**
- ✅ 409 EVIDENCE_REQUIRED with canonical envelope
- ✅ 2 audit rows (`attempted` + `blocked.evidence_required`)
- ✅ Same `traceId` in error and both audit rows
- ✅ Semantic error code preserved

---

### [C] Chronological Trail by Request ID

**Request 1 trail (success):**

```json
[
  {
    "eventName": "approval.attempted",
    "traceId": "424f2376-0b8c-405f-87e1-dcdb254ccaea",
    "requestId": "5d2273e9-bff6-4dce-8e7d-4d4ab10d782f",
    "createdAt": "2026-01-19T22:26:59.855Z"
  },
  {
    "eventName": "approval.succeeded",
    "traceId": "424f2376-0b8c-405f-87e1-dcdb254ccaea",
    "requestId": "5d2273e9-bff6-4dce-8e7d-4d4ab10d782f",
    "createdAt": "2026-01-19T22:27:00.025Z"
  }
]
```

**Request 2 trail (blocked):**

```json
[
  {
    "eventName": "approval.attempted",
    "traceId": "1006c19c-e204-4c5e-bb51-5119aaa5eba4",
    "requestId": "50e9a05c-e0c5-45f3-af9c-28dc0db0a734",
    "createdAt": "2026-01-19T22:27:00.262Z"
  },
  {
    "eventName": "approval.blocked.evidence_required",
    "traceId": "1006c19c-e204-4c5e-bb51-5119aaa5eba4",
    "requestId": "50e9a05c-e0c5-45f3-af9c-28dc0db0a734",
    "createdAt": "2026-01-19T22:27:00.370Z"
  }
]
```

**Verification:**
- ✅ Query by `requestId` returns chronological event sequences
- ✅ Success trail: `attempted → succeeded`
- ✅ Blocked trail: `attempted → blocked.*`
- ✅ Events ordered by `createdAt` (append-only)

---

## Acceptance Criteria (Pass ✅)

- ✅ Every approve call writes exactly **one** `approval.attempted`
- ✅ A success writes exactly **one** `approval.succeeded`
- ✅ A block writes exactly **one** blocked event (EVI011)
- ✅ For each attempt: **response traceId == audit traceId**
- ✅ Query by `requestId` returns chronological sequence with correct event names
- ✅ `approval.succeeded` contains truthful `approvedAt` from DB write
- ✅ No duplicate events per attempt

---

## What This Enables

**Full decision trail for compliance and debugging:**

1. **Audit queries by `requestId`** return complete history:
   - `attempted → succeeded` (approval granted)
   - `attempted → blocked.evidence_required` (evidence missing)
   - `attempted → blocked.evidence_stale` (evidence expired)

2. **Correlation via `traceId`** across:
   - API response envelope
   - Audit log entries
   - Application logs (structured logging)

3. **Operational insight:**
   - Track approval success rates
   - Identify policy violations
   - Debug workflow issues

---

## Next Steps (Optional)

- **EVI013:** Template-driven evidence policy (move `evidenceRequiredForApproval` + `evidenceTtlSeconds` to template defaults)
- **EVI014:** Evidence policy UI surface (show "expires in", disable approve button with reason)
- **Query/Analytics:** Build aggregation queries over audit trail (approval rates, blocked reasons, etc.)
