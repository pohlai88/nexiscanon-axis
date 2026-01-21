# EVI013 — Template-Driven Evidence Policy Inheritance

## Status

**✅ IMPLEMENTED + EVIDENCE CAPTURED (2026-01-19)**

## Deliverable

Template-driven evidence policy inheritance: move `evidenceRequiredForApproval` + `evidenceTtlSeconds` from ad-hoc request-level to template defaults, with per-request override capability.

**Goal:** Make evidence policy a first-class template concern, inherited by requests at creation time.

## Canon Invariants

- **Approval guard remains request-level** (EVI010 unchanged)
- Templates only **seed defaults** at creation time
- Requests may override explicitly
- Backward compatible: existing requests unaffected
- No implicit mutation after creation (no "live template binding")

## Implementation

### Files Changed

```diff
+ packages/db/src/schema.ts                     (add request_templates table)
+ packages/db/drizzle/0005_brave_mongoose.sql   (migration)
~ packages/db/src/repos/requests-repo.ts        (template inheritance logic)
~ packages/domain/src/addons/requests/manifest.ts (extend RequestCreateInput)
~ packages/validation/src/api.ts                (extend input schema)
~ apps/web/app/api/requests/route.ts            (pass template + overrides to domain)
+ scripts/run-evi013.ts                         (evidence script)
~ package.json                                  ("evi013" script)
```

### Schema Changes

**`request_templates` table:**

```typescript
export const requestTemplates = pgTable('request_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull(),
  description: text('description'),

  // Evidence policy defaults (EVI013)
  evidenceRequiredForApproval: boolean('evidence_required_for_approval')
    .notNull()
    .default(false),
  evidenceTtlSeconds: integer('evidence_ttl_seconds'), // NULL = no TTL check

  ...timestamps,
});
```

### Domain Logic

**Request creation (`packages/db/src/repos/requests-repo.ts`):**

1. Load template (if `templateId` provided)
2. Compute effective policy with override precedence:

   ```typescript
   effectiveEvidenceRequired =
     override.evidenceRequiredForApproval ??
     template.evidenceRequiredForApproval ??
     false;

   effectiveEvidenceTtlSeconds =
     override.evidenceTtlSeconds ?? template.evidenceTtlSeconds ?? null;
   ```

3. Persist values onto the **request row** (source of truth for approval)
4. Never reference the template again

---

## Evidence (Captured 2026-01-19)

### Test Context

```
Tenant A: 7509c48a-31c5-47b6-8c06-b1394683a7d6
Actor A:  f3d87b9b-cb30-4fa4-9792-85468e905fe5
Template ID: e9720e23-25c4-4b4b-9507-eaabc9670853
  Policy: evidenceRequiredForApproval=true, evidenceTtlSeconds=86400
Request 1 (inherited): d6356aa9-6815-4f73-bb3f-efbb8914f1f1
Request 2 (overridden): d88a6aec-d34a-4a57-9c6e-d0aba7bc89cc
```

---

### [A] Template Inheritance (No Override)

**Request creation from template:**

```json
Status: 200
{
  "data": {
    "id": "d6356aa9-6815-4f73-bb3f-efbb8914f1f1",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "status": "SUBMITTED",
    "createdAt": "2026-01-19T22:46:26.498Z"
  },
  "meta": {
    "traceId": "504dfab6-aec9-4a09-aa31-cf950e0f2978"
  }
}
```

**DB row policy fields (inherited from template):**

```json
{
  "evidenceRequiredForApproval": true,
  "evidenceTtlSeconds": 86400
}
```

**Verification:**

- ✅ Request created from template (`templateId` provided)
- ✅ `evidenceRequiredForApproval` inherited: `true` (matches template)
- ✅ `evidenceTtlSeconds` inherited: `86400` (matches template)

---

### [B] Request Override

**Request creation with policy override:**

```json
Status: 200
{
  "data": {
    "id": "d88a6aec-d34a-4a57-9c6e-d0aba7bc89cc",
    "tenantId": "7509c48a-31c5-47b6-8c06-b1394683a7d6",
    "requesterId": "f3d87b9b-cb30-4fa4-9792-85468e905fe5",
    "status": "SUBMITTED",
    "createdAt": "2026-01-19T22:46:26.831Z"
  },
  "meta": {
    "traceId": "bfdeafb1-32f9-4da0-a4ed-16b131a44cc0"
  }
}
```

**DB row policy fields (override applied):**

```json
{
  "evidenceRequiredForApproval": false,
  "evidenceTtlSeconds": 86400
}
```

**Verification:**

- ✅ Request created from template with override (`evidenceRequiredForApproval: false`)
- ✅ `evidenceRequiredForApproval` reflects override: `false` (not template's `true`)
- ✅ `evidenceTtlSeconds` inherited: `86400` (override not provided, so inherited)

---

### [C] Approval Respects Inherited/Overridden Policy

**Attempting to approve req1 (inherited policy: `required=true`):**

```json
Status: 409
{
  "error": {
    "code": "EVIDENCE_REQUIRED",
    "message": "Evidence is required for approval but none is attached",
    "traceId": "ad4480e2-1de9-4ffa-918d-72e57108e02c",
    "details": {
      "evidenceRequired": true,
      "hasEvidence": false
    }
  }
}
```

**Attempting to approve req2 (overridden policy: `required=false`):**

```json
Status: 200
{
  "data": {
    "requestId": "d88a6aec-d34a-4a57-9c6e-d0aba7bc89cc",
    "status": "APPROVED",
    "approvedAt": "2026-01-19T22:46:27.658Z",
    "approvedBy": "f3d87b9b-cb30-4fa4-9792-85468e905fe5"
  },
  "meta": {
    "traceId": "a03efb1a-aaa4-4a99-ae9e-6b358df6f068"
  }
}
```

**Verification:**

- ✅ req1 (inherited `required=true`) → **409 EVIDENCE_REQUIRED** (blocked as expected)
- ✅ req2 (overridden `required=false`) → **200 APPROVED** (allowed as expected)
- ✅ EVI010 approval guards work unchanged with template-inherited policy

---

## Acceptance Criteria (Pass ✅)

- ✅ Requests created from templates inherit policy by default
- ✅ Per-request override still possible (and takes precedence)
- ✅ Existing approval guards (EVI010) work unchanged
- ✅ Template policy fields are nullable (backward compatible)
- ✅ No live template binding (policy copied at creation time)
- ✅ Overrides are opt-in (absence ≠ false, uses `??` coalescence)

---

## What This Enables

**Template-driven governance:**

1. **Organization-level policy enforcement:**
   - Create templates with evidence requirements (e.g., "Financial Request Template" requires evidence with 24h TTL)
   - All requests from that template inherit the policy automatically

2. **Flexibility with control:**
   - Templates provide sensible defaults
   - Individual requests can override when needed (e.g., urgent exception)
   - Overrides are explicit in request creation payload (auditability)

3. **Backward compatibility:**
   - Existing requests without templates continue to work (default `false / null`)
   - New requests without templates use defaults (no breaking changes)

---

## Next Steps (Optional)

- **EVI014:** Template UI (create/edit templates, assign to request types)
- **EVI015:** Template-level audit (track policy changes over time)
- **EVI016:** Evidence policy reporting (compliance dashboards, policy violations)

---

## Migration Summary

**Migration:** `0005_brave_mongoose.sql`

- Added `request_templates` table with evidence policy columns
- Backward compatible: no data backfill required
- Existing requests unaffected (policy remains at request level)
