/**
 * Audit logging utilities.
 *
 * Pattern: Log all important actions for security and compliance.
 * Uses Zod schema from @axis/db for validation.
 */

import { query } from "./index";
import { headers } from "next/headers";
import {
  auditLogEntrySchema,
  auditActionSchema,
  type AuditLogEntry,
  type AuditAction,
} from "@axis/db/validation";
import { logger } from "../logger";

// Re-export types and schema
export { auditLogEntrySchema, auditActionSchema };
export type { AuditLogEntry, AuditAction };

/**
 * Log an action to the audit log.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const headerStore = await headers();
    const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? headerStore.get("x-real-ip")
      ?? null;
    const userAgent = headerStore.get("user-agent") ?? null;

    await query(async (sql) => {
      // Handle nullable UUID values properly
      const tenantId = entry.tenantId ?? null;
      const userId = entry.userId ?? null;
      const resourceId = entry.resourceId ?? null;
      const metadata = entry.metadata ? JSON.stringify(entry.metadata) : "{}";

      return sql`
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
        VALUES (
          ${tenantId}::uuid,
          ${userId}::uuid,
          ${entry.action},
          ${entry.resourceType ?? null},
          ${resourceId}::uuid,
          ${metadata}::jsonb,
          ${ipAddress}::inet,
          ${userAgent}
        )
      `;
    });
  } catch (error) {
    // Don't throw on audit log failures - just log
    logger.error("Failed to log audit event", error);
  }
}

/**
 * Common audit actions.
 */
export const AuditActions = {
  // Auth
  LOGIN: "auth.login",
  LOGOUT: "auth.logout",
  REGISTER: "auth.register",

  // Tenant
  TENANT_CREATE: "tenant.create",
  TENANT_UPDATE: "tenant.update",
  TENANT_DELETE: "tenant.delete",

  // Team
  MEMBER_INVITE: "team.invite",
  MEMBER_REMOVE: "team.remove",
  MEMBER_ROLE_CHANGE: "team.role_change",

  // API Keys
  API_KEY_CREATE: "api_key.create",
  API_KEY_REVOKE: "api_key.revoke",

  // Settings
  SETTINGS_UPDATE: "settings.update",
} as const;
