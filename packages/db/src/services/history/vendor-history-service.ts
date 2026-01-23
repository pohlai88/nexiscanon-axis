/**
 * Vendor History Service
 * 
 * Provides comprehensive purchase order/bill history views for vendors.
 * Leverages FK relationships for fast, accurate queries.
 * 
 * FEATURES:
 * - Complete purchase history (all POs + bills)
 * - Date range filtering
 * - Status filtering
 * - Summary analytics (total POs, spend, average order value)
 * - Timeline view (chronological order)
 * - Payment tracking
 */

import { desc, eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import type { Database } from "../../client";
import { purchaseOrders } from "../../schema/purchase/order";
import { purchaseBills } from "../../schema/purchase/bill";
import { vendors } from "../../schema/vendor";

// ============================================================================
// Types
// ============================================================================

export interface VendorHistoryFilters {
  vendorId: string;
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  statuses?: Array<"pending" | "confirmed" | "received" | "billed" | "cancelled">;
  limit?: number;
  offset?: number;
}

export interface VendorPurchaseHistoryItem {
  id: string;
  type: "purchase_order" | "bill";
  documentNumber: string;
  documentDate: Date;
  status: string;
  totalAmount: string;
  currency: string;
  lineItemsCount: number;
  notes?: string;
  // PO-specific
  expectedDeliveryDate?: Date;
  receivedAt?: Date;
  // Bill-specific
  dueDate?: Date;
  paidAt?: Date;
  supplierInvoiceNumber?: string;
}

export interface VendorHistorySummary {
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  displayName: string | null;
  isPreferred: boolean;
  // PO stats
  totalPurchaseOrders: number;
  totalPurchaseValue: string;
  averagePurchaseValue: string;
  // Bill stats
  totalBills: number;
  totalBillValue: string;
  totalOutstanding: string;
  totalPaid: string;
  // Date range
  firstPurchaseDate?: Date;
  lastPurchaseDate?: Date;
  // Status breakdown
  posByStatus: Record<string, number>;
  billsByStatus: Record<string, number>;
}

export interface VendorHistoryDetail {
  summary: VendorHistorySummary;
  purchases: VendorPurchaseHistoryItem[];
  totalRecords: number;
}

// ============================================================================
// Main Query Functions
// ============================================================================

/**
 * Gets complete vendor history with summary and detail.
 */
export async function getVendorHistory(
  db: Database,
  filters: VendorHistoryFilters
): Promise<VendorHistoryDetail> {
  const summary = await getVendorSummary(db, filters.vendorId, filters.tenantId);
  const purchases = await getVendorPurchases(db, filters);
  
  // Count total records (for pagination)
  const totalRecords = await countVendorRecords(db, filters);

  return {
    summary,
    purchases,
    totalRecords,
  };
}

/**
 * Gets vendor summary analytics.
 */
export async function getVendorSummary(
  db: Database,
  vendorId: string,
  tenantId: string
): Promise<VendorHistorySummary> {
  // Get vendor info
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.id, vendorId),
        eq(vendors.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  // Get PO stats
  const [poStats] = await db
    .select({
      totalPurchaseOrders: sql<number>`COUNT(*)::int`,
      totalPurchaseValue: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)::text`,
      averagePurchaseValue: sql<string>`COALESCE(AVG(${purchaseOrders.totalAmount}::numeric), 0)::text`,
      firstPurchaseDate: sql<Date>`MIN(${purchaseOrders.poDate})`,
      lastPurchaseDate: sql<Date>`MAX(${purchaseOrders.poDate})`,
    })
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.vendorId, vendorId),
        eq(purchaseOrders.tenantId, tenantId)
      )
    );

  // Get bill stats
  const [billStats] = await db
    .select({
      totalBills: sql<number>`COUNT(*)::int`,
      totalBillValue: sql<string>`COALESCE(SUM(${purchaseBills.totalAmount}::numeric), 0)::text`,
      totalOutstanding: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseBills.status} IN ('draft', 'issued') THEN ${purchaseBills.totalAmount}::numeric ELSE 0 END), 0)::text`,
      totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseBills.status} = 'paid' THEN ${purchaseBills.totalAmount}::numeric ELSE 0 END), 0)::text`,
    })
    .from(purchaseBills)
    .where(
      and(
        eq(purchaseBills.vendorId, vendorId),
        eq(purchaseBills.tenantId, tenantId)
      )
    );

  // Get PO status breakdown
  const posByStatus: Record<string, number> = {};
  const poStatusResults = await db
    .select({
      status: purchaseOrders.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.vendorId, vendorId),
        eq(purchaseOrders.tenantId, tenantId)
      )
    )
    .groupBy(purchaseOrders.status);

  for (const row of poStatusResults) {
    posByStatus[row.status] = row.count;
  }

  // Get bill status breakdown
  const billsByStatus: Record<string, number> = {};
  const billStatusResults = await db
    .select({
      status: purchaseBills.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(purchaseBills)
    .where(
      and(
        eq(purchaseBills.vendorId, vendorId),
        eq(purchaseBills.tenantId, tenantId)
      )
    )
    .groupBy(purchaseBills.status);

  for (const row of billStatusResults) {
    billsByStatus[row.status] = row.count;
  }

  return {
    vendorId: vendor.id,
    vendorNumber: vendor.vendorNumber,
    vendorName: vendor.vendorName,
    displayName: vendor.displayName,
    isPreferred: vendor.isPreferred,
    totalPurchaseOrders: poStats?.totalPurchaseOrders || 0,
    totalPurchaseValue: poStats?.totalPurchaseValue || "0",
    averagePurchaseValue: poStats?.averagePurchaseValue || "0",
    totalBills: billStats?.totalBills || 0,
    totalBillValue: billStats?.totalBillValue || "0",
    totalOutstanding: billStats?.totalOutstanding || "0",
    totalPaid: billStats?.totalPaid || "0",
    firstPurchaseDate: poStats?.firstPurchaseDate,
    lastPurchaseDate: poStats?.lastPurchaseDate,
    posByStatus,
    billsByStatus,
  };
}

/**
 * Gets vendor purchases (chronological timeline).
 */
export async function getVendorPurchases(
  db: Database,
  filters: VendorHistoryFilters
): Promise<VendorPurchaseHistoryItem[]> {
  const { vendorId, tenantId, startDate, endDate, statuses, limit = 50, offset = 0 } = filters;

  const timeline: VendorPurchaseHistoryItem[] = [];

  // Build date filters
  const dateFilters = [];
  if (startDate) {
    dateFilters.push(gte(purchaseOrders.poDate, startDate));
  }
  if (endDate) {
    dateFilters.push(lte(purchaseOrders.poDate, endDate));
  }

  // Get purchase orders
  const poFilters = [
    eq(purchaseOrders.vendorId, vendorId),
    eq(purchaseOrders.tenantId, tenantId),
    ...dateFilters,
  ];

  if (statuses && statuses.length > 0) {
    poFilters.push(inArray(purchaseOrders.status, statuses));
  }

  const pos = await db
    .select()
    .from(purchaseOrders)
    .where(and(...poFilters))
    .orderBy(desc(purchaseOrders.poDate))
    .limit(limit)
    .offset(offset);

  for (const po of pos) {
    timeline.push({
      id: po.id,
      type: "purchase_order",
      documentNumber: po.poNumber,
      documentDate: po.poDate,
      status: po.status,
      totalAmount: po.totalAmount,
      currency: po.currency,
      lineItemsCount: po.lineItems.length,
      notes: po.notes || undefined,
      expectedDeliveryDate: po.expectedDeliveryDate || undefined,
      receivedAt: po.receivedAt || undefined,
    });
  }

  // Get bills
  const billFilters = [
    eq(purchaseBills.vendorId, vendorId),
    eq(purchaseBills.tenantId, tenantId),
  ];

  if (startDate) {
    billFilters.push(gte(purchaseBills.billDate, startDate));
  }
  if (endDate) {
    billFilters.push(lte(purchaseBills.billDate, endDate));
  }

  const bills = await db
    .select()
    .from(purchaseBills)
    .where(and(...billFilters))
    .orderBy(desc(purchaseBills.billDate))
    .limit(limit)
    .offset(offset);

  for (const bill of bills) {
    timeline.push({
      id: bill.id,
      type: "bill",
      documentNumber: bill.billNumber,
      documentDate: bill.billDate,
      status: bill.status,
      totalAmount: bill.totalAmount,
      currency: bill.currency,
      lineItemsCount: bill.lineItems.length,
      notes: bill.notes || undefined,
      dueDate: bill.dueDate,
      paidAt: bill.lastPaymentDate || undefined,
    });
  }

  // Sort combined timeline by date (most recent first)
  timeline.sort((a, b) => b.documentDate.getTime() - a.documentDate.getTime());

  return timeline;
}

/**
 * Counts total records for pagination.
 */
async function countVendorRecords(
  db: Database,
  filters: VendorHistoryFilters
): Promise<number> {
  const { vendorId, tenantId, startDate, endDate, statuses } = filters;

  // Count POs
  const poFilters = [
    eq(purchaseOrders.vendorId, vendorId),
    eq(purchaseOrders.tenantId, tenantId),
  ];

  if (startDate) {
    poFilters.push(gte(purchaseOrders.poDate, startDate));
  }
  if (endDate) {
    poFilters.push(lte(purchaseOrders.poDate, endDate));
  }
  if (statuses && statuses.length > 0) {
    poFilters.push(inArray(purchaseOrders.status, statuses));
  }

  const [poCount] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(purchaseOrders)
    .where(and(...poFilters));

  // Count bills
  const billFilters = [
    eq(purchaseBills.vendorId, vendorId),
    eq(purchaseBills.tenantId, tenantId),
  ];

  if (startDate) {
    billFilters.push(gte(purchaseBills.billDate, startDate));
  }
  if (endDate) {
    billFilters.push(lte(purchaseBills.billDate, endDate));
  }

  const [billCount] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(purchaseBills)
    .where(and(...billFilters));

  return (poCount?.count || 0) + (billCount?.count || 0);
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Gets vendor's most recent purchases.
 */
export async function getRecentVendorPurchases(
  db: Database,
  vendorId: string,
  tenantId: string,
  limit = 10
): Promise<VendorPurchaseHistoryItem[]> {
  return getVendorPurchases(db, {
    vendorId,
    tenantId,
    limit,
    offset: 0,
  });
}

/**
 * Gets vendor's outstanding (unpaid) bills.
 */
export async function getVendorOutstandingBills(
  db: Database,
  vendorId: string,
  tenantId: string
): Promise<VendorPurchaseHistoryItem[]> {
  const bills = await db
    .select()
    .from(purchaseBills)
    .where(
      and(
        eq(purchaseBills.vendorId, vendorId),
        eq(purchaseBills.tenantId, tenantId),
        inArray(purchaseBills.status, ["draft", "issued"])
      )
    )
    .orderBy(desc(purchaseBills.dueDate));

  return bills.map((bill) => ({
    id: bill.id,
    type: "bill" as const,
    documentNumber: bill.billNumber,
    documentDate: bill.billDate,
    status: bill.status,
    totalAmount: bill.totalAmount,
    currency: bill.currency,
    lineItemsCount: bill.lineItems.length,
    notes: bill.notes || undefined,
    dueDate: bill.dueDate,
  }));
}

/**
 * Gets vendor's year-to-date summary.
 */
export async function getVendorYTDSummary(
  db: Database,
  vendorId: string,
  tenantId: string,
  year = new Date().getFullYear()
): Promise<{
  totalPurchaseOrders: number;
  totalSpend: string;
  averagePurchaseValue: string;
  outstandingBalance: string;
}> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Get PO stats for the year
  const [poStats] = await db
    .select({
      totalPurchaseOrders: sql<number>`COUNT(*)::int`,
      totalSpend: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)::text`,
      averagePurchaseValue: sql<string>`COALESCE(AVG(${purchaseOrders.totalAmount}::numeric), 0)::text`,
    })
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.vendorId, vendorId),
        eq(purchaseOrders.tenantId, tenantId),
        gte(purchaseOrders.poDate, startDate),
        lte(purchaseOrders.poDate, endDate)
      )
    );

  // Get outstanding balance (all time, not just YTD)
  const [billStats] = await db
    .select({
      outstandingBalance: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseBills.status} IN ('draft', 'issued') THEN ${purchaseBills.totalAmount}::numeric ELSE 0 END), 0)::text`,
    })
    .from(purchaseBills)
    .where(
      and(
        eq(purchaseBills.vendorId, vendorId),
        eq(purchaseBills.tenantId, tenantId)
      )
    );

  return {
    totalPurchaseOrders: poStats?.totalPurchaseOrders || 0,
    totalSpend: poStats?.totalSpend || "0",
    averagePurchaseValue: poStats?.averagePurchaseValue || "0",
    outstandingBalance: billStats?.outstandingBalance || "0",
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const VendorHistoryService = {
  getVendorHistory,
  getVendorSummary,
  getVendorPurchases,
  getRecentVendorPurchases,
  getVendorOutstandingBills,
  getVendorYTDSummary,
} as const;
