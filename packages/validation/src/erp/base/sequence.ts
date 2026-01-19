// packages/validation/src/erp/base/sequence.ts
// Sequence (Document Numbering) Zod contracts
//
// SECURITY: Sequences are internal infrastructure.
// Expose only via admin routes, not to regular users.

import { z } from "zod";

// ---- Create Input ----

export const CreateSequenceInput = z.object({
  sequenceKey: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9._-]+$/i, "Sequence key must be alphanumeric with . _ or -"),
  prefix: z.string().min(0).max(16),
  nextValue: z.number().int().min(1).default(1),
  padding: z.number().int().min(1).max(12).default(6),
  yearReset: z.boolean().default(true),
  currentYear: z
    .number()
    .int()
    .min(2000)
    .max(2100)
    .optional(),
});

export type CreateSequenceInput = z.infer<typeof CreateSequenceInput>;

// ---- Update Input ----

export const UpdateSequenceInput = z.object({
  prefix: z.string().min(0).max(16).optional(),
  nextValue: z.number().int().min(1).optional(),
  padding: z.number().int().min(1).max(12).optional(),
  yearReset: z.boolean().optional(),
  currentYear: z.number().int().min(2000).max(2100).optional().nullable(),
});

export type UpdateSequenceInput = z.infer<typeof UpdateSequenceInput>;

// ---- Entity Output ----

export const SequenceOutput = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sequenceKey: z.string(),
  prefix: z.string(),
  nextValue: z.number(),
  padding: z.number(),
  yearReset: z.boolean(),
  currentYear: z.number().nullable(),
});

export type SequenceOutput = z.infer<typeof SequenceOutput>;

// ---- Next Number Output ----

/**
 * Result from calling SequenceService.next()
 */
export const NextNumberOutput = z.object({
  value: z.string(), // formatted document number (e.g., "SO-2026-000042")
  raw: z.number(), // the raw numeric value
  sequenceKey: z.string(),
});

export type NextNumberOutput = z.infer<typeof NextNumberOutput>;

// ---- Peek Output ----

/**
 * Preview next number without incrementing
 */
export const PeekNumberOutput = z.object({
  value: z.string(),
  sequenceKey: z.string(),
});

export type PeekNumberOutput = z.infer<typeof PeekNumberOutput>;
