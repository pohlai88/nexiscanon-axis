/**
 * Purchase Order Service
 * 
 * Manages purchase orders and conversion to bills.
 * 
 * AUTO-LOOKUP FEATURE:
 * - If vendorId not provided, attempts lookup by vendorName
 * - Auto-populates vendorId for referential integrity
 * - Graceful fallback if vendor not found
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { purchaseOrders, type PurchaseOrder, type PurchaseOrderLineItem, type PurchaseDeliveryAddress } from "../../schema/purchase/order";
import { purchaseBills } from "../../schema/purchase/bill";
import { vendors } from "../../schema/vendor";
import { recordReceipt } from "../inventory/movement-service";
import type { InventoryMovement } from "../../schema/inventory/movement";

/**
 * Create PO input.
 */
export interface CreatePOInput {
  tenantId: string;
  poNumber: string;
  poDate: Date;
  expectedDeliveryDate?: Date;
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  requestId?: string;
  currency?: string;
  lineItems: PurchaseOrderLineItem[];
  deliveryAddress?: PurchaseDeliveryAddress;
  paymentTerms?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a purchase order.
 * 
 * AUTO-LOOKUP: If vendorId not provided, attempts to find vendor by name.
 */
export async function createPO(
  db: Database,
  input: CreatePOInput
): Promise<PurchaseOrder> {
  // Auto-populate vendorId if not provided
  let vendorId = input.vendorId;
  
  if (!vendorId && input.vendorName) {
    // Attempt lookup by exact vendor name match
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.tenantId, input.tenantId),
          eq(vendors.vendorName, input.vendorName),
          eq(vendors.isActive, true)
        )
      )
      .limit(1);
    
    if (vendor) {
      vendorId = vendor.id;
    }
  }
  
  // Calculate totals
  const subtotal = input.lineItems.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  
  const taxTotal = input.lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.tax_rate || "0") * parseFloat(item.amount)),
    0
  );
  
  const totalAmount = subtotal + taxTotal;

  const [order] = await db
    .insert(purchaseOrders)
    .values({
      tenantId: input.tenantId,
      poNumber: input.poNumber,
      poDate: input.poDate,
      expectedDeliveryDate: input.expectedDeliveryDate,
      vendorId: vendorId, // Auto-populated if found
      vendorName: input.vendorName,
      vendorEmail: input.vendorEmail,
      requestId: input.requestId,
      status: "pending",
      currency: input.currency || "USD",
      subtotal: subtotal.toFixed(4),
      taxTotal: taxTotal.toFixed(4),
      totalAmount: totalAmount.toFixed(4),
      lineItems: input.lineItems,
      deliveryAddress: input.deliveryAddress,
      paymentTerms: input.paymentTerms,
      notes: input.notes,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!order) {
    throw new Error("Failed to create purchase order");
  }

  return order;
}

/**
 * Send PO to vendor.
 */
export async function sendPOToVendor(
  db: Database,
  poId: string,
  userId: string
): Promise<PurchaseOrder> {
  const [order] = await db
    .update(purchaseOrders)
    .set({
      status: "sent",
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseOrders.id, poId))
    .returning();

  if (!order) {
    throw new Error(`Purchase order not found: ${poId}`);
  }

  return order;
}

/**
 * Mark PO as received (without inventory tracking).
 * 
 * @deprecated Use receivePurchaseOrderWithInventory() for inventory-tracked items.
 */
export async function markPOReceived(
  db: Database,
  poId: string,
  receivedDate: Date,
  userId: string
): Promise<PurchaseOrder> {
  const [order] = await db
    .update(purchaseOrders)
    .set({
      status: "received",
      receivedAt: receivedDate,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseOrders.id, poId))
    .returning();

  if (!order) {
    throw new Error(`Purchase order not found: ${poId}`);
  }

  return order;
}

/**
 * Receive purchase order with inventory tracking.
 * 
 * For single-line orders with inventory items:
 * 1. Validates PO status
 * 2. Creates inventory receipt movement
 * 3. Updates stock levels (weighted average COGS)
 * 4. Marks PO as received
 * 
 * @param db Database connection
 * @param input Receipt input
 * @returns PO and inventory movement
 */
export async function receivePurchaseOrderWithInventory(
  db: Database,
  input: {
    poId: string;
    receiptDate: Date;
    productId: string;
    quantity: number;
    unitCost: number;
    userId: string;
  }
): Promise<{ order: PurchaseOrder; movement: InventoryMovement }> {
  return await db.transaction(async (tx) => {
    // 1. Get PO
    const [order] = await tx
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, input.poId))
      .limit(1);

    if (!order) {
      throw new Error(`Purchase order ${input.poId} not found`);
    }

    if (order.status !== "sent" && order.status !== "pending") {
      throw new Error(
        `PO ${order.poNumber} cannot be received (status: ${order.status})`
      );
    }

    // 2. Create inventory receipt
    const movementNumber = `${order.poNumber}-RECEIPT`;
    const movement = await recordReceipt(tx as unknown as Database, {
      tenantId: order.tenantId,
      movementNumber,
      movementDate: input.receiptDate,
      productId: input.productId,
      quantity: input.quantity,
      unitCost: input.unitCost,
      currency: order.currency,
      sourceDocumentType: "purchase_order",
      sourceDocumentId: order.id,
      notes: `Receipt for PO ${order.poNumber}`,
      userId: input.userId,
    });

    // 3. Update PO status
    const [updatedOrder] = await tx
      .update(purchaseOrders)
      .set({
        status: "received",
        receivedAt: input.receiptDate,
        modifiedBy: input.userId,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, input.poId))
      .returning();

    if (!updatedOrder) {
      throw new Error(`Failed to update purchase order: ${input.poId}`);
    }

    return { order: updatedOrder, movement };
  });
}

/**
 * Convert PO to bill.
 */
export async function convertPOToBill(
  db: Database,
  poId: string,
  userId: string,
  billNumber: string,
  dueDate: Date,
  paymentTerms?: string
): Promise<{ order: PurchaseOrder; bill: typeof purchaseBills.$inferSelect }> {
  // Get PO
  const [order] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, poId))
    .limit(1);

  if (!order) {
    throw new Error(`Purchase order ${poId} not found`);
  }

  if (order.status !== "sent" && order.status !== "received") {
    throw new Error(`Purchase order ${order.poNumber} must be sent or received before creating bill`);
  }

  if (order.billId) {
    throw new Error(`Purchase order ${order.poNumber} already has a bill`);
  }

  // Transform PO line items to bill line items (add account_code)
  const billLineItems = order.lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.amount,
    tax_rate: item.tax_rate,
    account_code: "5000", // Default expense account - should be configured per line item
    notes: item.notes,
  }));

  // Create bill from PO
  const [bill] = await db
    .insert(purchaseBills)
    .values({
      tenantId: order.tenantId,
      billNumber,
      billDate: new Date(),
      dueDate,
      vendorId: order.vendorId,
      vendorName: order.vendorName,
      vendorEmail: order.vendorEmail,
      poId: order.id,
      status: "draft",
      currency: order.currency,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      totalAmount: order.totalAmount,
      amountPaid: "0",
      amountDue: order.totalAmount,
      lineItems: billLineItems,
      paymentTerms,
      metadata: { ...order.metadata, convertedFromPO: order.poNumber },
      createdBy: userId,
      modifiedBy: userId,
    })
    .returning();

  if (!bill) {
    throw new Error("Failed to create bill from PO");
  }

  // Update PO status
  const [updatedOrder] = await db
    .update(purchaseOrders)
    .set({
      status: "invoiced",
      billId: bill.id,
      invoicedAt: new Date(),
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseOrders.id, poId))
    .returning();

  if (!updatedOrder) {
    throw new Error(`Failed to update purchase order: ${poId}`);
  }

  return { order: updatedOrder, bill };
}

/**
 * Get PO by ID.
 */
export async function getPOById(
  db: Database,
  poId: string
): Promise<PurchaseOrder | null> {
  const [order] = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, poId))
    .limit(1);

  return order || null;
}

/**
 * Get POs by tenant.
 */
export async function getPOsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<PurchaseOrder[]> {
  const conditions = [eq(purchaseOrders.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(purchaseOrders.status, options.status));
  }

  const query = db
    .select()
    .from(purchaseOrders)
    .where(and(...conditions))
    .orderBy(desc(purchaseOrders.poDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Update PO status.
 */
export async function updatePOStatus(
  db: Database,
  poId: string,
  status: string,
  userId: string
): Promise<PurchaseOrder> {
  const [order] = await db
    .update(purchaseOrders)
    .set({
      status,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseOrders.id, poId))
    .returning();

  if (!order) {
    throw new Error(`Purchase order not found: ${poId}`);
  }

  return order;
}
