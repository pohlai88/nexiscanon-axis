/**
 * Document Tables (B12)
 *
 * The Machine understands documents.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type IntelDocumentType,
  type ClassificationConfidence,
  type ExtractedField,
  type ExtractedLineItem,
  type ValidationResult,
  type SuggestedEntityMatch,
} from "@axis/registry/schemas";

// ============================================================================
// Document Classifications Table
// ============================================================================

export const intelDocumentClassifications = pgTable(
  "intel_document_classifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Input
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(),
    fileSize: integer("file_size").notNull(),

    // Classification
    documentType: varchar("document_type", { length: 30 })
      .notNull()
      .$type<IntelDocumentType>(),
    subType: varchar("sub_type", { length: 100 }),

    // Confidence
    confidence: jsonb("confidence").$type<ClassificationConfidence>().notNull(),

    // Processing
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull(),
    processingTimeMs: integer("processing_time_ms").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_intel_doc_class_tenant").on(table.tenantId),
    index("idx_intel_doc_class_type").on(table.tenantId, table.documentType),
    index("idx_intel_doc_class_processed").on(table.tenantId, table.processedAt),
  ]
);

export const intelDocumentClassificationsRelations = relations(
  intelDocumentClassifications,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [intelDocumentClassifications.tenantId],
      references: [tenants.id],
    }),
  })
);

export type IntelDocumentClassificationRow =
  typeof intelDocumentClassifications.$inferSelect;
export type NewIntelDocumentClassificationRow =
  typeof intelDocumentClassifications.$inferInsert;

// ============================================================================
// Document Extractions Table
// ============================================================================

export const intelDocumentExtractions = pgTable(
  "intel_document_extractions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classificationId: uuid("classification_id")
      .notNull()
      .references(() => intelDocumentClassifications.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Document type
    documentType: varchar("document_type", { length: 30 })
      .notNull()
      .$type<IntelDocumentType>(),

    // Extracted fields
    extractedFields: jsonb("extracted_fields")
      .$type<Record<string, ExtractedField>>()
      .notNull(),

    // Line items
    lineItems: jsonb("line_items").$type<ExtractedLineItem[]>(),

    // Validation
    validationResults: jsonb("validation_results").$type<ValidationResult[]>(),

    // Suggested mapping
    suggestedEntity: jsonb("suggested_entity").$type<SuggestedEntityMatch>(),

    // Processing
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull(),
    processingTimeMs: integer("processing_time_ms").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_intel_doc_extract_tenant").on(table.tenantId),
    index("idx_intel_doc_extract_class").on(table.classificationId),
    index("idx_intel_doc_extract_type").on(table.tenantId, table.documentType),
  ]
);

export const intelDocumentExtractionsRelations = relations(
  intelDocumentExtractions,
  ({ one }) => ({
    classification: one(intelDocumentClassifications, {
      fields: [intelDocumentExtractions.classificationId],
      references: [intelDocumentClassifications.id],
    }),
    tenant: one(tenants, {
      fields: [intelDocumentExtractions.tenantId],
      references: [tenants.id],
    }),
  })
);

export type IntelDocumentExtractionRow =
  typeof intelDocumentExtractions.$inferSelect;
export type NewIntelDocumentExtractionRow =
  typeof intelDocumentExtractions.$inferInsert;
