/**
 * Stock Move Table (B06)
 *
 * The atomic unit of inventory change.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type MoveType,
  type MoveStatus,
  type StockMoveLine,
} from "@axis/registry/schemas";

export const stockMoves = pgTable(
  "stock_moves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Move details
    moveType: varchar("move_type", { length: 20 }).notNull().$type<MoveType>(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<MoveStatus>(),

    // Source document (reference by UUID, not FK per B02)
    sourceDocumentType: varchar("source_document_type", {
      length: 50,
    }).notNull(),
    sourceDocumentId: uuid("source_document_id").notNull(),
    sourceDocumentNumber: varchar("source_document_number", {
      length: 50,
    }).notNull(),

    // Dates
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    movedDate: timestamp("moved_date", { withTimezone: true }),

    // Lines
    lines: jsonb("lines").notNull().$type<StockMoveLine[]>(),

    // Totals
    totalQuantity: numeric("total_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    totalValue: numeric("total_value", { precision: 18, scale: 4 }).notNull(),

    // Notes
    notes: text("notes"),

    // References (B01, B07)
    valuationBatchId: uuid("valuation_batch_id"),
    postingBatchId: uuid("posting_batch_id"),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    postedBy: uuid("posted_by"),
    postedAt: timestamp("posted_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_stock_moves_tenant").on(table.tenantId),
    index("idx_stock_moves_type").on(table.tenantId, table.moveType),
    index("idx_stock_moves_status").on(table.tenantId, table.status),
    index("idx_stock_moves_doc_number").on(table.tenantId, table.documentNumber),
    index("idx_stock_moves_source").on(
      table.tenantId,
      table.sourceDocumentType,
      table.sourceDocumentId
    ),
    index("idx_stock_moves_moved_date").on(table.tenantId, table.movedDate),
  ]
);

export const stockMovesRelations = relations(stockMoves, ({ one }) => ({
  tenant: one(tenants, {
    fields: [stockMoves.tenantId],
    references: [tenants.id],
  }),
}));

export type StockMoveRow = typeof stockMoves.$inferSelect;
export type NewStockMoveRow = typeof stockMoves.$inferInsert;
