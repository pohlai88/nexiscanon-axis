// packages/domain/src/addons/reports/tokens.ts
// DI tokens for reports addon

import { token } from "../../container";
import type { ReportService } from "./manifest";

export const REPORTS_TOKENS = {
  ReportService: token<ReportService>("domain.reports.ReportService"),
} as const;
