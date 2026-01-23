/**
 * Sales Order Service
 * 
 * Manages sales orders and conversion to invoices.
 * 
 * AUTO-LOOKUP FEATURE:
 * - If customerId not provided, attempts lookup by customerName
 * - Auto-populates customerId for referential integrity
 * - Graceful fallback if customer not found
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders, type SalesOrder, type OrderLineItem } from "../../schema/sales/order";
import { salesInvoices } from "../../schema/sales/invoice";
import { customers } from "../../schema/customer";
import { checkAvailability, getStockLevel } from "../inventory/stock-service";
import { recordIssue } from "../inventory/movement-service";
import type { InventoryMovement } from "../../schema/inventory/movement";

/**
 * Create order input.
 */
export interface CreateOrderInput {
  tenantId: string;
  orderNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  quoteId?: string;
  currency?: string;
  lineItems: OrderLineItem[];
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  notes?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a sales order.
 * 
 * AUTO-LOOKUP: If customerId not provided, attempts to find customer by name.
 */
export async function createOrder(
  db: Database,
  input: CreateOrderInput
): Promise<SalesOrder> {
  // Auto-populate customerId if not provided
  let customerId = input.customerId;
  
  if (!customerId && input.customerName) {
    // Attempt lookup by exact customer name match
    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, input.tenantId),
          eq(customers.customerName, input.customerName),
          eq(customers.isActive, true)
        )
      )
      .limit(1);
    
    if (customer) {
      customerId = customer.id;
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
    .insert(salesOrders)
    .values({
      tenantId: input.tenantId,
      orderNumber: input.orderNumber,
      orderDate: input.orderDate,
      expectedDeliveryDate: input.expectedDeliveryDate,
      customerId: customerId, // Auto-populated if found
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      quoteId: input.quoteId,
      status: "pending",
      currency: input.currency || "USD",
      subtotal: subtotal.toFixed(4),
      taxTotal: taxTotal.toFixed(4),
      totalAmount: totalAmount.toFixed(4),
      lineItems: input.lineItems,
      deliveryAddress: input.deliveryAddress,
      notes: input.notes,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!order) {
    throw new Error("Failed to create sales order");
  }

  return order;
}

/**
 * Confirm sales order with inventory availability check.
 * 
 * Validates stock availability before confirming order.
 */
export async function confirmOrderWithInventoryCheck(
  db: Database,
  orderId: string,
  productId: string,
  quantity: number,
  userId: string
): Promise<SalesOrder> {
  // 1. Check availability
  const { available, quantityAvailable } = await checkAvailability(
    db,
    "", // Will get tenant from order
    productId,
    quantity
  );

  if (!available) {
    throw new Error(
      `Insufficient stock: ${quantity} requested, ${quantityAvailable} available`
    );
  }

  // 2. Confirm order
  const [order] = await db
    .update(salesOrders)
    .set({
      status: "confirmed",
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesOrders.id, orderId))
    .returning();

  if (!order) {
    throw new Error(`Sales order not found: ${orderId}`);
  }

  return order;
}

/**
 * Mark order as delivered (without inventory tracking).
 * 
 * @deprecated Use fulfillOrderWithInventory() for inventory-tracked items.
 */
export async function markOrderDelivered(
  db: Database,
  orderId: string,
  deliveryDate: Date,
  userId: string
): Promise<SalesOrder> {
  const [order] = await db
    .update(salesOrders)
    .set({
      status: "delivered",
      deliveredAt: deliveryDate,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesOrders.id, orderId))
    .returning();

  if (!order) {
    throw new Error(`Sales order not found: ${orderId}`);
  }

  return order;
}

/**
 * Fulfill sales order with inventory issue.
 * 
 * For single-line orders with inventory items:
 * 1. Validates order status
 * 2. Checks inventory availability
 * 3. Creates inventory issue movement
 * 4. Updates stock levels (deduct qty, calculate COGS)
 * 5. Marks order as delivered
 * 
 * @param db Database connection
 * @param input Fulfillment input
 * @returns Order and inventory movement
 */
export async function fulfillOrderWithInventory(
  db: Database,
  input: {
    orderId: string;
    fulfillmentDate: Date;
    productId: string;
    quantity: number;
    userId: string;
  }
): Promise<{ order: SalesOrder; movement: InventoryMovement }> {
  return await db.transaction(async (tx) => {
    // 1. Get order
    const [order] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, input.orderId))
      .limit(1);

    if (!order) {
      throw new Error(`Sales order ${input.orderId} not found`);
    }

    if (order.status !== "confirmed" && order.status !== "pending") {
      throw new Error(
        `Order ${order.orderNumber} cannot be fulfilled (status: ${order.status})`
      );
    }

    // 2. Check inventory availability
    const { available, quantityAvailable } = await checkAvailability(
      tx as unknown as Database,
      order.tenantId,
      input.productId,
      input.quantity
    );

    if (!available) {
      throw new Error(
        `Insufficient stock for ${order.orderNumber}: ${input.quantity} requested, ${quantityAvailable} available`
      );
    }

    // 3. Get stock level for COGS calculation
    const stockLevel = await getStockLevel(
      tx as unknown as Database,
      order.tenantId,
      input.productId
    );

    if (!stockLevel) {
      throw new Error(`Stock level not found for product ${input.productId}`);
    }

    // 4. Create inventory issue (will use weighted avg cost)
    const movementNumber = `${order.orderNumber}-ISSUE`;
    const movement = await recordIssue(tx as unknown as Database, {
      tenantId: order.tenantId,
      movementNumber,
      movementDate: input.fulfillmentDate,
      productId: input.productId,
      quantity: input.quantity,
      currency: order.currency,
      sourceDocumentType: "sales_order",
      sourceDocumentId: order.id,
      notes: `Issue for SO ${order.orderNumber}`,
      userId: input.userId,
    });

    // 5. Update order status
    const [updatedOrder] = await tx
      .update(salesOrders)
      .set({
        status: "delivered",
        deliveredAt: input.fulfillmentDate,
        modifiedBy: input.userId,
        updatedAt: new Date(),
      })
      .where(eq(salesOrders.id, input.orderId))
      .returning();

    if (!updatedOrder) {
      throw new Error(`Failed to update sales order: ${input.orderId}`);
    }

    return { order: updatedOrder, movement };
  });
}

/**
 * Convert order to invoice.
 */
export async function convertOrderToInvoice(
  db: Database,
  orderId: string,
  userId: string,
  invoiceNumber: string,
  dueDate: Date,
  paymentTerms?: string
): Promise<{ order: SalesOrder; invoice: typeof salesInvoices.$inferSelect }> {
  // Get order
  const [order] = await db
    .select()
    .from(salesOrders)
    .where(eq(salesOrders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  if (order.status !== "confirmed" && order.status !== "delivered") {
    throw new Error(`Order ${order.orderNumber} must be confirmed or delivered before invoicing`);
  }

  if (order.invoiceId) {
    throw new Error(`Order ${order.orderNumber} already invoiced`);
  }

  // Create invoice from order
  const [invoice] = await db
    .insert(salesInvoices)
    .values({
      tenantId: order.tenantId,
      invoiceNumber,
      invoiceDate: new Date(),
      dueDate,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderId: order.id,
      status: "draft",
      currency: order.currency,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      totalAmount: order.totalAmount,
      amountPaid: "0",
      amountDue: order.totalAmount,
      lineItems: order.lineItems,
      paymentTerms,
      metadata: { ...order.metadata, convertedFromOrder: order.orderNumber },
      createdBy: userId,
      modifiedBy: userId,
    })
    .returning();

  if (!invoice) {
    throw new Error("Failed to create invoice from order");
  }

  // Update order status
  const [updatedOrder] = await db
    .update(salesOrders)
    .set({
      status: "invoiced",
      invoiceId: invoice.id,
      invoicedAt: new Date(),
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesOrders.id, orderId))
    .returning();

  if (!updatedOrder) {
    throw new Error(`Failed to update sales order: ${orderId}`);
  }

  return { order: updatedOrder, invoice };
}

/**
 * Get order by ID.
 */
export async function getOrderById(
  db: Database,
  orderId: string
): Promise<SalesOrder | null> {
  const [order] = await db
    .select()
    .from(salesOrders)
    .where(eq(salesOrders.id, orderId))
    .limit(1);

  return order || null;
}

/**
 * Get orders by tenant.
 */
export async function getOrdersByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: "pending" | "confirmed" | "in_progress" | "delivered" | "invoiced" | "cancelled";
  }
): Promise<SalesOrder[]> {
  const conditions = [eq(salesOrders.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(salesOrders.status, options.status));
  }

  const query = db
    .select()
    .from(salesOrders)
    .where(and(...conditions))
    .orderBy(desc(salesOrders.orderDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Update order status.
 */
export async function updateOrderStatus(
  db: Database,
  orderId: string,
  status: "pending" | "confirmed" | "in_progress" | "delivered" | "invoiced" | "cancelled",
  userId: string
): Promise<SalesOrder> {
  const [order] = await db
    .update(salesOrders)
    .set({
      status,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(salesOrders.id, orderId))
    .returning();

  if (!order) {
    throw new Error(`Sales order not found: ${orderId}`);
  }

  return order;
}
