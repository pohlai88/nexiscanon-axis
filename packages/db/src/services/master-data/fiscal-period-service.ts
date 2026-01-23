/**
 * Fiscal Period Service (B03)
 *
 * AXIS Canonical Implementation:
 * - Fiscal year and period setup
 * - Period status management (future → open → soft-closed → hard-closed)
 * - Automatic period opening
 *
 * @see .cursor/ERP/A01-CANONICAL.md §2 (Money Pillar)
 * @see .cursor/ERP/B07-ACCOUNTING.md (Period Management)
 */

import type { Database } from "../..";
import type { FiscalPeriod } from "@axis/registry";

// ============================================================================
// Fiscal Period Types
// ============================================================================

export interface FiscalYearSetup {
  fiscalYear: number;
  startDate: string;
  endDate: string;
  periodCount: number; // 12 or 13 (with adjustment period)
}

export interface PeriodValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============================================================================
// Fiscal Year Creation
// ============================================================================

/**
 * Creates fiscal year with periods
 *
 * AXIS Flow:
 * 1. Validate year doesn't exist
 * 2. Calculate period dates
 * 3. Create periods (12 monthly + 1 adjustment)
 * 4. Set first period as "open", rest as "future"
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant
 * @param setup - Year setup
 * @returns Created periods
 */
export async function createFiscalYear(
  _db: Database,
  _tenantId: string,
  setup: FiscalYearSetup
): Promise<{
  success: boolean;
  periods?: FiscalPeriod[];
  errors?: string[];
}> {
  // Step 1: Validate year
  const validation = await validateFiscalYear(_db, _tenantId, setup);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Step 2: Calculate period dates
  const periods = calculatePeriodDates(setup);

  // Step 3: Create period records
  const fiscalPeriods: FiscalPeriod[] = periods.map((period, index) => ({
    id: crypto.randomUUID(),
    tenantId: _tenantId,
    fiscalYear: setup.fiscalYear,
    periodNumber: period.periodNumber,
    periodName: period.periodName,
    startDate: period.startDate,
    endDate: period.endDate,
    status: index === 0 ? "open" : "future", // First period open
    isAdjustmentPeriod: period.periodNumber === 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // TODO: Persist to database
  // await db.insert(fiscalPeriods).values(fiscalPeriods);

  return {
    success: true,
    periods: fiscalPeriods,
  };
}

/**
 * Validates fiscal year setup
 */
async function validateFiscalYear(
  _db: Database,
  _tenantId: string,
  setup: FiscalYearSetup
): Promise<PeriodValidation> {
  const errors: string[] = [];

  // Check year doesn't exist
  // TODO: Query database
  // const existing = await db.query.fiscalPeriods.findFirst({
  //   where: and(
  //     eq(fiscalPeriods.tenantId, tenantId),
  //     eq(fiscalPeriods.fiscalYear, setup.fiscalYear)
  //   ),
  // });
  // if (existing) {
  //   errors.push(`Fiscal year ${setup.fiscalYear} already exists`);
  // }

  // Validate dates
  const start = new Date(setup.startDate);
  const end = new Date(setup.endDate);

  if (end <= start) {
    errors.push("End date must be after start date");
  }

  // Validate period count
  if (setup.periodCount !== 12 && setup.periodCount !== 13) {
    errors.push("Period count must be 12 or 13");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates period dates for fiscal year
 */
function calculatePeriodDates(setup: FiscalYearSetup): Array<{
  periodNumber: number;
  periodName: string;
  startDate: string;
  endDate: string;
}> {
  const periods: Array<{
    periodNumber: number;
    periodName: string;
    startDate: string;
    endDate: string;
  }> = [];

  const start = new Date(setup.startDate);
  const end = new Date(setup.endDate);

  // Calculate days per period (excluding adjustment period)
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const regularPeriods = setup.periodCount === 13 ? 12 : 12;
  const daysPerPeriod = Math.floor(totalDays / regularPeriods);

  // Create regular periods
  for (let i = 0; i < regularPeriods; i++) {
    const periodStart = new Date(start);
    periodStart.setDate(periodStart.getDate() + (i * daysPerPeriod));

    const periodEnd = new Date(periodStart);
    if (i === regularPeriods - 1) {
      // Last period ends on fiscal year end
      periodEnd.setTime(end.getTime());
    } else {
      periodEnd.setDate(periodEnd.getDate() + daysPerPeriod - 1);
    }

    periods.push({
      periodNumber: i + 1,
      periodName: `Period ${i + 1} - ${setup.fiscalYear}`,
      startDate: periodStart.toISOString(),
      endDate: periodEnd.toISOString(),
    });
  }

  // Create adjustment period (if requested)
  if (setup.periodCount === 13) {
    periods.push({
      periodNumber: 13,
      periodName: `Adjustment Period - ${setup.fiscalYear}`,
      startDate: end.toISOString(),
      endDate: end.toISOString(), // Same day
    });
  }

  return periods;
}

// ============================================================================
// Period Status Management
// ============================================================================

/**
 * Opens next period (automatic progression)
 *
 * AXIS Flow:
 * 1. Find current open period
 * 2. Soft-close current period
 * 3. Open next period
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant
 * @returns Opened period
 */
export async function openNextPeriod(
  _db: Database,
  _tenantId: string,
  _context: {
    userId: string;
    timestamp: string;
  }
): Promise<{
  success: boolean;
  period?: FiscalPeriod;
  errors?: string[];
}> {
  // TODO: Find current open period
  // const currentPeriod = await db.query.fiscalPeriods.findFirst({
  //   where: and(
  //     eq(fiscalPeriods.tenantId, tenantId),
  //     eq(fiscalPeriods.status, "open")
  //   ),
  // });

  // if (!currentPeriod) {
  //   return {
  //     success: false,
  //     errors: ["No open period found"],
  //   };
  // }

  // TODO: Soft-close current period
  // await db.update(fiscalPeriods)
  //   .set({
  //     status: "soft_closed",
  //     softClosedAt: context.timestamp,
  //     softClosedBy: context.userId,
  //     updatedAt: context.timestamp,
  //   })
  //   .where(eq(fiscalPeriods.id, currentPeriod.id));

  // TODO: Open next period
  // const nextPeriod = await db.query.fiscalPeriods.findFirst({
  //   where: and(
  //     eq(fiscalPeriods.tenantId, tenantId),
  //     eq(fiscalPeriods.fiscalYear, currentPeriod.fiscalYear),
  //     eq(fiscalPeriods.periodNumber, currentPeriod.periodNumber + 1)
  //   ),
  // });

  // if (!nextPeriod) {
  //   return {
  //     success: false,
  //     errors: ["Next period not found (end of fiscal year?)"],
  //   };
  // }

  // await db.update(fiscalPeriods)
  //   .set({
  //     status: "open",
  //     updatedAt: context.timestamp,
  //   })
  //   .where(eq(fiscalPeriods.id, nextPeriod.id));

  return {
    success: true,
  };
}

/**
 * Gets current open period
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant
 * @returns Open period or null
 */
export async function getCurrentPeriod(
  _db: Database,
  _tenantId: string
): Promise<FiscalPeriod | null> {
  // TODO: Query database
  // return await db.query.fiscalPeriods.findFirst({
  //   where: and(
  //     eq(fiscalPeriods.tenantId, tenantId),
  //     eq(fiscalPeriods.status, "open")
  //   ),
  // });

  return null;
}

/**
 * Gets period by date
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant
 * @param date - Transaction date
 * @returns Period containing date
 */
export async function getPeriodByDate(
  _db: Database,
  _tenantId: string,
  _date: string
): Promise<FiscalPeriod | null> {
  // TODO: Query database
  // return await db.query.fiscalPeriods.findFirst({
  //   where: and(
  //     eq(fiscalPeriods.tenantId, tenantId),
  //     lte(fiscalPeriods.startDate, date),
  //     gte(fiscalPeriods.endDate, date)
  //   ),
  // });

  return null;
}

// ============================================================================
// Period Listing
// ============================================================================

/**
 * Lists all periods for fiscal year
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant
 * @param fiscalYear - Year to query
 * @returns Periods ordered by period number
 */
export async function listPeriods(
  _db: Database,
  _tenantId: string,
  _fiscalYear: number
): Promise<FiscalPeriod[]> {
  // TODO: Query database
  // return await db.query.fiscalPeriods.findMany({
  //   where: and(
  //     eq(fiscalPeriods.tenantId, tenantId),
  //     eq(fiscalPeriods.fiscalYear, fiscalYear)
  //   ),
  //   orderBy: [fiscalPeriods.periodNumber],
  // });

  return [];
}

// ============================================================================
// Export Public API
// ============================================================================

export const FiscalPeriodService = {
  createFiscalYear,
  openNextPeriod,
  getCurrentPeriod,
  getPeriodByDate,
  listPeriods,
} as const;
