/**
 * Document Schema (B12)
 *
 * The Machine understands documents.
 */

import { z } from "zod";
import { INTEL_DOCUMENT_TYPE } from "./constants";
import { CONFIDENCE_LEVEL } from "../lynx/constants";

// ============================================================================
// Classification Confidence Schema
// ============================================================================

export const classificationConfidenceSchema = z.object({
  level: z.enum(CONFIDENCE_LEVEL),
  score: z.number().min(0).max(1),
  alternatives: z
    .array(
      z.object({
        type: z.string(),
        score: z.number(),
      })
    )
    .optional(),
});

export type ClassificationConfidence = z.infer<typeof classificationConfidenceSchema>;

// ============================================================================
// Document Classification Schema
// ============================================================================

export const documentClassificationSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Input
  fileName: z.string().max(255),
  fileType: z.string().max(50),
  fileSize: z.number().int().positive(),

  // Classification
  documentType: z.enum(INTEL_DOCUMENT_TYPE),
  subType: z.string().max(100).optional(),

  // Confidence
  confidence: classificationConfidenceSchema,

  // Processing
  processedAt: z.string().datetime(),
  processingTimeMs: z.number().int().nonnegative(),

  createdAt: z.string().datetime(),
});

export type DocumentClassification = z.infer<typeof documentClassificationSchema>;

// ============================================================================
// Extracted Field Schema
// ============================================================================

export const extractedFieldSchema = z.object({
  value: z.unknown(),
  confidence: z.number().min(0).max(1),
  boundingBox: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      page: z.number().int().nonnegative(),
    })
    .optional(),
});

export type ExtractedField = z.infer<typeof extractedFieldSchema>;

// ============================================================================
// Line Item Schema
// ============================================================================

export const extractedLineItemSchema = z.object({
  lineNumber: z.number().int().positive(),
  fields: z.record(z.string(), extractedFieldSchema),
});

export type ExtractedLineItem = z.infer<typeof extractedLineItemSchema>;

// ============================================================================
// Validation Result Schema
// ============================================================================

export const validationResultSchema = z.object({
  field: z.string().max(100),
  status: z.enum(["valid", "warning", "error"]),
  message: z.string().max(500).optional(),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;

// ============================================================================
// Suggested Entity Match Schema
// ============================================================================

export const suggestedEntityMatchSchema = z.object({
  entityType: z.string().max(100),
  entityId: z.uuid().optional(),
  matchConfidence: z.number().min(0).max(1),
});

export type SuggestedEntityMatch = z.infer<typeof suggestedEntityMatchSchema>;

// ============================================================================
// Document Extraction Schema
// ============================================================================

export const documentExtractionSchema = z.object({
  id: z.uuid(),
  classificationId: z.uuid(),
  tenantId: z.uuid(),

  // Document type
  documentType: z.enum(INTEL_DOCUMENT_TYPE),

  // Extracted fields
  extractedFields: z.record(z.string(), extractedFieldSchema),

  // Line items
  lineItems: z.array(extractedLineItemSchema).optional(),

  // Validation
  validationResults: z.array(validationResultSchema).optional(),

  // Suggested mapping
  suggestedEntity: suggestedEntityMatchSchema.optional(),

  // Processing
  processedAt: z.string().datetime(),
  processingTimeMs: z.number().int().nonnegative(),

  createdAt: z.string().datetime(),
});

export type DocumentExtraction = z.infer<typeof documentExtractionSchema>;
