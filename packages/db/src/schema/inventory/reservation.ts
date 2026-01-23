/**
 * Reservation Table (B06)
 *
 * Commits stock to confirmed sales orders.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type ReservationStatus,
  type FulfillmentEntry,
} from "@axis/registry/schemas";

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // What is reserved (reference by UUID, not FK per B02)
    itemId: uuid("item_id").notNull(),
    locationId: uuid("location_id").notNull(),
    lotNumber: varchar("lot_number", { length: 100 }),

    // How much
    quantityReserved: numeric("quantity_reserved", {
      precision: 18,
      scale: 4,
    }).notNull(),
    quantityFulfilled: numeric("quantity_fulfilled", {
      precision: 18,
      scale: 4,
    })
      .notNull()
      .default("0"),
    quantityRemaining: numeric("quantity_remaining", {
      precision: 18,
      scale: 4,
    }).notNull(),
    uomId: uuid("uom_id").notNull(),

    // For what (cross-domain reference by UUID, not FK per B02)
    sourceDocumentType: varchar("source_document_type", { length: 30 })
      .notNull()
      .default("sales.order"),
    sourceDocumentId: uuid("source_document_id").notNull(),
    sourceDocumentNumber: varchar("source_document_number", {
      length: 50,
    }).notNull(),
    sourceLineNumber: integer("source_line_number").notNull(),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("active")
      .$type<ReservationStatus>(),

    // Validity
    reservedAt: timestamp("reserved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    // Fulfillment tracking
    fulfillments: jsonb("fulfillments").$type<FulfillmentEntry[]>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_reservations_tenant").on(table.tenantId),
    index("idx_reservations_item").on(
      table.tenantId,
      table.itemId,
      table.locationId
    ),
    index("idx_reservations_source").on(
      table.tenantId,
      table.sourceDocumentId,
      table.sourceLineNumber
    ),
    index("idx_reservations_status").on(table.tenantId, table.status),
    index("idx_reservations_expiry").on(table.tenantId, table.expiresAt),
  ]
);

export const reservationsRelations = relations(reservations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reservations.tenantId],
    references: [tenants.id],
  }),
}));

export type ReservationRow = typeof reservations.$inferSelect;
export type NewReservationRow = typeof reservations.$inferInsert;
