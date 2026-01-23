/**
 * Customer History Service
 * 
 * Provides comprehensive order/invoice history views for customers.
 * Leverages FK relationships for fast, accurate queries.
 * 
 * FEATURES:
 * - Complete order history (all orders + invoices)
 * - Date range filtering
 * - Status filtering
 * - Summary analytics (total orders, revenue, average order value)
 * - Timeline view (chronological order)
 * - Top products purchased
 */

import { desc, eq, and, gte, lte, inArray, sql } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders } from "../../schema/sales/order";
import { salesInvoices } from "../../schema/sales/invoice";
import { customers } from "../../schema/customer";

// ============================================================================
// Types
// ============================================================================

export interface CustomerHistoryFilters {
  customerId: string;
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  statuses?: Array<"pending" | "confirmed" | "delivered" | "invoiced" | "cancelled">;
  limit?: number;
  offset?: number;
}

export interface CustomerOrderHistoryItem {
  id: string;
  type: "order" | "invoice";
  documentNumber: string;
  documentDate: Date;
  status: string;
  totalAmount: string;
  currency: string;
  lineItemsCount: number;
  notes?: string;
  // Order-specific
  expectedDeliveryDate?: Date;
  deliveredAt?: Date;
  // Invoice-specific
  dueDate?: Date;
  paidAt?: Date;
}

export interface CustomerHistorySummary {
  customerId: string;
  customerNumber: string;
  customerName: string;
  displayName: string | null;
  // Order stats
  totalOrders: number;
  totalOrderValue: string;
  averageOrderValue: string;
  // Invoice stats
  totalInvoices: number;
  totalInvoiceValue: string;
  totalOutstanding: string;
  totalPaid: string;
  // Date range
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  // Status breakdown
  ordersByStatus: Record<string, number>;
  invoicesByStatus: Record<string, number>;
}

export interface CustomerHistoryDetail {
  summary: CustomerHistorySummary;
  orders: CustomerOrderHistoryItem[];
  totalRecords: number;
}

// ============================================================================
// Main Query Functions
// ============================================================================

/**
 * Gets complete customer history with summary and detail.
 */
export async function getCustomerHistory(
  db: Database,
  filters: CustomerHistoryFilters
): Promise<CustomerHistoryDetail> {
  const summary = await getCustomerSummary(db, filters.customerId, filters.tenantId);
  const orders = await getCustomerOrders(db, filters);
  
  // Count total records (for pagination)
  const totalRecords = await countCustomerRecords(db, filters);

  return {
    summary,
    orders,
    totalRecords,
  };
}

/**
 * Gets customer summary analytics.
 */
export async function getCustomerSummary(
  db: Database,
  customerId: string,
  tenantId: string
): Promise<CustomerHistorySummary> {
  // Get customer info
  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.id, customerId),
        eq(customers.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  // Get order stats
  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`COUNT(*)::int`,
      totalOrderValue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      averageOrderValue: sql<string>`COALESCE(AVG(${salesOrders.totalAmount}::numeric), 0)::text`,
      firstOrderDate: sql<Date>`MIN(${salesOrders.orderDate})`,
      lastOrderDate: sql<Date>`MAX(${salesOrders.orderDate})`,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.customerId, customerId),
        eq(salesOrders.tenantId, tenantId)
      )
    );

  // Get invoice stats
  const [invoiceStats] = await db
    .select({
      totalInvoices: sql<number>`COUNT(*)::int`,
      totalInvoiceValue: sql<string>`COALESCE(SUM(${salesInvoices.totalAmount}::numeric), 0)::text`,
      totalOutstanding: sql<string>`COALESCE(SUM(CASE WHEN ${salesInvoices.status} IN ('draft', 'issued') THEN ${salesInvoices.totalAmount}::numeric ELSE 0 END), 0)::text`,
      totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${salesInvoices.status} = 'paid' THEN ${salesInvoices.totalAmount}::numeric ELSE 0 END), 0)::text`,
    })
    .from(salesInvoices)
    .where(
      and(
        eq(salesInvoices.customerId, customerId),
        eq(salesInvoices.tenantId, tenantId)
      )
    );

  // Get order status breakdown
  const ordersByStatus: Record<string, number> = {};
  const orderStatusResults = await db
    .select({
      status: salesOrders.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.customerId, customerId),
        eq(salesOrders.tenantId, tenantId)
      )
    )
    .groupBy(salesOrders.status);

  for (const row of orderStatusResults) {
    ordersByStatus[row.status] = row.count;
  }

  // Get invoice status breakdown
  const invoicesByStatus: Record<string, number> = {};
  const invoiceStatusResults = await db
    .select({
      status: salesInvoices.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(salesInvoices)
    .where(
      and(
        eq(salesInvoices.customerId, customerId),
        eq(salesInvoices.tenantId, tenantId)
      )
    )
    .groupBy(salesInvoices.status);

  for (const row of invoiceStatusResults) {
    invoicesByStatus[row.status] = row.count;
  }

  return {
    customerId: customer.id,
    customerNumber: customer.customerNumber,
    customerName: customer.customerName,
    displayName: customer.displayName,
    totalOrders: orderStats?.totalOrders || 0,
    totalOrderValue: orderStats?.totalOrderValue || "0",
    averageOrderValue: orderStats?.averageOrderValue || "0",
    totalInvoices: invoiceStats?.totalInvoices || 0,
    totalInvoiceValue: invoiceStats?.totalInvoiceValue || "0",
    totalOutstanding: invoiceStats?.totalOutstanding || "0",
    totalPaid: invoiceStats?.totalPaid || "0",
    firstOrderDate: orderStats?.firstOrderDate,
    lastOrderDate: orderStats?.lastOrderDate,
    ordersByStatus,
    invoicesByStatus,
  };
}

/**
 * Gets customer orders (chronological timeline).
 */
export async function getCustomerOrders(
  db: Database,
  filters: CustomerHistoryFilters
): Promise<CustomerOrderHistoryItem[]> {
  const { customerId, tenantId, startDate, endDate, statuses, limit = 50, offset = 0 } = filters;

  const timeline: CustomerOrderHistoryItem[] = [];

  // Build date filters
  const dateFilters = [];
  if (startDate) {
    dateFilters.push(gte(salesOrders.orderDate, startDate));
  }
  if (endDate) {
    dateFilters.push(lte(salesOrders.orderDate, endDate));
  }

  // Get orders
  const orderFilters = [
    eq(salesOrders.customerId, customerId),
    eq(salesOrders.tenantId, tenantId),
    ...dateFilters,
  ];

  if (statuses && statuses.length > 0) {
    orderFilters.push(inArray(salesOrders.status, statuses));
  }

  const orders = await db
    .select()
    .from(salesOrders)
    .where(and(...orderFilters))
    .orderBy(desc(salesOrders.orderDate))
    .limit(limit)
    .offset(offset);

  for (const order of orders) {
    timeline.push({
      id: order.id,
      type: "order",
      documentNumber: order.orderNumber,
      documentDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      lineItemsCount: order.lineItems.length,
      notes: order.notes || undefined,
      expectedDeliveryDate: order.expectedDeliveryDate || undefined,
      deliveredAt: order.deliveredAt || undefined,
    });
  }

  // Get invoices
  const invoiceFilters = [
    eq(salesInvoices.customerId, customerId),
    eq(salesInvoices.tenantId, tenantId),
  ];

  if (startDate) {
    invoiceFilters.push(gte(salesInvoices.invoiceDate, startDate));
  }
  if (endDate) {
    invoiceFilters.push(lte(salesInvoices.invoiceDate, endDate));
  }

  const invoices = await db
    .select()
    .from(salesInvoices)
    .where(and(...invoiceFilters))
    .orderBy(desc(salesInvoices.invoiceDate))
    .limit(limit)
    .offset(offset);

  for (const invoice of invoices) {
    timeline.push({
      id: invoice.id,
      type: "invoice",
      documentNumber: invoice.invoiceNumber,
      documentDate: invoice.invoiceDate,
      status: invoice.status,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      lineItemsCount: invoice.lineItems.length,
      notes: invoice.notes || undefined,
      dueDate: invoice.dueDate,
      paidAt: invoice.lastPaymentDate || undefined,
    });
  }

  // Sort combined timeline by date (most recent first)
  timeline.sort((a, b) => b.documentDate.getTime() - a.documentDate.getTime());

  return timeline;
}

/**
 * Counts total records for pagination.
 */
async function countCustomerRecords(
  db: Database,
  filters: CustomerHistoryFilters
): Promise<number> {
  const { customerId, tenantId, startDate, endDate, statuses } = filters;

  // Count orders
  const orderFilters = [
    eq(salesOrders.customerId, customerId),
    eq(salesOrders.tenantId, tenantId),
  ];

  if (startDate) {
    orderFilters.push(gte(salesOrders.orderDate, startDate));
  }
  if (endDate) {
    orderFilters.push(lte(salesOrders.orderDate, endDate));
  }
  if (statuses && statuses.length > 0) {
    orderFilters.push(inArray(salesOrders.status, statuses));
  }

  const [orderCount] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(salesOrders)
    .where(and(...orderFilters));

  // Count invoices
  const invoiceFilters = [
    eq(salesInvoices.customerId, customerId),
    eq(salesInvoices.tenantId, tenantId),
  ];

  if (startDate) {
    invoiceFilters.push(gte(salesInvoices.invoiceDate, startDate));
  }
  if (endDate) {
    invoiceFilters.push(lte(salesInvoices.invoiceDate, endDate));
  }

  const [invoiceCount] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(salesInvoices)
    .where(and(...invoiceFilters));

  return (orderCount?.count || 0) + (invoiceCount?.count || 0);
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Gets customer's most recent orders.
 */
export async function getRecentCustomerOrders(
  db: Database,
  customerId: string,
  tenantId: string,
  limit = 10
): Promise<CustomerOrderHistoryItem[]> {
  return getCustomerOrders(db, {
    customerId,
    tenantId,
    limit,
    offset: 0,
  });
}

/**
 * Gets customer's outstanding (unpaid) invoices.
 */
export async function getCustomerOutstandingInvoices(
  db: Database,
  customerId: string,
  tenantId: string
): Promise<CustomerOrderHistoryItem[]> {
  const invoices = await db
    .select()
    .from(salesInvoices)
    .where(
      and(
        eq(salesInvoices.customerId, customerId),
        eq(salesInvoices.tenantId, tenantId),
        inArray(salesInvoices.status, ["draft", "sent"] as const)
      )
    )
    .orderBy(desc(salesInvoices.dueDate));

  return invoices.map((invoice) => ({
    id: invoice.id,
    type: "invoice" as const,
    documentNumber: invoice.invoiceNumber,
    documentDate: invoice.invoiceDate,
    status: invoice.status,
    totalAmount: invoice.totalAmount,
    currency: invoice.currency,
    lineItemsCount: invoice.lineItems.length,
    notes: invoice.notes || undefined,
    dueDate: invoice.dueDate,
  }));
}

/**
 * Gets customer's year-to-date summary.
 */
export async function getCustomerYTDSummary(
  db: Database,
  customerId: string,
  tenantId: string,
  year = new Date().getFullYear()
): Promise<{
  totalOrders: number;
  totalRevenue: string;
  averageOrderValue: string;
  outstandingBalance: string;
}> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Get order stats for the year
  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`COUNT(*)::int`,
      totalRevenue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      averageOrderValue: sql<string>`COALESCE(AVG(${salesOrders.totalAmount}::numeric), 0)::text`,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.customerId, customerId),
        eq(salesOrders.tenantId, tenantId),
        gte(salesOrders.orderDate, startDate),
        lte(salesOrders.orderDate, endDate)
      )
    );

  // Get outstanding balance (all time, not just YTD)
  const [invoiceStats] = await db
    .select({
      outstandingBalance: sql<string>`COALESCE(SUM(CASE WHEN ${salesInvoices.status} IN ('draft', 'issued') THEN ${salesInvoices.totalAmount}::numeric ELSE 0 END), 0)::text`,
    })
    .from(salesInvoices)
    .where(
      and(
        eq(salesInvoices.customerId, customerId),
        eq(salesInvoices.tenantId, tenantId)
      )
    );

  return {
    totalOrders: orderStats?.totalOrders || 0,
    totalRevenue: orderStats?.totalRevenue || "0",
    averageOrderValue: orderStats?.averageOrderValue || "0",
    outstandingBalance: invoiceStats?.outstandingBalance || "0",
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const CustomerHistoryService = {
  getCustomerHistory,
  getCustomerSummary,
  getCustomerOrders,
  getRecentCustomerOrders,
  getCustomerOutstandingInvoices,
  getCustomerYTDSummary,
} as const;
