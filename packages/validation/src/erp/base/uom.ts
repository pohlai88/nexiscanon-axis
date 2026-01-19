// packages/validation/src/erp/base/uom.ts
// UoM (Units of Measure) Zod contracts

import { z } from "zod";

// ---- Enums ----

export const UomCategory = z.enum([
  "quantity",
  "weight",
  "length",
  "volume",
  "time",
]);

export type UomCategory = z.infer<typeof UomCategory>;

// ---- Create Input ----

export const CreateUomInput = z.object({
  code: z
    .string()
    .min(1)
    .max(16)
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase alphanumeric with _ or -")
    .transform((val) => val.toUpperCase()),
  name: z.string().min(2).max(64).trim(),
  category: UomCategory,
  isActive: z.boolean().default(true),
});

export type CreateUomInput = z.infer<typeof CreateUomInput>;

// ---- Update Input ----

export const UpdateUomInput = z.object({
  name: z.string().min(2).max(64).trim().optional(),
  category: UomCategory.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUomInput = z.infer<typeof UpdateUomInput>;

// ---- Entity Output ----

export const UomOutput = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  category: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type UomOutput = z.infer<typeof UomOutput>;

// ---- List Output ----

export const UomListOutput = z.object({
  items: z.array(UomOutput),
  hasMore: z.boolean(),
  nextCursor: z.string().uuid().nullable(),
});

export type UomListOutput = z.infer<typeof UomListOutput>;

// ---- List Query ----

export const UomListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  q: z.string().max(100).optional(),
  category: UomCategory.optional(),
  isActive: z.coerce.boolean().optional(),
  orderBy: z.enum(["createdAt", "code", "name"]).default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
});

export type UomListQuery = z.infer<typeof UomListQuery>;
