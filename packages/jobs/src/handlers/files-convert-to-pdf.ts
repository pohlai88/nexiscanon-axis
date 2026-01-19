// packages/jobs/src/handlers/files-convert-to-pdf.ts
// Worker handler for Office document → PDF conversion

import type { JobHandler, ConvertToPdfPayload } from "../types";
import { getLogger } from "@workspace/observability";

/**
 * Generate a minimal valid PDF (single page, simple text).
 * Good enough to open in any PDF viewer.
 * Phase 2a: Stub with real PDF artifact.
 * Phase 3: Replace with LibreOffice conversion.
 */
function minimalPdfBytes(text = "EVI007 stub PDF - Conversion pending"): Buffer {
  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 73 >>stream
BT /F1 24 Tf 72 720 Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000117 00000 n 
0000000286 00000 n 
0000000410 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
482
%%EOF`;
  return Buffer.from(pdf, "utf8");
}

/**
 * Converts office documents (docx/xlsx/pptx) to PDF.
 * Phase 2a: Generates minimal valid PDF (wiring proof).
 * Phase 3: Will use LibreOffice for real conversion.
 */
export const convertToPdfHandler: JobHandler<ConvertToPdfPayload> = async (
  envelope
) => {
  const { evidenceFileId } = envelope.payload;
  const { tenantId, traceId } = envelope;
  const log = getLogger();

  log.info({
    event: "job.files.convert_to_pdf.start",
    evidenceFileId,
    tenantId,
    traceId,
  });

  // Import runtime dependencies (avoid top-level imports for code splitting)
  const { getEvidenceFilesRepo, getR2Client } = await import("@workspace/app-runtime");

  const repo = await getEvidenceFilesRepo();
  const r2 = getR2Client();

  // 1. Fetch DB row (tenant scoped)
  const file = await repo.findById(evidenceFileId, tenantId);
  if (!file) {
    log.error({
      event: "job.files.convert_to_pdf.not_found",
      evidenceFileId,
      tenantId,
    });
    throw new Error(`Evidence file ${evidenceFileId} not found for tenant ${tenantId}`);
  }

  // 2. Must be CONVERT_PENDING with sourceR2Key
  if (file.status !== "CONVERT_PENDING") {
    log.warn({
      event: "job.files.convert_to_pdf.invalid_status",
      evidenceFileId,
      status: file.status,
    });
    return; // Already processed or failed
  }

  if (!file.sourceR2Key) {
    log.error({
      event: "job.files.convert_to_pdf.no_source",
      evidenceFileId,
    });
    await repo.updateStatus(evidenceFileId, tenantId, "CONVERT_FAILED");
    return;
  }

  try {
    // 3. Download source from R2
    log.info({
      event: "job.files.convert_to_pdf.downloading_source",
      evidenceFileId,
      sourceR2Key: file.sourceR2Key,
    });

    const sourceBuffer = await r2.getObject(file.sourceR2Key);

    // 4. Convert to PDF
    // Phase 2a: Generate minimal valid PDF (wiring proof)
    // Phase 3: Replace with LibreOffice conversion
    log.info({
      event: "job.files.convert_to_pdf.generating_pdf",
      evidenceFileId,
      originalName: file.originalName,
      sourceSize: sourceBuffer.length,
      conversionType: "minimal_stub",
    });

    const pdfBuffer = minimalPdfBytes(
      `Placeholder PDF for: ${file.originalName}\n\nOriginal file uploaded successfully.\nFull conversion pending LibreOffice integration.`
    );

    // 5. Upload PDF to R2 (viewR2Key)
    const viewR2Key = file.sourceR2Key.replace("/source/", "/view/").replace(/\.\w+$/, ".pdf");

    await r2.putObject({
      key: viewR2Key,
      body: pdfBuffer,
      contentType: "application/pdf",
    });

    log.info({
      event: "job.files.convert_to_pdf.uploaded_view",
      evidenceFileId,
      viewR2Key,
      pdfSize: pdfBuffer.length,
    });

    // 6. Update DB: status=READY, viewR2Key
    await repo.updateViewKey(evidenceFileId, tenantId, viewR2Key, "READY");

    log.info({
      event: "job.files.convert_to_pdf.success",
      evidenceFileId,
      tenantId,
      traceId,
      viewR2Key,
      conversionType: "minimal_stub",
    });
  } catch (error: any) {
    log.error({
      event: "job.files.convert_to_pdf.failed",
      evidenceFileId,
      error: error.message,
    });

    await repo.updateStatus(evidenceFileId, tenantId, "CONVERT_FAILED");
    throw error;
  }
};
