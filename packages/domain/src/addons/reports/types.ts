// packages/domain/src/addons/reports/types.ts
// Shared types for reports addon (breaks circular dependency)

export interface ReportGenerateInput {
  reportType: string;
  entityId: string;
  format: string;
  locale?: string;
  timeZone?: string;
  filters?: Record<string, unknown>;
}

export interface ReportArtifact {
  kind: "inline_json" | "placeholder";
  summary?: Record<string, unknown>;
  note?: string;
}

export interface ReportReceipt {
  jobId: string;
  reportId: string;
  reportType: string;
  entityId: string;
  format: string;
  status: "ACCEPTED";
  artifact: ReportArtifact | null;
  createdAt: string;
}
