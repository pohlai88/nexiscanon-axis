/**
 * Source Schema Tables (C02)
 *
 * "The Machine reads database structures."
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
import { migrationStates } from "../migration/state";
import {
  type SourceConnectorType,
  type IntrospectionStatus,
  type DatabaseConnection,
  type FileSource,
  type ApiSource,
  type SourceTableDetail,
  type SourceRelationship,
} from "@axis/registry/schemas";

export const sourceSchemas = pgTable(
  "adapter_source_schemas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Source type
    sourceType: varchar("source_type", { length: 50 })
      .notNull()
      .$type<SourceConnectorType>(),

    // Connection info (JSONB)
    connection: jsonb("connection").$type<DatabaseConnection>(),
    file: jsonb("file").$type<FileSource>(),
    api: jsonb("api").$type<ApiSource>(),

    // Extracted schema (JSONB)
    tables: jsonb("tables").$type<SourceTableDetail[]>().notNull().default([]),
    relationships: jsonb("relationships")
      .$type<SourceRelationship[]>()
      .notNull()
      .default([]),

    // Introspection metadata
    introspectionStatus: varchar("introspection_status", { length: 30 })
      .notNull()
      .default("pending")
      .$type<IntrospectionStatus>(),
    introspectedAt: timestamp("introspected_at", { withTimezone: true }),
    introspectionDurationMs: integer("introspection_duration_ms"),
    introspectionError: varchar("introspection_error", { length: 2000 }),

    // Metrics
    totalTables: integer("total_tables").notNull().default(0),
    totalColumns: integer("total_columns").notNull().default(0),
    totalRows: integer("total_rows").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_source_schemas_tenant").on(table.tenantId),
    index("idx_source_schemas_migration").on(table.migrationStateId),
    index("idx_source_schemas_status").on(table.introspectionStatus),
  ]
);

export const sourceSchemasRelations = relations(sourceSchemas, ({ one }) => ({
  tenant: one(tenants, {
    fields: [sourceSchemas.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [sourceSchemas.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type SourceSchemaRow = typeof sourceSchemas.$inferSelect;
export type NewSourceSchemaRow = typeof sourceSchemas.$inferInsert;
