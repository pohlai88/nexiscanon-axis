/**
 * Memory Tables (A01-01)
 *
 * Conversation sessions and knowledge documents.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  text,
  index,
  vector,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { lynxAgents } from "./agent";
import { type Message } from "@axis/registry/schemas";

// ============================================================================
// Conversation Sessions Table
// ============================================================================

export const lynxConversationSessions = pgTable(
  "lynx_conversation_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),

    // Context
    agentId: uuid("agent_id").references(() => lynxAgents.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }),

    // Messages
    messages: jsonb("messages").$type<Message[]>().notNull().default([]),

    // Metadata
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_lynx_session_tenant").on(table.tenantId),
    index("idx_lynx_session_user").on(table.tenantId, table.userId),
    index("idx_lynx_session_agent").on(table.tenantId, table.agentId),
    index("idx_lynx_session_active").on(table.tenantId, table.isActive),
    index("idx_lynx_session_last_msg").on(table.tenantId, table.lastMessageAt),
  ]
);

export const lynxConversationSessionsRelations = relations(
  lynxConversationSessions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lynxConversationSessions.tenantId],
      references: [tenants.id],
    }),
    agent: one(lynxAgents, {
      fields: [lynxConversationSessions.agentId],
      references: [lynxAgents.id],
    }),
  })
);

export type LynxConversationSessionRow =
  typeof lynxConversationSessions.$inferSelect;
export type NewLynxConversationSessionRow =
  typeof lynxConversationSessions.$inferInsert;

// ============================================================================
// Knowledge Documents Table
// ============================================================================

export const lynxKnowledgeDocuments = pgTable(
  "lynx_knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    collection: varchar("collection", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),

    // Content
    content: text("content").notNull(),
    contentType: varchar("content_type", { length: 20 }).notNull(),

    // Chunks
    chunkIndex: integer("chunk_index"),
    totalChunks: integer("total_chunks"),
    parentDocumentId: uuid("parent_document_id"),

    // Embedding (pgvector)
    embedding: vector("embedding", { dimensions: 1536 }),

    // Metadata
    source: varchar("source", { length: 255 }),
    sourceUrl: text("source_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_lynx_doc_tenant").on(table.tenantId),
    index("idx_lynx_doc_collection").on(table.tenantId, table.collection),
    index("idx_lynx_doc_parent").on(table.parentDocumentId),
  ]
);

export const lynxKnowledgeDocumentsRelations = relations(
  lynxKnowledgeDocuments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [lynxKnowledgeDocuments.tenantId],
      references: [tenants.id],
    }),
  })
);

export type LynxKnowledgeDocumentRow =
  typeof lynxKnowledgeDocuments.$inferSelect;
export type NewLynxKnowledgeDocumentRow =
  typeof lynxKnowledgeDocuments.$inferInsert;
