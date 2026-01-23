/**
 * Analytics Service
 * 
 * Advanced analytics and insights for customers and vendors.
 * 
 * FEATURES:
 * - Top customers by revenue
 * - Top vendors by spend
 * - Customer lifetime value (CLV)
 * - Vendor performance metrics
 * - Trend analysis (month-over-month, year-over-year)
 */

import { desc, eq, and, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders } from "../../schema/sales/order";
import { purchaseOrders } from "../../schema/purchase/order";
import { customers } from "../../schema/customer";
import { vendors } from "../../schema/vendor";

// ============================================================================
// Types
// ============================================================================

export interface TopCustomer {
  customerId: string;
  customerNumber: string;
  customerName: string;
  totalOrders: number;
  totalRevenue: string;
  averageOrderValue: string;
  lastOrderDate?: Date;
}

export interface TopVendor {
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  totalPurchaseOrders: number;
  totalSpend: string;
  averagePurchaseValue: string;
  lastPurchaseDate?: Date;
  isPreferred: boolean;
}

export interface CustomerLifetimeValue {
  customerId: string;
  customerName: string;
  lifetimeRevenue: string;
  lifetimeOrders: number;
  averageOrderValue: string;
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  daysSinceLastOrder?: number;
  customerSegment: "high_value" | "medium_value" | "low_value" | "at_risk";
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalOrders: number;
  totalRevenue: string;
  averageOrderValue: string;
}

// ============================================================================
// Customer Analytics
// ============================================================================

/**
 * Gets top customers by revenue.
 */
export async function getTopCustomersByRevenue(
  db: Database,
  tenantId: string,
  options: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<TopCustomer[]> {
  const { limit = 10, startDate, endDate } = options;

  // Build date filters
  const dateFilters = [];
  if (startDate) {
    dateFilters.push(gte(salesOrders.orderDate, startDate));
  }
  if (endDate) {
    dateFilters.push(lte(salesOrders.orderDate, endDate));
  }

  const results = await db
    .select({
      customerId: customers.id,
      customerNumber: customers.customerNumber,
      customerName: customers.customerName,
      totalOrders: sql<number>`COUNT(${salesOrders.id})::int`,
      totalRevenue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      averageOrderValue: sql<string>`COALESCE(AVG(${salesOrders.totalAmount}::numeric), 0)::text`,
      lastOrderDate: sql<Date>`MAX(${salesOrders.orderDate})`,
    })
    .from(customers)
    .innerJoin(
      salesOrders,
      and(
        eq(salesOrders.customerId, customers.id),
        eq(salesOrders.tenantId, tenantId),
        ...dateFilters
      )
    )
    .where(eq(customers.tenantId, tenantId))
    .groupBy(customers.id, customers.customerNumber, customers.customerName)
    .orderBy(desc(sql`SUM(${salesOrders.totalAmount}::numeric)`))
    .limit(limit);

  return results;
}

/**
 * Gets customer lifetime value analysis.
 */
export async function getCustomerLifetimeValue(
  db: Database,
  tenantId: string,
  customerId?: string
): Promise<CustomerLifetimeValue[]> {
  const filters = [eq(customers.tenantId, tenantId)];
  if (customerId) {
    filters.push(eq(customers.id, customerId));
  }

  const results = await db
    .select({
      customerId: customers.id,
      customerName: customers.customerName,
      lifetimeRevenue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      lifetimeOrders: sql<number>`COUNT(${salesOrders.id})::int`,
      averageOrderValue: sql<string>`COALESCE(AVG(${salesOrders.totalAmount}::numeric), 0)::text`,
      firstOrderDate: sql<Date>`MIN(${salesOrders.orderDate})`,
      lastOrderDate: sql<Date>`MAX(${salesOrders.orderDate})`,
      daysSinceLastOrder: sql<number>`EXTRACT(DAY FROM NOW() - MAX(${salesOrders.orderDate}))::int`,
    })
    .from(customers)
    .leftJoin(
      salesOrders,
      and(
        eq(salesOrders.customerId, customers.id),
        eq(salesOrders.tenantId, tenantId)
      )
    )
    .where(and(...filters))
    .groupBy(customers.id, customers.customerName);

  return results.map((row) => {
    const revenue = parseFloat(row.lifetimeRevenue);
    const orders = row.lifetimeOrders;
    const daysSince = row.daysSinceLastOrder || 0;

    // Segment customers
    let customerSegment: CustomerLifetimeValue["customerSegment"] = "low_value";
    if (revenue >= 10000) {
      customerSegment = "high_value";
    } else if (revenue >= 5000) {
      customerSegment = "medium_value";
    }

    // At-risk: No order in 90+ days but has ordered before
    if (daysSince > 90 && orders > 0) {
      customerSegment = "at_risk";
    }

    return {
      ...row,
      customerSegment,
    };
  });
}

/**
 * Gets monthly revenue trend for customers.
 */
export async function getCustomerRevenueTrend(
  db: Database,
  tenantId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<MonthlyTrend[]> {
  const { startDate, endDate } = options;

  const dateFilters = [eq(salesOrders.tenantId, tenantId)];
  if (startDate) {
    dateFilters.push(gte(salesOrders.orderDate, startDate));
  }
  if (endDate) {
    dateFilters.push(lte(salesOrders.orderDate, endDate));
  }

  const results = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${salesOrders.orderDate})::int`,
      month: sql<number>`EXTRACT(MONTH FROM ${salesOrders.orderDate})::int`,
      monthName: sql<string>`TO_CHAR(${salesOrders.orderDate}, 'Month')`,
      totalOrders: sql<number>`COUNT(*)::int`,
      totalRevenue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      averageOrderValue: sql<string>`COALESCE(AVG(${salesOrders.totalAmount}::numeric), 0)::text`,
    })
    .from(salesOrders)
    .where(and(...dateFilters))
    .groupBy(
      sql`EXTRACT(YEAR FROM ${salesOrders.orderDate})`,
      sql`EXTRACT(MONTH FROM ${salesOrders.orderDate})`,
      sql`TO_CHAR(${salesOrders.orderDate}, 'Month')`
    )
    .orderBy(sql`EXTRACT(YEAR FROM ${salesOrders.orderDate})`, sql`EXTRACT(MONTH FROM ${salesOrders.orderDate})`);

  return results.map((row) => ({
    ...row,
    monthName: row.monthName.trim(),
  }));
}

// ============================================================================
// Vendor Analytics
// ============================================================================

/**
 * Gets top vendors by spend.
 */
export async function getTopVendorsBySpend(
  db: Database,
  tenantId: string,
  options: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<TopVendor[]> {
  const { limit = 10, startDate, endDate } = options;

  const dateFilters = [];
  if (startDate) {
    dateFilters.push(gte(purchaseOrders.poDate, startDate));
  }
  if (endDate) {
    dateFilters.push(lte(purchaseOrders.poDate, endDate));
  }

  const results = await db
    .select({
      vendorId: vendors.id,
      vendorNumber: vendors.vendorNumber,
      vendorName: vendors.vendorName,
      totalPurchaseOrders: sql<number>`COUNT(${purchaseOrders.id})::int`,
      totalSpend: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)::text`,
      averagePurchaseValue: sql<string>`COALESCE(AVG(${purchaseOrders.totalAmount}::numeric), 0)::text`,
      lastPurchaseDate: sql<Date>`MAX(${purchaseOrders.poDate})`,
      isPreferred: vendors.isPreferred,
    })
    .from(vendors)
    .innerJoin(
      purchaseOrders,
      and(
        eq(purchaseOrders.vendorId, vendors.id),
        eq(purchaseOrders.tenantId, tenantId),
        ...dateFilters
      )
    )
    .where(eq(vendors.tenantId, tenantId))
    .groupBy(vendors.id, vendors.vendorNumber, vendors.vendorName, vendors.isPreferred)
    .orderBy(desc(sql`SUM(${purchaseOrders.totalAmount}::numeric)`))
    .limit(limit);

  return results;
}

/**
 * Gets monthly spend trend for vendors.
 */
export async function getVendorSpendTrend(
  db: Database,
  tenantId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<MonthlyTrend[]> {
  const { startDate, endDate } = options;

  const dateFilters = [eq(purchaseOrders.tenantId, tenantId)];
  if (startDate) {
    dateFilters.push(gte(purchaseOrders.poDate, startDate));
  }
  if (endDate) {
    dateFilters.push(lte(purchaseOrders.poDate, endDate));
  }

  const results = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${purchaseOrders.poDate})::int`,
      month: sql<number>`EXTRACT(MONTH FROM ${purchaseOrders.poDate})::int`,
      monthName: sql<string>`TO_CHAR(${purchaseOrders.poDate}, 'Month')`,
      totalOrders: sql<number>`COUNT(*)::int`,
      totalRevenue: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)::text`,
      averageOrderValue: sql<string>`COALESCE(AVG(${purchaseOrders.totalAmount}::numeric), 0)::text`,
    })
    .from(purchaseOrders)
    .where(and(...dateFilters))
    .groupBy(
      sql`EXTRACT(YEAR FROM ${purchaseOrders.poDate})`,
      sql`EXTRACT(MONTH FROM ${purchaseOrders.poDate})`,
      sql`TO_CHAR(${purchaseOrders.poDate}, 'Month')`
    )
    .orderBy(sql`EXTRACT(YEAR FROM ${purchaseOrders.poDate})`, sql`EXTRACT(MONTH FROM ${purchaseOrders.poDate})`);

  return results.map((row) => ({
    ...row,
    monthName: row.monthName.trim(),
  }));
}

// ============================================================================
// Export Public API
// ============================================================================

export const AnalyticsService = {
  // Customer Analytics
  getTopCustomersByRevenue,
  getCustomerLifetimeValue,
  getCustomerRevenueTrend,
  
  // Vendor Analytics
  getTopVendorsBySpend,
  getVendorSpendTrend,
} as const;
