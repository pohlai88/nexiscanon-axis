/**
 * Sales Domain Common Schemas
 *
 * Shared schemas used across sales documents
 */

import { z } from "zod";

// ============================================================================
// Address Snapshot (captured at document time)
// ============================================================================

export const addressSnapshotSchema = z.object({
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.email().optional(),
});

export type AddressSnapshot = z.infer<typeof addressSnapshotSchema>;

// ============================================================================
// Line Item Base (shared fields for all sales line types)
// ============================================================================

export const salesLineBaseSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Item reference
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Pricing
  unitPrice: z.string(), // Decimal as string for precision
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),

  // Tax
  taxCodeId: z.uuid().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),

  // Line total
  lineTotal: z.string(),

  // Notes
  notes: z.string().max(500).optional(),
});

export type SalesLineBase = z.infer<typeof salesLineBaseSchema>;

// ============================================================================
// Document Totals
// ============================================================================

export const documentTotalsSchema = z.object({
  subtotal: z.string(),
  discountTotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),
});

export type DocumentTotals = z.infer<typeof documentTotalsSchema>;
