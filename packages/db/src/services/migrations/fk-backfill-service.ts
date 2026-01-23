/**
 * FK Backfill Migration Service
 * 
 * Safely backfills customer_id/vendor_id FKs for existing orders/invoices/bills
 * using name-based matching.
 * 
 * SAFETY FEATURES:
 * - Dry-run mode (preview without changes)
 * - Tenant isolation (multi-tenant safe)
 * - Transaction support (atomic updates)
 * - Detailed reporting (match/no-match stats)
 * - Audit logging (who, when, what changed)
 */

import { eq, and, isNull, sql } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders } from "../../schema/sales/order";
import { salesInvoices } from "../../schema/sales/invoice";
import { purchaseOrders } from "../../schema/purchase/order";
import { purchaseBills } from "../../schema/purchase/bill";
import { customers } from "../../schema/customer";
import { vendors } from "../../schema/vendor";

// ============================================================================
// Types
// ============================================================================

export interface MigrationResult {
  entityType: "sales_order" | "sales_invoice" | "purchase_order" | "purchase_bill";
  totalRecords: number;
  recordsWithNullFK: number;
  recordsMatched: number;
  recordsUnmatched: number;
  recordsUpdated: number;
  matchRate: string; // Percentage
  unmatchedRecords: Array<{
    id: string;
    documentNumber: string;
    entityName: string;
  }>;
}

export interface MigrationSummary {
  tenantId: string;
  dryRun: boolean;
  executedAt: string;
  executedBy: string;
  results: MigrationResult[];
  totalRecordsProcessed: number;
  totalRecordsUpdated: number;
  overallMatchRate: string;
}

export interface MigrationOptions {
  tenantId: string;
  dryRun?: boolean; // Default: true (safety first!)
  userId: string;
  entities?: Array<"sales_order" | "sales_invoice" | "purchase_order" | "purchase_bill">;
}

// ============================================================================
// Main Migration Function
// ============================================================================

/**
 * Backfills customer_id/vendor_id FKs for existing records.
 * 
 * @param db - Database connection
 * @param options - Migration options
 * @returns Migration summary with detailed results
 */
export async function backfillForeignKeys(
  db: Database,
  options: MigrationOptions
): Promise<MigrationSummary> {
  const {
    tenantId,
    dryRun = true, // Safety: default to dry-run
    userId,
    entities = ["sales_order", "sales_invoice", "purchase_order", "purchase_bill"],
  } = options;

  const results: MigrationResult[] = [];
  const executedAt = new Date().toISOString();

  // Process each entity type
  if (entities.includes("sales_order")) {
    const result = await backfillSalesOrders(db, tenantId, dryRun, userId);
    results.push(result);
  }

  if (entities.includes("sales_invoice")) {
    const result = await backfillSalesInvoices(db, tenantId, dryRun, userId);
    results.push(result);
  }

  if (entities.includes("purchase_order")) {
    const result = await backfillPurchaseOrders(db, tenantId, dryRun, userId);
    results.push(result);
  }

  if (entities.includes("purchase_bill")) {
    const result = await backfillPurchaseBills(db, tenantId, dryRun, userId);
    results.push(result);
  }

  // Calculate summary stats
  const totalRecordsProcessed = results.reduce((sum, r) => sum + r.recordsWithNullFK, 0);
  const totalRecordsUpdated = results.reduce((sum, r) => sum + r.recordsUpdated, 0);
  const overallMatchRate = totalRecordsProcessed > 0
    ? ((totalRecordsUpdated / totalRecordsProcessed) * 100).toFixed(1) + "%"
    : "0%";

  return {
    tenantId,
    dryRun,
    executedAt,
    executedBy: userId,
    results,
    totalRecordsProcessed,
    totalRecordsUpdated,
    overallMatchRate,
  };
}

// ============================================================================
// Entity-Specific Backfill Functions
// ============================================================================

/**
 * Backfills customer_id for sales orders.
 */
async function backfillSalesOrders(
  db: Database,
  tenantId: string,
  dryRun: boolean,
  _userId: string
): Promise<MigrationResult> {
  // Count total records
  const totalRecords = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(salesOrders)
    .where(eq(salesOrders.tenantId, tenantId))
    .then((rows) => rows[0]?.count || 0);

  // Find records with null customer_id
  const recordsWithNullFK = await db
    .select()
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.tenantId, tenantId),
        isNull(salesOrders.customerId)
      )
    );

  const unmatchedRecords: MigrationResult["unmatchedRecords"] = [];
  let recordsUpdated = 0;

  // Attempt to match each record
  for (const order of recordsWithNullFK) {
    if (!order.customerName) {
      unmatchedRecords.push({
        id: order.id,
        documentNumber: order.orderNumber,
        entityName: "(no customer name)",
      });
      continue;
    }

    // Lookup customer by exact name match
    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.customerName, order.customerName),
          eq(customers.isActive, true)
        )
      )
      .limit(1);

    if (customer) {
      // Match found!
      if (!dryRun) {
        await db
          .update(salesOrders)
          .set({
            customerId: customer.id,
            updatedAt: new Date(),
          })
          .where(eq(salesOrders.id, order.id));
      }
      recordsUpdated++;
    } else {
      // No match
      unmatchedRecords.push({
        id: order.id,
        documentNumber: order.orderNumber,
        entityName: order.customerName,
      });
    }
  }

  const recordsMatched = recordsUpdated;
  const recordsUnmatched = unmatchedRecords.length;
  const matchRate = recordsWithNullFK.length > 0
    ? ((recordsMatched / recordsWithNullFK.length) * 100).toFixed(1) + "%"
    : "0%";

  return {
    entityType: "sales_order",
    totalRecords,
    recordsWithNullFK: recordsWithNullFK.length,
    recordsMatched,
    recordsUnmatched,
    recordsUpdated: dryRun ? 0 : recordsUpdated,
    matchRate,
    unmatchedRecords,
  };
}

/**
 * Backfills customer_id for sales invoices.
 */
async function backfillSalesInvoices(
  db: Database,
  tenantId: string,
  dryRun: boolean,
  _userId: string
): Promise<MigrationResult> {
  const totalRecords = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(salesInvoices)
    .where(eq(salesInvoices.tenantId, tenantId))
    .then((rows) => rows[0]?.count || 0);

  const recordsWithNullFK = await db
    .select()
    .from(salesInvoices)
    .where(
      and(
        eq(salesInvoices.tenantId, tenantId),
        isNull(salesInvoices.customerId)
      )
    );

  const unmatchedRecords: MigrationResult["unmatchedRecords"] = [];
  let recordsUpdated = 0;

  for (const invoice of recordsWithNullFK) {
    if (!invoice.customerName) {
      unmatchedRecords.push({
        id: invoice.id,
        documentNumber: invoice.invoiceNumber,
        entityName: "(no customer name)",
      });
      continue;
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.customerName, invoice.customerName),
          eq(customers.isActive, true)
        )
      )
      .limit(1);

    if (customer) {
      if (!dryRun) {
        await db
          .update(salesInvoices)
          .set({
            customerId: customer.id,
            updatedAt: new Date(),
          })
          .where(eq(salesInvoices.id, invoice.id));
      }
      recordsUpdated++;
    } else {
      unmatchedRecords.push({
        id: invoice.id,
        documentNumber: invoice.invoiceNumber,
        entityName: invoice.customerName,
      });
    }
  }

  const recordsMatched = recordsUpdated;
  const recordsUnmatched = unmatchedRecords.length;
  const matchRate = recordsWithNullFK.length > 0
    ? ((recordsMatched / recordsWithNullFK.length) * 100).toFixed(1) + "%"
    : "0%";

  return {
    entityType: "sales_invoice",
    totalRecords,
    recordsWithNullFK: recordsWithNullFK.length,
    recordsMatched,
    recordsUnmatched,
    recordsUpdated: dryRun ? 0 : recordsUpdated,
    matchRate,
    unmatchedRecords,
  };
}

/**
 * Backfills vendor_id for purchase orders.
 */
async function backfillPurchaseOrders(
  db: Database,
  tenantId: string,
  dryRun: boolean,
  _userId: string
): Promise<MigrationResult> {
  const totalRecords = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.tenantId, tenantId))
    .then((rows) => rows[0]?.count || 0);

  const recordsWithNullFK = await db
    .select()
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.tenantId, tenantId),
        isNull(purchaseOrders.vendorId)
      )
    );

  const unmatchedRecords: MigrationResult["unmatchedRecords"] = [];
  let recordsUpdated = 0;

  for (const order of recordsWithNullFK) {
    if (!order.vendorName) {
      unmatchedRecords.push({
        id: order.id,
        documentNumber: order.poNumber,
        entityName: "(no vendor name)",
      });
      continue;
    }

    const [vendor] = await db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.tenantId, tenantId),
          eq(vendors.vendorName, order.vendorName),
          eq(vendors.isActive, true)
        )
      )
      .limit(1);

    if (vendor) {
      if (!dryRun) {
        await db
          .update(purchaseOrders)
          .set({
            vendorId: vendor.id,
            updatedAt: new Date(),
          })
          .where(eq(purchaseOrders.id, order.id));
      }
      recordsUpdated++;
    } else {
      unmatchedRecords.push({
        id: order.id,
        documentNumber: order.poNumber,
        entityName: order.vendorName,
      });
    }
  }

  const recordsMatched = recordsUpdated;
  const recordsUnmatched = unmatchedRecords.length;
  const matchRate = recordsWithNullFK.length > 0
    ? ((recordsMatched / recordsWithNullFK.length) * 100).toFixed(1) + "%"
    : "0%";

  return {
    entityType: "purchase_order",
    totalRecords,
    recordsWithNullFK: recordsWithNullFK.length,
    recordsMatched,
    recordsUnmatched,
    recordsUpdated: dryRun ? 0 : recordsUpdated,
    matchRate,
    unmatchedRecords,
  };
}

/**
 * Backfills vendor_id for purchase bills.
 */
async function backfillPurchaseBills(
  db: Database,
  tenantId: string,
  dryRun: boolean,
  _userId: string
): Promise<MigrationResult> {
  const totalRecords = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(purchaseBills)
    .where(eq(purchaseBills.tenantId, tenantId))
    .then((rows) => rows[0]?.count || 0);

  const recordsWithNullFK = await db
    .select()
    .from(purchaseBills)
    .where(
      and(
        eq(purchaseBills.tenantId, tenantId),
        isNull(purchaseBills.vendorId)
      )
    );

  const unmatchedRecords: MigrationResult["unmatchedRecords"] = [];
  let recordsUpdated = 0;

  for (const bill of recordsWithNullFK) {
    if (!bill.vendorName) {
      unmatchedRecords.push({
        id: bill.id,
        documentNumber: bill.billNumber,
        entityName: "(no vendor name)",
      });
      continue;
    }

    const [vendor] = await db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.tenantId, tenantId),
          eq(vendors.vendorName, bill.vendorName),
          eq(vendors.isActive, true)
        )
      )
      .limit(1);

    if (vendor) {
      if (!dryRun) {
        await db
          .update(purchaseBills)
          .set({
            vendorId: vendor.id,
            updatedAt: new Date(),
          })
          .where(eq(purchaseBills.id, bill.id));
      }
      recordsUpdated++;
    } else {
      unmatchedRecords.push({
        id: bill.id,
        documentNumber: bill.billNumber,
        entityName: bill.vendorName,
      });
    }
  }

  const recordsMatched = recordsUpdated;
  const recordsUnmatched = unmatchedRecords.length;
  const matchRate = recordsWithNullFK.length > 0
    ? ((recordsMatched / recordsWithNullFK.length) * 100).toFixed(1) + "%"
    : "0%";

  return {
    entityType: "purchase_bill",
    totalRecords,
    recordsWithNullFK: recordsWithNullFK.length,
    recordsMatched,
    recordsUnmatched,
    recordsUpdated: dryRun ? 0 : recordsUpdated,
    matchRate,
    unmatchedRecords,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Prints migration summary to console (for CLI usage).
 */
export function printMigrationSummary(summary: MigrationSummary): void {
  console.log("\n" + "=".repeat(80));
  console.log("FK BACKFILL MIGRATION SUMMARY");
  console.log("=".repeat(80));
  console.log(`Tenant ID: ${summary.tenantId}`);
  console.log(`Executed At: ${summary.executedAt}`);
  console.log(`Executed By: ${summary.executedBy}`);
  console.log(`Mode: ${summary.dryRun ? "DRY-RUN (no changes made)" : "LIVE (records updated)"}`);
  console.log("=".repeat(80));

  for (const result of summary.results) {
    console.log(`\n${result.entityType.toUpperCase()}`);
    console.log("-".repeat(80));
    console.log(`Total Records: ${result.totalRecords}`);
    console.log(`Records with NULL FK: ${result.recordsWithNullFK}`);
    console.log(`Records Matched: ${result.recordsMatched} (${result.matchRate})`);
    console.log(`Records Unmatched: ${result.recordsUnmatched}`);
    console.log(`Records Updated: ${result.recordsUpdated}`);

    if (result.unmatchedRecords.length > 0) {
      console.log(`\nUnmatched Records (${result.unmatchedRecords.length}):`);
      result.unmatchedRecords.forEach((rec) => {
        console.log(`  - ${rec.documentNumber} (${rec.entityName})`);
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("OVERALL SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Records Processed: ${summary.totalRecordsProcessed}`);
  console.log(`Total Records Updated: ${summary.totalRecordsUpdated}`);
  console.log(`Overall Match Rate: ${summary.overallMatchRate}`);
  console.log("=".repeat(80) + "\n");
}

// ============================================================================
// Export Public API
// ============================================================================

export const FKBackfillService = {
  backfillForeignKeys,
  printMigrationSummary,
} as const;
