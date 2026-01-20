// packages/validation/src/reports.ts
// Report generation schemas (EVI020)

import { z } from "zod";

/** Report types enum */
export const ReportType = {
  PURCHASE_ORDER: "purchase_order",
  GOODS_RECEIPT_NOTE: "goods_receipt_note",
  INVOICE: "invoice",
} as const;

export type ReportTypeValue =
  (typeof ReportType)[keyof typeof ReportType];

/** Output format enum */
export const ReportFormat = {
  JSON: "json",
  PDF_PLACEHOLDER: "pdf_placeholder",
} as const;

export type ReportFormatValue =
  (typeof ReportFormat)[keyof typeof ReportFormat];

/** Report generation input schema */
export const reportGenerateInputSchema = z.object({
  reportType: z.enum([
    ReportType.PURCHASE_ORDER,
    ReportType.GOODS_RECEIPT_NOTE,
    ReportType.INVOICE,
  ]),
  entityId: z.string().uuid(),
  format: z.enum([ReportFormat.JSON, ReportFormat.PDF_PLACEHOLDER]),
  locale: z.string().optional(), // Accepted but not used (future-proof)
  timeZone: z.string().optional(), // Accepted but not used (future-proof)
  filters: z.record(z.unknown()).optional(),
});

export type ReportGenerateInput = z.infer<typeof reportGenerateInputSchema>;

/** Artifact types */
export const inlineJsonArtifactSchema = z.object({
  kind: z.literal("inline_json"),
  summary: z.record(z.unknown()),
});

export const placeholderArtifactSchema = z.object({
  kind: z.literal("placeholder"),
  note: z.string(),
});

export const reportArtifactSchema = z.union([
  inlineJsonArtifactSchema,
  placeholderArtifactSchema,
]);

export type ReportArtifact = z.infer<typeof reportArtifactSchema>;

/** Report generation output schema (receipt) */
export const reportGenerateOutputSchema = z.object({
  jobId: z.string().uuid(),
  reportId: z.string().uuid(),
  reportType: z.string(),
  entityId: z.string().uuid(),
  format: z.string(),
  status: z.literal("ACCEPTED"),
  artifact: reportArtifactSchema.nullable(),
  createdAt: z.string().datetime(),
});

export type ReportGenerateOutput = z.infer<typeof reportGenerateOutputSchema>;
