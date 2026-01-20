// packages/domain/src/addons/reports/tokens.ts
// DI tokens for reports addon

import { token } from "../../container";
import type { RequestContext } from "../../types";
import type { ReportGenerateInput, ReportReceipt } from "./types";

// Forward declare interface to break circular dependency
export interface ReportService {
  generate(ctx: RequestContext, input: ReportGenerateInput): Promise<ReportReceipt>;
  getStatus(ctx: RequestContext, reportId: string): Promise<ReportReceipt | null>;
}

export const REPORTS_TOKENS = {
  ReportService: token<ReportService>("domain.reports.ReportService"),
} as const;
