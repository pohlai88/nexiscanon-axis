// packages/validation/src/erp/base/partner.ts
// Partner (Customers/Vendors) Zod contracts

import { z } from "zod";

// ---- Enums ----

export const PartyType = z.enum(["CUSTOMER", "VENDOR", "BOTH"]);
export type PartyType = z.infer<typeof PartyType>;

// ---- Create Input ----

export const CreatePartnerInput = z.object({
  // Business identity
  code: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase alphanumeric with hyphens")
    .optional(),
  name: z.string().min(2).max(128).trim(),
  displayName: z.string().max(128).trim().optional(),
  partyType: PartyType,

  // Tax/Legal
  taxId: z.string().max(50).trim().optional(),
  companyRegistry: z.string().max(50).trim().optional(),

  // Contact
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).trim().optional(),
  website: z.string().url().max(255).optional(),

  // Address
  addressLine1: z.string().max(255).trim().optional(),
  addressLine2: z.string().max(255).trim().optional(),
  city: z.string().max(100).trim().optional(),
  stateProvince: z.string().max(100).trim().optional(),
  postalCode: z.string().max(20).trim().optional(),
  countryCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/, "Country code must be ISO 3166-1 alpha-2 (e.g., US, GB)")
    .optional(),

  // Defaults
  defaultCurrencyCode: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, "Currency code must be ISO 4217 (e.g., USD, EUR)")
    .optional(),
  defaultPaymentTermsDays: z.number().int().min(0).max(365).optional(),

  // Status
  isActive: z.boolean().default(true),

  // Notes
  internalNotes: z.string().max(5000).optional(),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerInput>;

// ---- Update Input ----

/**
 * Update partner (forbid changing tenantId, code is immutable after creation)
 */
export const UpdatePartnerInput = z.object({
  name: z.string().min(2).max(128).trim().optional(),
  displayName: z.string().max(128).trim().optional(),
  partyType: PartyType.optional(),

  taxId: z.string().max(50).trim().optional(),
  companyRegistry: z.string().max(50).trim().optional(),

  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).trim().optional(),
  website: z.string().url().max(255).optional(),

  addressLine1: z.string().max(255).trim().optional(),
  addressLine2: z.string().max(255).trim().optional(),
  city: z.string().max(100).trim().optional(),
  stateProvince: z.string().max(100).trim().optional(),
  postalCode: z.string().max(20).trim().optional(),
  countryCode: z.string().length(2).regex(/^[A-Z]{2}$/).optional(),

  defaultCurrencyCode: z.string().length(3).regex(/^[A-Z]{3}$/).optional(),
  defaultPaymentTermsDays: z.number().int().min(0).max(365).optional(),

  isActive: z.boolean().optional(),

  internalNotes: z.string().max(5000).optional(),
});

export type UpdatePartnerInput = z.infer<typeof UpdatePartnerInput>;

// ---- Entity Output ----

export const PartnerOutput = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  displayName: z.string().nullable(),
  partyType: PartyType,
  taxId: z.string().nullable(),
  companyRegistry: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  stateProvince: z.string().nullable(),
  postalCode: z.string().nullable(),
  countryCode: z.string().nullable(),
  defaultCurrencyCode: z.string().nullable(),
  defaultPaymentTermsDays: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid().nullable(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid().nullable(),
  version: z.number(),
  internalNotes: z.string().nullable(),
});

export type PartnerOutput = z.infer<typeof PartnerOutput>;

// ---- List Output ----

export const PartnerListOutput = z.object({
  items: z.array(PartnerOutput),
  hasMore: z.boolean(),
  nextCursor: z.string().uuid().nullable(),
});

export type PartnerListOutput = z.infer<typeof PartnerListOutput>;

// ---- List Query ----

export const PartnerListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  q: z.string().max(100).optional(),
  partyType: PartyType.optional(),
  isActive: z.coerce.boolean().optional(),
  orderBy: z.enum(["createdAt", "code", "name"]).default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).default("desc"),
});

export type PartnerListQuery = z.infer<typeof PartnerListQuery>;
