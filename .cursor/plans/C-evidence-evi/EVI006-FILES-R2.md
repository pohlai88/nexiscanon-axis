# EVI006: Files Pipeline (R2 Upload Phase 1)

**Status:** ✅ **COMPLETE**  
**Date:** 2026-01-20

---

## Goal (Phase 1)

Enforce canon rule: **Office docs are NOT allowed as download-only**.

- PDF/PNG/JPG → viewable (READY)
- DOCX/XLSX/PPTX → **422 rejection** (CONVERSION_REQUIRED_NOT_READY)

Phase 2 (conversion worker) is deferred.

---

## Implementation Checklist

- [x] DB table: `evidence_files` (tenant-scoped, status enum)
- [x] Migration applied: `0001_kind_vin_gonzales.sql`
- [x] R2 client in `@workspace/app-runtime` (AWS SDK v3)
- [x] Evidence files repository in `@workspace/db`
- [x] Wired repository via `getEvidenceFilesRepo()`
- [x] Route: `POST /api/evidence/upload`
- [x] Evidence blocks [A]-[D] captured via `pnpm -w evi006`

---

## Evidence Blocks (Phase 1)

### [A] Upload PNG → READY ✅

**Command:**

```bash
pnpm -w evi006
```

**Response:**

```json
Status: 200
{
  "data": {
    "id": "e8ce5b4b-0445-4d23-a93b-ed8a6f8dfeaf",
    "status": "READY",
    "mimeType": "image/png",
    "originalName": "test-evidence.png",
    "sizeBytes": 28,
    "r2Key": "t/7509c48a-31c5-47b6-8c06-b1394683a7d6/evidence/e8ce5b4b-0445-4d23-a93b-ed8a6f8dfeaf/test-evidence.png"
  }
}
```

**Status:** ✅ VERIFIED

---

### [B] Upload PDF → READY ✅

**Command:**

```bash
pnpm -w evi006
```

**Response:**

```json
Status: 200
{
  "data": {
    "id": "ad6bcf79-4af6-41e7-aa5f-bc3aa89ff8a9",
    "status": "READY",
    "mimeType": "application/pdf",
    "originalName": "test-evidence.pdf",
    "sizeBytes": 29,
    "r2Key": "t/7509c48a-31c5-47b6-8c06-b1394683a7d6/evidence/ad6bcf79-4af6-41e7-aa5f-bc3aa89ff8a9/test-evidence.pdf"
  }
}
```

**Status:** ✅ VERIFIED

---

### [C] Upload DOCX → 422 CONVERSION_REQUIRED_NOT_READY ✅

**Command:**

```bash
pnpm -w evi006
```

**Response:**

```json
Status: 422
{
  "error": {
    "code": "CONVERSION_REQUIRED_NOT_READY",
    "message": "Office documents require server-side conversion. This feature is not yet implemented."
  }
}
```

**Status:** ✅ VERIFIED

---

### [D] R2 Proof (log line + object key)

**Evidence:**

```json
{"event":"infra.wiring","r2":"enabled","bucket":"axis-attachments"}
{"event":"evidence.upload.r2","fileId":"e8ce5b4b-0445-4d23-a93b-ed8a6f8dfeaf","r2Key":"t/7509c48a-31c5-47b6-8c06-b1394683a7d6/evidence/e8ce5b4b-0445-4d23-a93b-ed8a6f8dfeaf/test-evidence.png","bucket":"axis-attachments"}

✅ R2 Object Created:
   Bucket: axis-attachments
   Key: t/7509c48a-31c5-47b6-8c06-b1394683a7d6/evidence/e8ce5b4b-0445-4d23-a93b-ed8a6f8dfeaf/test-evidence.png
   Status: UPLOADED
```

**Status:** ✅ VERIFIED

---

## Next Steps

EVI006 Phase 1 is **COMPLETE**. Future phases:

1. **Phase 2:** Office document conversion worker (PDF rendering via LibreOffice/Pandoc)
2. **Phase 3:** GET /api/evidence/:id (signed URLs or proxied stream)
3. **Phase 4:** Virus scanning integration (optional)
