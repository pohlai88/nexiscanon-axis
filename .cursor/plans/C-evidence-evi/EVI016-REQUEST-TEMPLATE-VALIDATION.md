# EVI016 — Request Creation Template Validation

## Status

**✅ IMPLEMENTED + EVIDENCE CAPTURED (2026-01-19)**

## Deliverable

Validate `templateId` (if provided) before creating request, with leak-safe 404.

**Guard:** If `templateId` provided in `POST /api/requests` body:
- Query `templatesRepo.findById({ tenantId, templateId })`
- If `null` → throw `KernelError(NOT_FOUND, "Template not found")`
- If found → proceed with existing inheritance logic (EVI013)

**Leak-safe invariant:**
- Cross-tenant `templateId` → 404 (doesn't reveal existence)
- Invalid `templateId` → 404 (same error as cross-tenant)

## Implementation

### Files Changed

```diff
~ apps/web/app/api/requests/route.ts  (add template validation before create)
+ scripts/run-evi016.ts
~ package.json
```

### Integration Point

**`apps/web/app/api/requests/route.ts` (POST handler):**

Before calling `requestService.create`:

```typescript
// EVI016: Validate templateId if provided (leak-safe 404)
if (body.templateId) {
  const templatesRepo = await getTemplatesRepo();
  const template = await templatesRepo.findById({
    tenantId: tenantId!,
    templateId: body.templateId,
  });

  if (!template) {
    // Leak-safe: same error for invalid vs cross-tenant
    throw new KernelError(ErrorCode.NOT_FOUND, "Template not found");
  }
}
```

Then proceed with existing request creation logic (unchanged).

### Leak-Safe Invariant Enforcement

**Same error response for:**
- Non-existent templateId (never existed)
- Cross-tenant templateId (exists but in different tenant)

Both return:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Template not found",
    "traceId": "..."
  }
}
```

This prevents information leakage about template existence across tenants.

---

## Evidence (Captured 2026-01-19)

### Test Context

```
Tenant A: 7509c48a-31c5-47b6-8c06-b1394683a7d6
Tenant B: 8bb0336b-e6f9-4c74-b225-6e478c2b5330
Actor A:  f3d87b9b-cb30-4fa4-9792-85468e905fe5

Template A (Tenant A): 075bd0d1-d702-4bd1-8a0c-c50a74287ad6
  - evidenceRequiredForApproval: true
  - evidenceTtlSeconds: 3600

Template B (Tenant B): 7ff710c0-8580-45a4-80bd-e906418835ab
  - evidenceRequiredForApproval: false
  - evidenceTtlSeconds: null

Request ID (from [A]): c7689955-8032-4fcc-83c9-d20d7e54be21
Fake Template ID (for [B]): d0199ae1-888b-4279-a2c7-8726c43d0882
```

---

### [A] Valid templateId (Same Tenant) → 200 + Inheritance

**Response:**

```
Status: 200
{
  "data": {
    "id": "c7689955-8032-4fcc-83c9-d20d7e54be21",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "status": "SUBMITTED",
    "createdAt": "2026-01-19T23:51:52.877Z"
  },
  "meta": {
    "traceId": "8bf05ead-59bb-4667-a89f-80e3c73df9c0"
  }
}
```

**DB Row (Inheritance Proof):**

```json
{
  "evidenceRequiredForApproval": true,
  "evidenceTtlSeconds": 3600
}
```

**Verification:**
- ✅ 200 response with canonical envelope (`meta.traceId`)
- ✅ Request created with ID: `c7689955-8032-4fcc-83c9-d20d7e54be21`
- ✅ **Policy inherited from Template A:**
  - `evidenceRequiredForApproval: true` (matches template)
  - `evidenceTtlSeconds: 3600` (matches template)
- ✅ Template validation passed (template exists in same tenant)

---

### [B] Invalid templateId (Non-Existent) → 404

**Response:**

```
Status: 404
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Template not found",
    "traceId": "6250b9a6-7ba6-4b0b-84bf-517c6d7683f5"
  }
}
```

**Verification:**
- ✅ 404 response
- ✅ `error.code: "NOT_FOUND"`
- ✅ `error.message: "Template not found"`
- ✅ Canonical envelope with `error.traceId`
- ✅ Request was **not** created (validation blocked it)

---

### [C] Cross-Tenant templateId → 404 (Leak-Safe)

**Response:**

```
Status: 404
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Template not found",
    "traceId": "c8cf4f85-639d-4f34-a15e-b121fd7265aa"
  }
}
```

**Verification:**
- ✅ 404 response (same status as [B])
- ✅ `error.code: "NOT_FOUND"` (same code as [B])
- ✅ `error.message: "Template not found"` (same message as [B])
- ✅ Canonical envelope with `error.traceId`
- ✅ **Leak-safe:** Error response is **identical** to [B], doesn't reveal that Template B exists
- ✅ Request was **not** created (validation blocked it)

---

## Acceptance Criteria (Pass ✅)

- ✅ Validation runs **only when `templateId` present** (doesn't block requests without templates)
- ✅ Both invalid and cross-tenant return **identical 404 envelope shape** (leak-safe)
- ✅ Valid templateId continues to inherit policy as before (EVI013 unchanged)
- ✅ Canonical envelopes with `traceId` on all paths (success + error)
- ✅ Request creation blocked before DB write when validation fails (no orphaned records)

---

## What This Fixes

**Correctness Issues:**

1. **Orphaned Requests:** Previously, invalid `templateId` would create a request that references a non-existent template
2. **Data Integrity:** Template inheritance (EVI013) could fail silently if template doesn't exist
3. **Cross-Tenant Leakage:** Without validation, error messages could reveal template existence across tenants

**Security Improvements:**

1. **Leak-Safe 404:** Cross-tenant template access returns same error as non-existent template
2. **Early Validation:** Guards prevent invalid data from entering the system (fail fast)
3. **Consistent Error Semantics:** `NOT_FOUND` is domain-stable and doesn't expose internal state

---

## Integration with Existing Features

**Works with:**
- **EVI013 (Template Policy Inheritance):** Validation happens before inheritance logic, ensuring template exists before attempting to read its policy
- **EVI014 (Template CRUD):** Uses `templatesRepo.findById` (tenant-scoped) from existing template repo
- **EVI010 (Evidence TTL):** Inherited policy values are guaranteed valid (template existed at request creation time)

**No changes needed for:**
- Requests without `templateId` (validation is skipped)
- Existing request approval logic (EVI010-EVI012)
- Existing audit trail (EVI011-EVI012)

---

## Next Steps (Optional)

- **EVI017:** Template immutability enforcement (reject update/delete routes)
- **EVI018:** Template versioning (track policy changes over time)
- **EVI019:** Request template binding audit (log which template was used)

---

## Implementation Notes

- Validation is **synchronous** and **blocking** (fails fast before any DB writes)
- Uses existing `getTemplatesRepo()` from `app-runtime` (no new dependencies)
- Tenant isolation enforced at repo layer (`findById` is tenant-scoped)
- Error message is **stable** and doesn't leak internal state (no "exists in different tenant" message)
- Follows canonical kernel error pattern (`KernelError` with `ErrorCode.NOT_FOUND`)
