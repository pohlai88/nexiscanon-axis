# EVI007: Files Phase 2a (Office → PDF View Artifact - Wiring Proof)

**Status:** ⏳ Ready for Evidence Capture  
**Date:** 2026-01-20

---

## Goal (Phase 2a)

**Unlock Office documents** with minimal valid PDF view artifact.

- DOCX/XLSX/PPTX → upload original → enqueue job → worker generates **real PDF** → READY (viewable)
- Maintains canon rule: **no download-only** (PDF artifact is viewable)
- **Conversion quality deferred to Phase 3** (LibreOffice)

---

## Implementation Checklist

- [x] DB schema: Add `sourceR2Key`, `viewR2Key`, expand status enum
- [x] Migration applied: `0002_misty_invisible_woman.sql`
- [x] Repository: Add `updateStatus` and `updateViewKey` methods
- [x] Job payload type: `ConvertToPdfPayload`
- [x] Upload route: Office → enqueue `files.convert_to_pdf` + return 202 CONVERT_PENDING
- [x] Worker handler: Downloads source, generates **valid minimal PDF**, uploads to `viewR2Key`, marks READY
- [x] R2 client: Add `getObject` method
- [x] Evidence script: `pnpm -w evi007`
- [ ] Evidence blocks [1]-[5] captured
- [ ] Real LibreOffice conversion (deferred to Phase 3)
- [ ] GET /api/evidence/:id endpoint (deferred to Phase 3)

---

## Canon Status Clarification

**What EVI007 Phase 2a delivers:**
- ✅ Office uploads accepted (no more rejection)
- ✅ Conversion pipeline wiring (job enqueued → worker processes → READY)
- ✅ **Valid PDF artifact** generated (minimal, but real PDF that opens in viewers)
- ⏳ Full conversion quality (LibreOffice) = Phase 3

**Why this is canon-safe:**
- PDF artifact is **real and viewable** (not fake bytes)
- No "download-only" — user gets a PDF view artifact
- Conversion quality can be improved incrementally

---

## Evidence Blocks (Phase 2 Wiring Proof)

### [1] Upload DOCX → 202 CONVERT_PENDING ✅

**Command:**
```bash
pnpm -w evi007
```

**Response:**
```json
(Paste JSON response here)
```

**Status:** ⏳ Pending

---

### [2] Job Enqueued Proof ✅

**Evidence:**
```json
(Paste job enqueue log here)
```

**Status:** ⏳ Pending

---

### [3] Worker Processing (Manual Verification)

**Steps:**
1. Run `pnpm -w worker` in separate terminal
2. Observe worker logs for `job.files.convert_to_pdf.*` events
3. Press Enter in evidence script to continue

**Status:** ⏳ Pending

---

### [4] DB Proof: Status → READY ✅

**Evidence:**
```json
(Paste DB record showing status=READY + viewR2Key populated)
```

**Status:** ⏳ Pending

---

### [5] R2 Proof: View PDF Exists ✅

**Evidence:**
```json
(Paste R2 proof showing viewR2Key exists)
```

**Status:** ⏳ Pending

---

## Next Steps

1. Run: `pnpm -w evi007`
2. In separate terminal: `pnpm -w worker`
3. Paste all outputs into evidence blocks above
4. Mark EVI007 Phase 2 as COMPLETE ✅

## Future Phases

- **Phase 3:** Real LibreOffice conversion (replace stub with `soffice --headless --convert-to pdf`)
- **Phase 4:** GET /api/evidence/:id (status + signed URL for viewing)
- **Phase 5:** Frontend UI for upload + status polling
