import {
  createCoercedInsertSchema,
  createSelectSchema,
  z,
} from "./factory";
import { auditLogs } from "../schema/audit-log";

/**
 * Audit log insert schema.
 * Uses coerced schema for date fields (Zod v4 best practice).
 */
export const insertAuditLogSchema = createCoercedInsertSchema(auditLogs, {
  action: z.string().min(1).max(100),
  resourceType: z.string().max(100).nullable().optional(),
  metadata: z.string().nullable().optional(), // JSON string
});

/**
 * Audit log select schema.
 */
export const selectAuditLogSchema = createSelectSchema(auditLogs);

/**
 * Audit log entry input (for logAuditEvent function).
 */
export const auditLogEntrySchema = z.object({
  tenantId: z.uuid().optional(),
  userId: z.uuid().optional(),
  action: z.string().min(1).max(100),
  resourceType: z.string().max(100).optional(),
  resourceId: z.uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Common audit actions enum.
 */
export const auditActionSchema = z.enum([
  // Auth
  "auth.login",
  "auth.logout",
  "auth.register",
  // Tenant
  "tenant.create",
  "tenant.update",
  "tenant.delete",
  // Team
  "team.invite",
  "team.remove",
  "team.role_change",
  // API Keys
  "api_key.create",
  "api_key.revoke",
  // Settings
  "settings.update",
]);

// Type exports
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SelectAuditLog = z.infer<typeof selectAuditLogSchema>;
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
export type AuditAction = z.infer<typeof auditActionSchema>;
