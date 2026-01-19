// packages/validation/src/erp/base/product.ts
// Product (Goods/Services) Zod contracts

import { z } from "zod";

// ---- Enums ----

export const ProductType = z.enum(["GOODS", "SERVICE"]);
export type ProductType = z.infer<typeof ProductType>;

// ---- Money Helpers ----

/**
 * String cents validation (no precision loss)
 * Accepts positive integers as strings
 */
const stringCents = z
  .string()
  .regex(/^\d+$/, "Must be a positive integer (cents)")
  .refine((val) => BigInt(val) >= 0n, "Must be non-negative");

// ---- Create Input ----

export const CreateProductInput = z.object({
  // Business identity
  sku: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Z0-9-_]+$/, "SKU must be uppercase alphanumeric with - or _")
    .transform((val) => val.toUpperCase())
    .optional(), // auto-generated if not provided

  name: z.string().min(2).max(128).trim(),
  description: z.string().max(2000).trim().optional(),

  // Classification
  productType: ProductType.default("GOODS"),
  category: z.string().max(100).trim().optional(),

  // Pricing (string cents - no precision loss)
  defaultSalePriceCents: stringCents.default("0"),
  defaultPurchasePriceCents: stringCents.default("0"),
  currencyCode: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, "Currency code must be ISO 4217 (e.g., USD, EUR)")
    .default("USD"),

  // UoM
  defaultUomId: z.string().uuid().optional(),

  // Inventory
  isStockable: z.boolean().default(true),
  trackInventory: z.boolean().default(true),

  // Status
  isActive: z.boolean().default(true),
  isSellable: z.boolean().default(true),
  isPurchasable: z.boolean().default(true),

  // Notes
  internalNotes: z.string().max(5000).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductInput>;

// ---- Update Input ----

/**
 * Update product (forbid changing tenantId, SKU is immutable after creation)
 */
export const UpdateProductInput = z.object({
  name: z.string().min(2).max(128).trim().optional(),
  description: z.string().max(2000).trim().optional(),

  productType: ProductType.optional(),
  category: z.string().max(100).trim().optional(),

  defaultSalePriceCents: stringCents.optional(),
  defaultPurchasePriceCents: stringCents.optional(),
  currencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).optional(),

  defaultUomId: z.string().uuid().optional().nullable(),

  isStockable: z.boolean().optional(),
  trackInventory: z.boolean().optional(),

  isActive: z.boolean().optional(),
  isSellable: z.boolean().optional(),
  isPurchasable: z.boolean().optional(),

  internalNotes: z.string().max(5000).optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductInput>;

// ---- Entity Output ----

export const ProductOutput = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  productType: ProductType,
  category: z.string().nullable(),
  defaultSalePriceCents: z.string(), // string cents
  defaultPurchasePriceCents: z.string(), // string cents
  currencyCode: z.string(),
  defaultUomId: z.string().uuid().nullable(),
  isStockable: z.boolean(),
  trackInventory: z.boolean(),
  isActive: z.boolean(),
  isSellable: z.boolean(),
  isPurchasable: z.boolean(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid().nullable(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid().nullable(),
  version: z.number(),
  internalNotes: z.string().nullable(),
});

export type ProductOutput = z.infer<typeof ProductOutput>;

// ---- List Output ----

export const ProductListOutput = z.object({
  items: z.array(ProductOutput),
  hasMore: z.boolean(),
  nextCursor: z.string().uuid().nullable(),
});

export type ProductListOutput = z.infer<typeof ProductListOutput>;

// ---- List Query ----

export const ProductListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  q: z.string().max(100).optional(),
  productType: ProductType.optional(),
  category: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
  isSellable: z.coerce.boolean().optional(),
  isPurchasable: z.coerce.boolean().optional(),
  orderBy: z.enum(["createdAt", "sku", "name"]).default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductListQuery = z.infer<typeof ProductListQuery>;
