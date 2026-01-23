/**
 * Purchase Request Schema (B05)
 *
 * Internal request capturing department/user needs.
 */

import { z } from "zod";
import { PR_STATUS, PR_PRIORITY } from "./constants";
import { approvalEntrySchema } from "./common";

// ============================================================================
// PR Line Schema
// ============================================================================

export const purchaseRequestLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Item (can be free text for new items)
  itemId: z.uuid().optional(),
  itemSku: z.string().max(50).optional(),
  itemName: z.string().min(1).max(255),
  itemDescription: z.string().max(500).optional(),

  // Quantity
  quantityRequested: z.number().positive(),
  quantityOrdered: z.number().min(0).default(0),
  uomId: z.uuid().optional(),
  uomSymbol: z.string().max(20).optional(),

  // Estimated pricing
  estimatedUnitPrice: z.string().optional(),
  estimatedTotal: z.string().optional(),

  // Delivery
  deliverToLocationId: z.uuid().optional(),
  deliverToLocationName: z.string().max(255).optional(),

  notes: z.string().max(500).optional(),
});

export type PurchaseRequestLine = z.infer<typeof purchaseRequestLineSchema>;

// ============================================================================
// PR Schema
// ============================================================================

export const purchaseRequestSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Requester
  requesterId: z.uuid(),
  requesterName: z.string().max(255),
  departmentId: z.uuid().optional(),
  departmentName: z.string().max(255).optional(),

  // PR specifics
  status: z.enum(PR_STATUS).default("draft"),
  priority: z.enum(PR_PRIORITY).default("normal"),
  requiredByDate: z.string().datetime().optional(),

  // Suggested supplier (optional)
  suggestedSupplierId: z.uuid().optional(),
  suggestedSupplierName: z.string().max(255).optional(),

  // Lines
  lines: z.array(purchaseRequestLineSchema).min(1),

  // Totals (estimated)
  estimatedTotal: z.string().optional(),
  currency: z.string().length(3).optional(),

  // Budget reference
  budgetCode: z.string().max(50).optional(),
  costCenterId: z.uuid().optional(),
  projectId: z.uuid().optional(),

  // Justification
  justification: z.string().max(2000).optional(),

  // Approval tracking
  approvalChain: z.array(approvalEntrySchema).optional(),

  // PO tracking
  poIds: z.array(z.uuid()).optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  submittedAt: z.string().datetime().optional(),
  approvedAt: z.string().datetime().optional(),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
