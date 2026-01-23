/**
 * Purchase Request Service
 * 
 * Manages internal purchase requests and approval workflow.
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { purchaseRequests, type PurchaseRequest, type RequestLineItem } from "../../schema/purchase/request";
import { purchaseOrders } from "../../schema/purchase/order";

/**
 * Create request input.
 */
export interface CreateRequestInput {
  tenantId: string;
  requestNumber: string;
  requestDate: Date;
  requesterId?: string;
  requesterName: string;
  vendorId?: string;
  vendorName?: string;
  currency?: string;
  lineItems: RequestLineItem[];
  justification?: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a purchase request (draft state).
 */
export async function createRequest(
  db: Database,
  input: CreateRequestInput
): Promise<PurchaseRequest> {
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

  const [request] = await db
    .insert(purchaseRequests)
    .values({
      tenantId: input.tenantId,
      requestNumber: input.requestNumber,
      requestDate: input.requestDate,
      status: "draft",
      requesterId: input.requesterId,
      requesterName: input.requesterName,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      currency: input.currency || "USD",
      subtotal: subtotal.toFixed(4),
      taxTotal: taxTotal.toFixed(4),
      totalAmount: totalAmount.toFixed(4),
      lineItems: input.lineItems,
      justification: input.justification,
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!request) {
    throw new Error("Failed to create purchase request");
  }

  return request;
}

/**
 * Submit request for approval.
 */
export async function submitRequest(
  db: Database,
  requestId: string,
  userId: string
): Promise<PurchaseRequest> {
  const [request] = await db
    .update(purchaseRequests)
    .set({
      status: "submitted",
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, requestId))
    .returning();

  if (!request) {
    throw new Error(`Purchase request not found: ${requestId}`);
  }

  return request;
}

/**
 * Approve purchase request.
 */
export async function approveRequest(
  db: Database,
  requestId: string,
  userId: string,
  approvalNotes?: string
): Promise<PurchaseRequest> {
  const [request] = await db
    .update(purchaseRequests)
    .set({
      status: "approved",
      approvalNotes,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, requestId))
    .returning();

  if (!request) {
    throw new Error(`Purchase request not found: ${requestId}`);
  }

  return request;
}

/**
 * Reject purchase request.
 */
export async function rejectRequest(
  db: Database,
  requestId: string,
  userId: string,
  reason: string
): Promise<PurchaseRequest> {
  const [request] = await db
    .update(purchaseRequests)
    .set({
      status: "rejected",
      approvalNotes: reason,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, requestId))
    .returning();

  if (!request) {
    throw new Error(`Purchase request not found: ${requestId}`);
  }

  return request;
}

/**
 * Convert request to PO.
 */
export async function convertRequestToPO(
  db: Database,
  requestId: string,
  userId: string,
  poNumber: string
): Promise<{ request: PurchaseRequest; order: typeof purchaseOrders.$inferSelect }> {
  // Get request
  const [request] = await db
    .select()
    .from(purchaseRequests)
    .where(eq(purchaseRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw new Error(`Purchase request ${requestId} not found`);
  }

  if (request.status !== "approved") {
    throw new Error(`Purchase request ${request.requestNumber} must be approved before conversion`);
  }

  if (request.convertedToPoId) {
    throw new Error(`Purchase request ${request.requestNumber} already converted to PO`);
  }

  // Create PO from request
  const [order] = await db
    .insert(purchaseOrders)
    .values({
      tenantId: request.tenantId,
      poNumber,
      poDate: new Date(),
      vendorId: request.vendorId,
      vendorName: request.vendorName || "Unknown Vendor",
      requestId: request.id,
      status: "pending",
      currency: request.currency,
      subtotal: request.subtotal,
      taxTotal: request.taxTotal,
      totalAmount: request.totalAmount,
      lineItems: request.lineItems,
      metadata: { ...request.metadata, convertedFromRequest: request.requestNumber },
      createdBy: userId,
      modifiedBy: userId,
    })
    .returning();

  if (!order) {
    throw new Error("Failed to create purchase order from request");
  }

  // Update request status
  const [updatedRequest] = await db
    .update(purchaseRequests)
    .set({
      status: "converted",
      convertedToPoId: order.id,
      convertedAt: new Date(),
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, requestId))
    .returning();

  if (!updatedRequest) {
    throw new Error(`Failed to update purchase request: ${requestId}`);
  }

  return { request: updatedRequest, order };
}

/**
 * Get request by ID.
 */
export async function getRequestById(
  db: Database,
  requestId: string
): Promise<PurchaseRequest | null> {
  const [request] = await db
    .select()
    .from(purchaseRequests)
    .where(eq(purchaseRequests.id, requestId))
    .limit(1);

  return request || null;
}

/**
 * Get requests by tenant.
 */
export async function getRequestsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<PurchaseRequest[]> {
  const conditions = [eq(purchaseRequests.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(purchaseRequests.status, options.status));
  }

  const query = db
    .select()
    .from(purchaseRequests)
    .where(and(...conditions))
    .orderBy(desc(purchaseRequests.requestDate))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Update request status.
 */
export async function updateRequestStatus(
  db: Database,
  requestId: string,
  status: string,
  userId: string
): Promise<PurchaseRequest> {
  const [request] = await db
    .update(purchaseRequests)
    .set({
      status,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, requestId))
    .returning();

  if (!request) {
    throw new Error(`Purchase request not found: ${requestId}`);
  }

  return request;
}
