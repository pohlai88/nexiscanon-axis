/**
 * Cohort Analysis Service
 * 
 * Track customer cohorts over time to understand:
 * - Customer retention rates
 * - Lifetime value by cohort
 * - Repeat purchase behavior
 * - Cohort performance comparison
 * 
 * COHORT DEFINITION:
 * - Customers grouped by first purchase month
 * - Track subsequent purchases over time
 * - Calculate retention, revenue, frequency per cohort
 * 
 * METRICS:
 * - Retention Rate: % of cohort that purchased in month N
 * - Cumulative Revenue: Total revenue from cohort to date
 * - Average Order Value: Revenue / Orders per cohort
 * - Repeat Rate: % of cohort with 2+ orders
 */

import { sql, eq, and, gte, lte } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders } from "../../schema/sales/order";

// ============================================================================
// Types
// ============================================================================

export interface CohortDefinition {
  cohortId: string; // e.g., "2026-01"
  cohortLabel: string; // e.g., "January 2026"
  cohortYear: number;
  cohortMonth: number;
  customerCount: number;
  firstOrderDate: Date;
}

export interface CohortRetention {
  cohortId: string;
  cohortLabel: string;
  customerCount: number;
  // Retention by period (0 = first month, 1 = month 1, etc.)
  retentionByPeriod: {
    period: number;
    periodLabel: string; // e.g., "Month 0", "Month 1"
    customersRetained: number;
    retentionRate: number; // Percentage
    ordersPlaced: number;
    revenue: string;
    averageOrderValue: string;
  }[];
}

export interface CohortRevenue {
  cohortId: string;
  cohortLabel: string;
  customerCount: number;
  // Cumulative revenue by period
  revenueByPeriod: {
    period: number;
    periodLabel: string;
    revenue: string;
    cumulativeRevenue: string;
    averageRevenuePerCustomer: string;
  }[];
  totalRevenue: string;
  lifetimeValue: string; // Total revenue / customer count
}

export interface CohortComparison {
  cohorts: {
    cohortId: string;
    cohortLabel: string;
    customerCount: number;
    totalRevenue: string;
    averageLifetimeValue: string;
    retentionMonth3: number; // Retention at month 3 (%)
    retentionMonth6: number; // Retention at month 6 (%)
    repeatRate: number; // % with 2+ orders
  }[];
}

export interface CohortAnalysisOptions {
  tenantId: string;
  startDate?: Date; // Cohorts starting from this date
  endDate?: Date; // Cohorts ending at this date
  maxPeriods?: number; // Max periods to analyze (default: 12 months)
}

// ============================================================================
// Main Cohort Functions
// ============================================================================

/**
 * Gets cohort definitions (customers grouped by first purchase month).
 */
export async function getCohortDefinitions(
  db: Database,
  options: CohortAnalysisOptions
): Promise<CohortDefinition[]> {
  const { tenantId, startDate, endDate } = options;

  const filters = [eq(salesOrders.tenantId, tenantId)];
  if (startDate) {
    filters.push(gte(salesOrders.orderDate, startDate));
  }
  if (endDate) {
    filters.push(lte(salesOrders.orderDate, endDate));
  }

  // Get first order date for each customer
  const firstOrders = await db
    .select({
      customerId: salesOrders.customerId,
      firstOrderDate: sql<Date>`MIN(${salesOrders.orderDate})`,
      cohortYear: sql<number>`EXTRACT(YEAR FROM MIN(${salesOrders.orderDate}))::int`,
      cohortMonth: sql<number>`EXTRACT(MONTH FROM MIN(${salesOrders.orderDate}))::int`,
    })
    .from(salesOrders)
    .where(and(...filters))
    .groupBy(salesOrders.customerId);

  // Group by cohort (year-month)
  const cohortMap = new Map<string, { year: number; month: number; customers: string[]; firstDate: Date }>();

  for (const order of firstOrders) {
    // Skip orders without customer ID
    if (!order.customerId) continue;
    
    const cohortId = `${order.cohortYear}-${String(order.cohortMonth).padStart(2, "0")}`;
    const existing = cohortMap.get(cohortId) || {
      year: order.cohortYear,
      month: order.cohortMonth,
      customers: [],
      firstDate: order.firstOrderDate,
    };
    existing.customers.push(order.customerId);
    cohortMap.set(cohortId, existing);
  }

  // Build cohort definitions
  const cohorts: CohortDefinition[] = [];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (const [cohortId, data] of cohortMap.entries()) {
    cohorts.push({
      cohortId,
      cohortLabel: `${monthNames[data.month - 1]} ${data.year}`,
      cohortYear: data.year,
      cohortMonth: data.month,
      customerCount: data.customers.length,
      firstOrderDate: data.firstDate,
    });
  }

  // Sort by date (oldest first)
  cohorts.sort((a, b) => {
    if (a.cohortYear !== b.cohortYear) return a.cohortYear - b.cohortYear;
    return a.cohortMonth - b.cohortMonth;
  });

  return cohorts;
}

/**
 * Calculates cohort retention over time.
 */
export async function getCohortRetention(
  db: Database,
  options: CohortAnalysisOptions
): Promise<CohortRetention[]> {
  const { tenantId, maxPeriods = 12 } = options;

  const cohortDefs = await getCohortDefinitions(db, options);
  const retentionData: CohortRetention[] = [];

  for (const cohort of cohortDefs) {
    // Get first order date for each customer in this cohort
    const cohortCustomers = await db
      .select({
        customerId: salesOrders.customerId,
        firstOrderDate: sql<Date>`MIN(${salesOrders.orderDate})`,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.tenantId, tenantId),
          sql`EXTRACT(YEAR FROM ${salesOrders.orderDate}) = ${cohort.cohortYear}`,
          sql`EXTRACT(MONTH FROM ${salesOrders.orderDate}) = ${cohort.cohortMonth}`
        )
      )
      .groupBy(salesOrders.customerId);

    const customerIds = cohortCustomers.map((c) => c.customerId);
    const retentionByPeriod: CohortRetention["retentionByPeriod"] = [];

    // Analyze each period (month)
    for (let period = 0; period < maxPeriods; period++) {
      // Calculate period start/end dates
      const periodStart = new Date(
        cohort.cohortYear,
        cohort.cohortMonth - 1 + period,
        1
      );
      const periodEnd = new Date(
        cohort.cohortYear,
        cohort.cohortMonth + period,
        0
      ); // Last day of month

      // Check if period is in the future
      if (periodStart > new Date()) break;

      // Get orders in this period for cohort customers
      const periodOrders = await db
        .select({
          customerId: salesOrders.customerId,
          orderCount: sql<number>`COUNT(*)::int`,
          revenue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
        })
        .from(salesOrders)
        .where(
          and(
            eq(salesOrders.tenantId, tenantId),
            sql`${salesOrders.customerId} = ANY(${customerIds})`,
            gte(salesOrders.orderDate, periodStart),
            lte(salesOrders.orderDate, periodEnd)
          )
        )
        .groupBy(salesOrders.customerId);

      const customersRetained = periodOrders.length;
      const ordersPlaced = periodOrders.reduce((sum, o) => sum + o.orderCount, 0);
      const revenue = periodOrders.reduce(
        (sum, o) => sum + parseFloat(o.revenue),
        0
      );

      retentionByPeriod.push({
        period,
        periodLabel: `Month ${period}`,
        customersRetained,
        retentionRate: (customersRetained / cohort.customerCount) * 100,
        ordersPlaced,
        revenue: revenue.toFixed(4),
        averageOrderValue:
          ordersPlaced > 0 ? (revenue / ordersPlaced).toFixed(4) : "0",
      });
    }

    retentionData.push({
      cohortId: cohort.cohortId,
      cohortLabel: cohort.cohortLabel,
      customerCount: cohort.customerCount,
      retentionByPeriod,
    });
  }

  return retentionData;
}

/**
 * Calculates cumulative revenue by cohort over time.
 */
export async function getCohortRevenue(
  db: Database,
  options: CohortAnalysisOptions
): Promise<CohortRevenue[]> {
  const retentionData = await getCohortRetention(db, options);
  const revenueData: CohortRevenue[] = [];

  for (const retention of retentionData) {
    let cumulativeRevenue = 0;
    const revenueByPeriod: CohortRevenue["revenueByPeriod"] = [];

    for (const period of retention.retentionByPeriod) {
      const periodRevenue = parseFloat(period.revenue);
      cumulativeRevenue += periodRevenue;

      revenueByPeriod.push({
        period: period.period,
        periodLabel: period.periodLabel,
        revenue: period.revenue,
        cumulativeRevenue: cumulativeRevenue.toFixed(4),
        averageRevenuePerCustomer: (
          cumulativeRevenue / retention.customerCount
        ).toFixed(4),
      });
    }

    revenueData.push({
      cohortId: retention.cohortId,
      cohortLabel: retention.cohortLabel,
      customerCount: retention.customerCount,
      revenueByPeriod,
      totalRevenue: cumulativeRevenue.toFixed(4),
      lifetimeValue: (cumulativeRevenue / retention.customerCount).toFixed(4),
    });
  }

  return revenueData;
}

/**
 * Compares performance across cohorts.
 */
export async function getCohortComparison(
  db: Database,
  options: CohortAnalysisOptions
): Promise<CohortComparison> {
  const retentionData = await getCohortRetention(db, options);
  const revenueData = await getCohortRevenue(db, options);

  const cohorts = retentionData.map((retention) => {
    const revenue = revenueData.find((r) => r.cohortId === retention.cohortId);

    // Get retention at specific months
    const month3 = retention.retentionByPeriod.find((p) => p.period === 3);
    const month6 = retention.retentionByPeriod.find((p) => p.period === 6);

    // Calculate repeat rate (customers with 2+ orders)
    // This requires additional query
    const repeatRate = 0; // Placeholder

    return {
      cohortId: retention.cohortId,
      cohortLabel: retention.cohortLabel,
      customerCount: retention.customerCount,
      totalRevenue: revenue?.totalRevenue || "0",
      averageLifetimeValue: revenue?.lifetimeValue || "0",
      retentionMonth3: month3?.retentionRate || 0,
      retentionMonth6: month6?.retentionRate || 0,
      repeatRate,
    };
  });

  return { cohorts };
}

// ============================================================================
// Export Public API
// ============================================================================

export const CohortAnalysisService = {
  getCohortDefinitions,
  getCohortRetention,
  getCohortRevenue,
  getCohortComparison,
} as const;
