/**
 * Controls Domain Constants (B08)
 *
 * RBAC, Policies & PDR (Protect, Detect, React)
 */

// ============================================================================
// Permission Domain
// ============================================================================

export const PERMISSION_DOMAIN = [
  "core",
  "mdm",
  "sales",
  "purchase",
  "inventory",
  "accounting",
  "controls",
  "reporting",
] as const;

export type PermissionDomain = (typeof PERMISSION_DOMAIN)[number];

// ============================================================================
// Permission Action
// ============================================================================

export const PERMISSION_ACTION = [
  // CRUD
  "create",
  "read",
  "update",
  "delete",

  // Lifecycle
  "submit",
  "approve",
  "reject",
  "post",
  "void",
  "reverse",

  // Special
  "export",
  "import",
  "configure",
  "audit",
  "override",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTION)[number];

// ============================================================================
// Permission Scope
// ============================================================================

export const PERMISSION_SCOPE = ["own", "team", "tenant"] as const;

export type PermissionScope = (typeof PERMISSION_SCOPE)[number];

// ============================================================================
// Role Types
// ============================================================================

export const ROLE_TYPE = ["system", "custom"] as const;

export type RoleType = (typeof ROLE_TYPE)[number];

// ============================================================================
// Policy Types
// ============================================================================

export const POLICY_TYPE = [
  "approval",
  "limit",
  "segregation",
  "validation",
  "automation",
] as const;

export type PolicyType = (typeof POLICY_TYPE)[number];

export const POLICY_STATUS = ["draft", "active", "suspended", "archived"] as const;

export type PolicyStatus = (typeof POLICY_STATUS)[number];

export const POLICY_SCOPE = ["global", "tenant", "role", "user"] as const;

export type PolicyScope = (typeof POLICY_SCOPE)[number];

// ============================================================================
// Policy Rule Types
// ============================================================================

export const CONDITION_TYPE = ["simple", "json_logic", "script"] as const;

export type ConditionType = (typeof CONDITION_TYPE)[number];

export const RULE_ACTION_TYPE = [
  "require_approval",
  "deny",
  "warn",
  "log",
  "notify",
  "auto_approve",
] as const;

export type RuleActionType = (typeof RULE_ACTION_TYPE)[number];

// ============================================================================
// Danger Zone Types
// ============================================================================

export const DANGER_ZONE_TYPE = [
  "period_override",
  "document_void",
  "master_data_delete",
  "inventory_adjust",
  "credit_override",
  "segregation_override",
  "match_override",
  "backdate",
  "config_modify",
  "bulk_operation",
] as const;

export type DangerZoneType = (typeof DANGER_ZONE_TYPE)[number];

export const DANGER_ZONE_STATUS = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "executed",
  "cancelled",
] as const;

export type DangerZoneStatus = (typeof DANGER_ZONE_STATUS)[number];

// ============================================================================
// Audit Severity
// ============================================================================

export const AUDIT_SEVERITY = ["info", "warning", "critical"] as const;

export type AuditSeverity = (typeof AUDIT_SEVERITY)[number];
