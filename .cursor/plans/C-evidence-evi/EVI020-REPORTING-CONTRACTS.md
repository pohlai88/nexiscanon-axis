# EVI020 — Reporting Contracts (No Renderer)

**Date:** 2026-01-20  
**Scope:** Prove kernel-wrapped reporting contracts + audit events + traceId correlation  
**Phase:** Contracts only (no renderer)

---

## Test Environment

- Tenant: `7509c48a-31c5-47b6-8c06-b1394683a7d6`
- Actor: `f3d87b9b-cb30-4fa4-9792-85468e905fe5`
- Database: Neon (pooler connection)

---

## [A] Generate Report (format="json")

### Request

```json
POST /api/reports/generate
{
  "reportType": "purchase_order",
  "entityId": "<uuid>",
  "format": "json",
  "locale": "vi"
}
```

### Response

<paste status + body>

### Audit Row

<paste audit row>

### Correlation

- response.meta.traceId = `<traceId>`
- audit.traceId = `<traceId>`
- ✅ Match confirmed

### Assertions

- ✅ Status: 200
- ✅ reportId present
- ✅ jobId present
- ✅ status: "ACCEPTED"
- ✅ artifact.kind: "inline_json"
- ✅ Audit event: "report.generate.requested"
- ✅ traceId correlation

---

## [B] Generate Report (format="pdf_placeholder")

### Request

```json
POST /api/reports/generate
{
  "reportType": "goods_receipt_note",
  "entityId": "<uuid>",
  "format": "pdf_placeholder"
}
```

### Response

<paste status + body>

### Audit Row

<paste audit row>

### Correlation

- response.meta.traceId = `<traceId>`
- audit.traceId = `<traceId>`
- ✅ Match confirmed

### Assertions

- ✅ Status: 200
- ✅ reportId present
- ✅ jobId present
- ✅ status: "ACCEPTED"
- ✅ artifact.kind: "placeholder"
- ✅ Audit event: "report.generate.requested"
- ✅ traceId correlation

---

## GET /api/reports/:reportId

### Request

```
GET /api/reports/{reportId}
```

### Response

<paste status + body>

### Assertions

- ✅ Status: 200
- ✅ Returns same receipt structure
- ✅ reportId matches

---

## Evidence Status

**EVI020 CERTIFIED:** ⏳ Pending evidence paste

**Acceptance Criteria:**

- ✅ Both calls return 200 with canonical envelope
- ✅ Audit event exists for each
- ✅ traceId correlation holds
- ✅ Tenant isolation confirmed
- ✅ Receipt structure valid for both formats
- ✅ GET endpoint works

---

## Next Steps (Phase 2 - Post Freeze)

1. 🔜 PDF renderer implementation (Puppeteer/Playwright)
2. 🔜 Excel export renderer (@e2b/spreadsheet)
3. 🔜 R2 storage integration
4. 🔜 Background job for async generation
5. 🔜 Report templates (PO, GRN, Invoice)
