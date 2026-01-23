/**
 * Purchase Domain Common Schemas
 *
 * Shared schemas used across purchase documents
 */

import { z } from "zod";

// Re-use address snapshot from sales
export { addressSnapshotSchema, type AddressSnapshot } from "../sales/common";

// ============================================================================
// Purchase Line Item Base
// ============================================================================

export const purchaseLineBaseSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Item reference
  itemId: z.string().uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),
  itemDescription: z.string().max(500).optional(),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),

  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),

  // Line total
  lineTotal: z.string(),

  // Notes
  notes: z.string().max(500).optional(),
});

export type PurchaseLineBase = z.infer<typeof purchaseLineBaseSchema>;

// ============================================================================
// Approval Chain Entry
// ============================================================================

export const approvalEntrySchema = z.object({
  approverId: z.string().uuid(),
  approverName: z.string().max(255),
  status: z.enum(["pending", "approved", "rejected"]),
  approvedAt: z.string().datetime().optional(),
  comments: z.string().max(500).optional(),
});

export type ApprovalEntry = z.infer<typeof approvalEntrySchema>;
