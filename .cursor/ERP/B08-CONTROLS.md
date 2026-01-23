# B08 — Controls & Governance
## RBAC, Policies & PDR (Protect, Detect, React)

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |                             |           |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------------------------: | :-------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | [B07](./B07-ACCOUNTING.md)  | **[B08]** |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |         Accounting          |  Controls |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §6 (PROTECT. DETECT. REACT.), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B8
>
> **Tag:** `CONTROLS` | `RBAC` | `POLICIES` | `PDR` | `PHASE-B8`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B08 Controls schemas follow the **Single Source of Truth** pattern:

| Component              | Source                                             |
| ---------------------- | -------------------------------------------------- |
| Role/Permission enums  | `@axis/registry/schemas/controls/constants.ts`     |
| Role schema            | `@axis/registry/schemas/controls/role.ts`          |
| Permission schema      | `@axis/registry/schemas/controls/permission.ts`    |
| Policy schema          | `@axis/registry/schemas/controls/policy.ts`        |
| Danger Zone schema     | `@axis/registry/schemas/controls/danger-zone.ts`   |
| Audit Extension schema | `@axis/registry/schemas/controls/audit.ts`         |
| Controls events        | `@axis/registry/schemas/events/controls.ts`        |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"PROTECT. DETECT. REACT."*

From A01 §6:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          THE PDR MANTRA                                      │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     PROTECT: Prevent unauthorized actions before they happen      ║    │
│    ║     DETECT:  Find anomalies, exceptions, policy violations        ║    │
│    ║     REACT:   Alert, escalate, remediate, audit                    ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    Security is not a feature. It's a mindset embedded in every layer.       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without PROTECT, anyone can do anything
- Without DETECT, fraud goes unnoticed
- Without REACT, knowledge of breaches is useless

---

## 2) The Controls Model

### 2.1 Controls Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTROLS HIERARCHY                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                           TENANT                                         ││
│  │  Organization-level policies and role definitions                        ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────────────────┐│
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │     ROLES     │         │   POLICIES    │         │  DANGER ZONES │     ││
│  │  (Who can)    │         │  (What rules) │         │  (Exceptions) │     ││
│  └───────┬───────┘         └───────┬───────┘         └───────┬───────┘     ││
│          │                          │                          │            ││
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │  PERMISSIONS  │         │    RULES      │         │   APPROVALS   │     ││
│  │  (Actions)    │         │  (Conditions) │         │  (Overrides)  │     ││
│  └───────────────┘         └───────────────┘         └───────────────┘     ││
│                                                                              │
│  FLOW:                                                                       │
│  Request → Check Role → Check Permission → Evaluate Policy → Allow/Deny     │
│                                                                              │
│  DANGER ZONE FLOW:                                                           │
│  Denied Action → Request Override → Approval Required → Audit Log           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Controls Domain Ownership

| Entity Category       | Tables (Prefix)    | Description                              |
| --------------------- | ------------------ | ---------------------------------------- |
| **Roles**             | `ctrl_roles`       | Named permission bundles                 |
| **Permissions**       | `ctrl_permissions` | Atomic action definitions                |
| **Role Permissions**  | `ctrl_role_perms`  | Role → Permission mappings               |
| **User Roles**        | `ctrl_user_roles`  | User → Role assignments                  |
| **Policies**          | `ctrl_policies`    | Business rules and constraints           |
| **Policy Rules**      | `ctrl_policy_rules`| Conditions and actions                   |
| **Danger Zones**      | `ctrl_danger_zones`| Override-required actions                |
| **Approvals**         | `ctrl_approvals`   | Pending/completed override requests      |
| **Audit Extensions**  | `ctrl_audit_ext`   | Extended audit metadata                  |

---

## 3) Role-Based Access Control (RBAC)

### 3.1 Permission Model

```typescript
// packages/axis-registry/src/schemas/controls/constants.ts

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

export const PERMISSION_SCOPE = [
  "own",      // Only own records
  "team",     // Team records
  "tenant",   // All tenant records
] as const;
```

### 3.2 Permission Schema

```typescript
// packages/axis-registry/src/schemas/controls/permission.ts

import { z } from "zod";

export const permissionSchema = z.object({
  id: z.string().uuid(),
  
  // Identity
  code: z.string().min(1).max(100), // e.g., "sales.order.approve"
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  
  // Classification
  domain: z.enum(PERMISSION_DOMAIN),
  resource: z.string().min(1).max(50), // e.g., "order", "invoice", "journal"
  action: z.enum(PERMISSION_ACTION),
  
  // Scope
  defaultScope: z.enum(PERMISSION_SCOPE).default("own"),
  
  // System flag (cannot be modified by tenant)
  isSystem: z.boolean().default(false),
  
  createdAt: z.string().datetime(),
});

export type Permission = z.infer<typeof permissionSchema>;

// Common permission codes
export const PERMISSION_CODES = {
  // Sales
  SALES_ORDER_CREATE: "sales.order.create",
  SALES_ORDER_APPROVE: "sales.order.approve",
  SALES_INVOICE_POST: "sales.invoice.post",
  SALES_INVOICE_VOID: "sales.invoice.void",
  
  // Purchase
  PURCHASE_PO_CREATE: "purchase.po.create",
  PURCHASE_PO_APPROVE: "purchase.po.approve",
  PURCHASE_BILL_POST: "purchase.bill.post",
  
  // Inventory
  INVENTORY_ADJUST: "inventory.adjustment.create",
  INVENTORY_TRANSFER: "inventory.transfer.create",
  INVENTORY_COUNT: "inventory.count.create",
  
  // Accounting
  ACCOUNTING_JOURNAL_CREATE: "accounting.journal.create",
  ACCOUNTING_JOURNAL_POST: "accounting.journal.post",
  ACCOUNTING_PERIOD_CLOSE: "accounting.period.close",
  
  // Controls
  CONTROLS_ROLE_MANAGE: "controls.role.configure",
  CONTROLS_POLICY_MANAGE: "controls.policy.configure",
  CONTROLS_OVERRIDE: "controls.dangerzone.override",
} as const;
```

### 3.3 Role Schema

```typescript
// packages/axis-registry/src/schemas/controls/role.ts

export const ROLE_TYPE = [
  "system",   // Built-in, cannot delete (e.g., Owner, Admin)
  "custom",   // Tenant-defined
] as const;

export const roleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  
  // Type
  roleType: z.enum(ROLE_TYPE).default("custom"),
  
  // Hierarchy
  parentRoleId: z.string().uuid().optional(), // Inherits permissions
  level: z.number().int().min(0).default(0),
  
  // Status
  isActive: z.boolean().default(true),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export const rolePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
  
  // Override default scope
  scope: z.enum(PERMISSION_SCOPE).optional(),
  
  // Conditions (JSON rules)
  conditions: z.record(z.unknown()).optional(),
  
  grantedAt: z.string().datetime(),
  grantedBy: z.string().uuid(),
});

export const userRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Effective period
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  
  assignedAt: z.string().datetime(),
  assignedBy: z.string().uuid(),
});

export type Role = z.infer<typeof roleSchema>;
export type RolePermission = z.infer<typeof rolePermissionSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
```

### 3.4 Standard Roles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STANDARD ROLE HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  OWNER (System Role)                                                     ││
│  │  • Full access to everything                                             ││
│  │  • Cannot be removed from tenant                                         ││
│  │  • Can manage other owners                                               ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ADMIN (System Role)                                                     ││
│  │  • Configure tenant settings                                             ││
│  │  • Manage users and roles                                                ││
│  │  • Cannot override Owner actions                                         ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────────────────┐│
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │ SALES_MANAGER │         │PURCHASE_MANAGER│        │FINANCE_MANAGER│     ││
│  │ • Approve SOs │         │ • Approve POs  │        │ • Post journals│     ││
│  │ • Void invoices│        │ • Match bills  │        │ • Close periods│     ││
│  └───────┬───────┘         └───────┬───────┘         └───────┬───────┘     ││
│          │                          │                          │            ││
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │  SALES_USER   │         │ PURCHASE_USER │         │ ACCOUNTANT    │     ││
│  │ • Create SOs  │         │ • Create PRs  │         │ • Create JEs  │     ││
│  │ • View reports│         │ • Create POs  │         │ • View reports│     ││
│  └───────────────┘         └───────────────┘         └───────────────┘     ││
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  VIEWER (System Role)                                                    ││
│  │  • Read-only access to assigned modules                                  ││
│  │  • No create/update/delete                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Permission Check Logic

```typescript
// packages/db/src/queries/controls/rbac.ts

/**
 * Check if user has permission for action
 */
export async function hasPermission(
  db: Database,
  userId: string,
  tenantId: string,
  permissionCode: string,
  resourceId?: string
): Promise<{
  allowed: boolean;
  scope: PermissionScope;
  conditions?: Record<string, unknown>;
  denyReason?: string;
}> {
  // 1. Get user's active roles
  const userRoles = await db.query.userRoles.findMany({
    where: and(
      eq(userRoles.userId, userId),
      eq(userRoles.tenantId, tenantId),
      lte(userRoles.effectiveFrom, new Date()),
      or(
        isNull(userRoles.effectiveTo),
        gte(userRoles.effectiveTo, new Date())
      )
    ),
    with: {
      role: {
        with: {
          permissions: true,
        },
      },
    },
  });
  
  if (userRoles.length === 0) {
    return { allowed: false, scope: "own", denyReason: "No active roles" };
  }
  
  // 2. Find matching permission
  const permission = await db.query.permissions.findFirst({
    where: eq(permissions.code, permissionCode),
  });
  
  if (!permission) {
    return { allowed: false, scope: "own", denyReason: "Permission not found" };
  }
  
  // 3. Check if any role grants this permission
  let maxScope: PermissionScope = "own";
  let grantedConditions: Record<string, unknown> | undefined;
  
  for (const userRole of userRoles) {
    const rolePermission = userRole.role.permissions.find(
      rp => rp.permissionId === permission.id
    );
    
    if (rolePermission) {
      // Upgrade scope to highest granted
      const scope = rolePermission.scope || permission.defaultScope;
      if (scopeRank(scope) > scopeRank(maxScope)) {
        maxScope = scope;
        grantedConditions = rolePermission.conditions;
      }
    }
    
    // Also check inherited permissions from parent role
    if (userRole.role.parentRoleId) {
      const inherited = await checkInheritedPermission(
        db, userRole.role.parentRoleId, permission.id
      );
      if (inherited) {
        maxScope = "tenant"; // Parent roles typically grant broader access
      }
    }
  }
  
  // 4. Apply scope check if resourceId provided
  if (resourceId && maxScope !== "tenant") {
    const scopeAllowed = await checkScopeAccess(
      db, userId, tenantId, resourceId, maxScope
    );
    if (!scopeAllowed) {
      return { 
        allowed: false, 
        scope: maxScope, 
        denyReason: "Resource outside user scope" 
      };
    }
  }
  
  return {
    allowed: true,
    scope: maxScope,
    conditions: grantedConditions,
  };
}

function scopeRank(scope: PermissionScope): number {
  switch (scope) {
    case "own": return 1;
    case "team": return 2;
    case "tenant": return 3;
  }
}

/**
 * Require permission - throws if denied
 */
export async function requirePermission(
  db: Database,
  userId: string,
  tenantId: string,
  permissionCode: string,
  resourceId?: string
): Promise<void> {
  const result = await hasPermission(db, userId, tenantId, permissionCode, resourceId);
  
  if (!result.allowed) {
    throw new PermissionDeniedError({
      userId,
      tenantId,
      permission: permissionCode,
      reason: result.denyReason,
    });
  }
}
```

---

## 4) Policies

### 4.1 Policy Types

```typescript
// packages/axis-registry/src/schemas/controls/policy.ts

export const POLICY_TYPE = [
  "approval",       // Requires approval based on conditions
  "limit",          // Enforces numeric limits
  "segregation",    // Segregation of duties
  "validation",     // Data validation rules
  "automation",     // Automatic actions
] as const;

export const POLICY_STATUS = [
  "draft",
  "active",
  "suspended",
  "archived",
] as const;

export const POLICY_SCOPE = [
  "global",         // Applies to all tenants
  "tenant",         // Tenant-specific
  "role",           // Role-specific
  "user",           // User-specific
] as const;
```

### 4.2 Policy Schema

```typescript
export const policySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(), // Null = global
  
  // Identity
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  
  // Type
  policyType: z.enum(POLICY_TYPE),
  scope: z.enum(POLICY_SCOPE).default("tenant"),
  
  // Target
  targetDomain: z.enum(PERMISSION_DOMAIN),
  targetResource: z.string().optional(),
  targetAction: z.enum(PERMISSION_ACTION).optional(),
  
  // Status
  status: z.enum(POLICY_STATUS).default("draft"),
  
  // Priority (higher = evaluated first)
  priority: z.number().int().default(0),
  
  // Effective period
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export const policyRuleSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),
  
  // Rule definition
  ruleNumber: z.number().int().positive(),
  name: z.string().max(255),
  
  // Condition (JSON Logic or simple conditions)
  conditionType: z.enum(["simple", "json_logic", "script"]),
  condition: z.unknown(), // Parsed based on conditionType
  
  // Action when condition matches
  actionType: z.enum([
    "require_approval",
    "deny",
    "warn",
    "log",
    "notify",
    "auto_approve",
  ]),
  actionParams: z.record(z.unknown()).optional(),
  
  // Enabled
  isActive: z.boolean().default(true),
});

export type Policy = z.infer<typeof policySchema>;
export type PolicyRule = z.infer<typeof policyRuleSchema>;
```

### 4.3 Common Policy Patterns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMMON POLICY PATTERNS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. APPROVAL LIMITS                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Policy: "PO Approval Limits"                                            ││
│  │  Type: approval                                                          ││
│  │                                                                          ││
│  │  Rules:                                                                  ││
│  │  • IF amount < 1000 THEN auto_approve                                    ││
│  │  • IF amount >= 1000 AND amount < 10000 THEN require_approval(manager)   ││
│  │  • IF amount >= 10000 THEN require_approval(director)                    ││
│  │  • IF amount >= 50000 THEN require_approval(owner)                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  2. SEGREGATION OF DUTIES                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Policy: "Invoice-Payment Segregation"                                   ││
│  │  Type: segregation                                                       ││
│  │                                                                          ││
│  │  Rules:                                                                  ││
│  │  • User who created invoice CANNOT approve payment for same invoice      ││
│  │  • User who approved PO CANNOT receive goods for same PO                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  3. DATA VALIDATION                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Policy: "Credit Limit Check"                                            ││
│  │  Type: validation                                                        ││
│  │                                                                          ││
│  │  Rules:                                                                  ││
│  │  • IF customer.creditUsed + order.total > customer.creditLimit           ││
│  │    THEN deny("Credit limit exceeded")                                    ││
│  │  • IF customer.status == "blocked" THEN deny("Customer blocked")         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  4. PERIOD CONTROLS                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Policy: "Fiscal Period Controls"                                        ││
│  │  Type: validation                                                        ││
│  │                                                                          ││
│  │  Rules:                                                                  ││
│  │  • IF period.status == "hard_closed" THEN deny("Period closed")          ││
│  │  • IF period.status == "soft_closed" AND                                 ││
│  │       journal.type != "adjustment" THEN deny("Only adjustments allowed") ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Policy Evaluation

```typescript
// packages/db/src/queries/controls/policy.ts

export interface PolicyEvaluationContext {
  tenantId: string;
  userId: string;
  domain: string;
  resource: string;
  action: string;
  data: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  requiresApproval: boolean;
  approvalConfig?: {
    approverRole: string;
    approverUserId?: string;
    reason: string;
  };
  warnings: string[];
  denyReason?: string;
  matchedPolicies: string[];
}

/**
 * Evaluate all applicable policies for an action
 */
export async function evaluatePolicies(
  db: Database,
  context: PolicyEvaluationContext
): Promise<PolicyEvaluationResult> {
  // 1. Find applicable policies
  const policies = await db.query.policies.findMany({
    where: and(
      eq(policies.status, "active"),
      or(
        isNull(policies.tenantId), // Global policies
        eq(policies.tenantId, context.tenantId)
      ),
      eq(policies.targetDomain, context.domain),
      or(
        isNull(policies.targetResource),
        eq(policies.targetResource, context.resource)
      ),
      or(
        isNull(policies.targetAction),
        eq(policies.targetAction, context.action)
      ),
      // Check effective dates
      or(
        isNull(policies.effectiveFrom),
        lte(policies.effectiveFrom, new Date())
      ),
      or(
        isNull(policies.effectiveTo),
        gte(policies.effectiveTo, new Date())
      )
    ),
    with: {
      rules: {
        where: eq(policyRules.isActive, true),
        orderBy: [policyRules.ruleNumber],
      },
    },
    orderBy: [desc(policies.priority)],
  });
  
  const result: PolicyEvaluationResult = {
    allowed: true,
    requiresApproval: false,
    warnings: [],
    matchedPolicies: [],
  };
  
  // 2. Evaluate each policy
  for (const policy of policies) {
    for (const rule of policy.rules) {
      const matches = evaluateCondition(rule.conditionType, rule.condition, context.data);
      
      if (matches) {
        result.matchedPolicies.push(policy.code);
        
        switch (rule.actionType) {
          case "deny":
            result.allowed = false;
            result.denyReason = rule.actionParams?.message as string || "Policy denied";
            return result; // Immediate denial
            
          case "require_approval":
            result.requiresApproval = true;
            result.approvalConfig = {
              approverRole: rule.actionParams?.approverRole as string,
              approverUserId: rule.actionParams?.approverUserId as string,
              reason: rule.name,
            };
            break;
            
          case "warn":
            result.warnings.push(rule.actionParams?.message as string || rule.name);
            break;
            
          case "log":
            await logPolicyMatch(db, context, policy, rule);
            break;
            
          case "auto_approve":
            // Skip further approval requirements
            result.requiresApproval = false;
            result.approvalConfig = undefined;
            break;
        }
      }
    }
  }
  
  return result;
}

function evaluateCondition(
  type: string,
  condition: unknown,
  data: Record<string, unknown>
): boolean {
  switch (type) {
    case "simple":
      return evaluateSimpleCondition(condition as SimpleCondition, data);
    case "json_logic":
      return jsonLogic.apply(condition, data);
    case "script":
      // Sandboxed script evaluation
      return evaluateScript(condition as string, data);
    default:
      return false;
  }
}
```

---

## 5) Danger Zones

### 5.1 Danger Zone Model

From A01 §5 (Nexus Doctrine):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DANGER ZONES                                        │
│                                                                              │
│    Some actions are too risky for normal permission checks.                  │
│    They require:                                                             │
│    • Explicit override request                                               │
│    • Manager/owner approval                                                  │
│    • Full audit trail with reason                                            │
│    • Time-limited execution window                                           │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                      DANGER ZONE ACTIONS                          ║    │
│    ╠═══════════════════════════════════════════════════════════════════╣    │
│    ║  • Posting to closed fiscal period                                ║    │
│    ║  • Voiding posted invoices                                        ║    │
│    ║  • Deleting master data with transactions                         ║    │
│    ║  • Adjusting inventory without reason                             ║    │
│    ║  • Overriding credit limits                                       ║    │
│    ║  • Approving own transactions (segregation override)              ║    │
│    ║  • Force-matching mismatched receipts                             ║    │
│    ║  • Backdating documents beyond threshold                          ║    │
│    ║  • Modifying locked configuration                                 ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Danger Zone Schema

```typescript
// packages/axis-registry/src/schemas/controls/danger-zone.ts

export const DANGER_ZONE_TYPE = [
  "period_override",      // Post to closed period
  "document_void",        // Void posted document
  "master_data_delete",   // Delete master data with references
  "inventory_adjust",     // Inventory adjustment without count
  "credit_override",      // Override credit limit
  "segregation_override", // Override segregation of duties
  "match_override",       // Force-match mismatched documents
  "backdate",             // Backdate beyond threshold
  "config_modify",        // Modify locked configuration
  "bulk_operation",       // Bulk delete/modify
] as const;

export const DANGER_ZONE_STATUS = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "executed",
  "cancelled",
] as const;

export const dangerZoneRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Type
  dangerZoneType: z.enum(DANGER_ZONE_TYPE),
  
  // Request
  requestedBy: z.string().uuid(),
  requestedAt: z.string().datetime(),
  reason: z.string().min(10).max(1000), // Must explain why
  
  // Context
  targetDocumentType: z.string(),
  targetDocumentId: z.string().uuid(),
  targetDocumentNumber: z.string().optional(),
  
  // Action details
  actionDetails: z.record(z.unknown()),
  
  // Status
  status: z.enum(DANGER_ZONE_STATUS).default("pending"),
  
  // Approval
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  approvalNotes: z.string().max(1000).optional(),
  
  // Rejection
  rejectedBy: z.string().uuid().optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectionReason: z.string().max(1000).optional(),
  
  // Execution
  executedAt: z.string().datetime().optional(),
  executionResult: z.record(z.unknown()).optional(),
  
  // Expiry
  expiresAt: z.string().datetime(), // Must execute within window
  
  // Audit
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DangerZoneRequest = z.infer<typeof dangerZoneRequestSchema>;
```

### 5.3 Danger Zone Flow

```typescript
// packages/db/src/queries/controls/danger-zone.ts

/**
 * Request a danger zone override
 */
export async function requestDangerZoneOverride(
  db: Database,
  tenantId: string,
  userId: string,
  request: {
    type: DangerZoneType;
    targetDocumentType: string;
    targetDocumentId: string;
    reason: string;
    actionDetails: Record<string, unknown>;
  }
): Promise<DangerZoneRequest> {
  // 1. Validate reason length
  if (request.reason.length < 10) {
    throw new Error("Danger zone requests require a detailed reason (min 10 chars)");
  }
  
  // 2. Calculate expiry (default: 24 hours)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  // 3. Create request
  const dangerZoneRequest = await db.insert(dangerZoneRequests).values({
    id: generateUUID(),
    tenantId,
    dangerZoneType: request.type,
    requestedBy: userId,
    requestedAt: new Date().toISOString(),
    reason: request.reason,
    targetDocumentType: request.targetDocumentType,
    targetDocumentId: request.targetDocumentId,
    actionDetails: request.actionDetails,
    status: "pending",
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).returning();
  
  // 4. Notify approvers
  await notifyDangerZoneApprovers(db, tenantId, dangerZoneRequest[0]);
  
  // 5. Emit event
  await writeToOutbox(db, tenantId, {
    eventType: "dangerzone.requested",
    eventId: generateUUID(),
    correlationId: dangerZoneRequest[0].id,
    sourceDomain: "controls",
    sourceAggregateId: dangerZoneRequest[0].id,
    sourceAggregateType: "danger_zone_request",
    payload: {
      requestId: dangerZoneRequest[0].id,
      type: request.type,
      requestedBy: userId,
      reason: request.reason,
    },
  });
  
  return dangerZoneRequest[0];
}

/**
 * Approve a danger zone request
 */
export async function approveDangerZoneRequest(
  db: Database,
  tenantId: string,
  approverId: string,
  requestId: string,
  notes?: string
): Promise<DangerZoneRequest> {
  return db.transaction(async (tx) => {
    // 1. Get request
    const request = await tx.query.dangerZoneRequests.findFirst({
      where: and(
        eq(dangerZoneRequests.id, requestId),
        eq(dangerZoneRequests.tenantId, tenantId)
      ),
    });
    
    if (!request) {
      throw new Error("Danger zone request not found");
    }
    
    // 2. Validate status
    if (request.status !== "pending") {
      throw new Error(`Cannot approve request with status: ${request.status}`);
    }
    
    // 3. Check expiry
    if (new Date(request.expiresAt) < new Date()) {
      throw new Error("Danger zone request has expired");
    }
    
    // 4. Validate approver is not requester (segregation)
    if (request.requestedBy === approverId) {
      throw new Error("Cannot approve own danger zone request");
    }
    
    // 5. Validate approver has override permission
    await requirePermission(
      tx, approverId, tenantId, PERMISSION_CODES.CONTROLS_OVERRIDE
    );
    
    // 6. Update request
    const updated = await tx.update(dangerZoneRequests)
      .set({
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
        approvalNotes: notes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(dangerZoneRequests.id, requestId))
      .returning();
    
    // 7. Emit event
    await writeToOutbox(tx, tenantId, {
      eventType: "dangerzone.approved",
      eventId: generateUUID(),
      correlationId: requestId,
      sourceDomain: "controls",
      sourceAggregateId: requestId,
      sourceAggregateType: "danger_zone_request",
      payload: {
        requestId,
        type: request.dangerZoneType,
        approvedBy: approverId,
      },
    });
    
    return updated[0];
  });
}

/**
 * Execute an approved danger zone action
 */
export async function executeDangerZoneAction(
  db: Database,
  tenantId: string,
  executorId: string,
  requestId: string
): Promise<{
  success: boolean;
  result: Record<string, unknown>;
}> {
  return db.transaction(async (tx) => {
    // 1. Get and validate request
    const request = await tx.query.dangerZoneRequests.findFirst({
      where: eq(dangerZoneRequests.id, requestId),
    });
    
    if (request.status !== "approved") {
      throw new Error("Danger zone request is not approved");
    }
    
    if (new Date(request.expiresAt) < new Date()) {
      throw new Error("Danger zone request has expired");
    }
    
    // 2. Execute the dangerous action based on type
    let result: Record<string, unknown>;
    
    switch (request.dangerZoneType) {
      case "period_override":
        result = await executeClosedPeriodPost(tx, request);
        break;
      case "document_void":
        result = await executeDocumentVoid(tx, request);
        break;
      case "inventory_adjust":
        result = await executeInventoryAdjustment(tx, request);
        break;
      // ... other danger zone types
      default:
        throw new Error(`Unknown danger zone type: ${request.dangerZoneType}`);
    }
    
    // 3. Update request status
    await tx.update(dangerZoneRequests)
      .set({
        status: "executed",
        executedAt: new Date().toISOString(),
        executionResult: result,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(dangerZoneRequests.id, requestId));
    
    // 4. Create audit log
    await createAuditLog(tx, {
      tenantId,
      userId: executorId,
      action: "danger_zone_executed",
      resourceType: request.targetDocumentType,
      resourceId: request.targetDocumentId,
      metadata: {
        dangerZoneType: request.dangerZoneType,
        requestId,
        reason: request.reason,
        approvedBy: request.approvedBy,
      },
    });
    
    return { success: true, result };
  });
}
```

---

## 6) Audit Extensions

### 6.1 Extended Audit Schema

```typescript
// packages/axis-registry/src/schemas/controls/audit.ts

export const AUDIT_SEVERITY = [
  "info",
  "warning",
  "critical",
] as const;

export const auditExtensionSchema = z.object({
  id: z.string().uuid(),
  auditLogId: z.string().uuid(), // Links to core audit_logs
  
  // Classification
  severity: z.enum(AUDIT_SEVERITY).default("info"),
  category: z.string().max(50),
  
  // Context
  sessionId: z.string().uuid().optional(),
  requestId: z.string().uuid().optional(),
  
  // Client info
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
  geoLocation: z.string().max(100).optional(),
  
  // Data snapshot
  beforeState: z.record(z.unknown()).optional(),
  afterState: z.record(z.unknown()).optional(),
  changedFields: z.array(z.string()).optional(),
  
  // Policy context
  matchedPolicies: z.array(z.string()).optional(),
  dangerZoneRequestId: z.string().uuid().optional(),
  
  // Timestamps
  createdAt: z.string().datetime(),
});

export type AuditExtension = z.infer<typeof auditExtensionSchema>;
```

### 6.2 Audit Query Functions

```typescript
// packages/db/src/queries/controls/audit.ts

/**
 * Query audit trail for a document
 */
export async function getDocumentAuditTrail(
  db: Database,
  tenantId: string,
  documentType: string,
  documentId: string
): Promise<AuditEntry[]> {
  return db.query.auditLogs.findMany({
    where: and(
      eq(auditLogs.tenantId, tenantId),
      eq(auditLogs.resourceType, documentType),
      eq(auditLogs.resourceId, documentId)
    ),
    with: {
      extensions: true,
      user: {
        columns: { id: true, email: true, name: true },
      },
    },
    orderBy: [desc(auditLogs.createdAt)],
  });
}

/**
 * Query suspicious activity
 */
export async function querySuspiciousActivity(
  db: Database,
  tenantId: string,
  filters: {
    severity?: AuditSeverity;
    category?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
  }
): Promise<AuditEntry[]> {
  return db.query.auditLogs.findMany({
    where: and(
      eq(auditLogs.tenantId, tenantId),
      filters.severity ? eq(auditExtensions.severity, filters.severity) : undefined,
      filters.category ? eq(auditExtensions.category, filters.category) : undefined,
      filters.userId ? eq(auditLogs.userId, filters.userId) : undefined,
      filters.fromDate ? gte(auditLogs.createdAt, filters.fromDate) : undefined,
      filters.toDate ? lte(auditLogs.createdAt, filters.toDate) : undefined,
    ),
    with: {
      extensions: true,
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit: 1000,
  });
}
```

---

## 7) Controls Events

```typescript
// packages/axis-registry/src/schemas/events/controls.ts

export const roleAssignedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("role.assigned"),
  payload: z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
    roleName: z.string(),
    assignedBy: z.string().uuid(),
    effectiveFrom: z.string().datetime(),
  }),
});

export const policyViolatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("policy.violated"),
  payload: z.object({
    policyId: z.string().uuid(),
    policyCode: z.string(),
    userId: z.string().uuid(),
    action: z.string(),
    resource: z.string(),
    resourceId: z.string().uuid(),
    violationType: z.string(),
  }),
});

export const dangerZoneRequestedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("dangerzone.requested"),
  payload: z.object({
    requestId: z.string().uuid(),
    type: z.enum(DANGER_ZONE_TYPE),
    requestedBy: z.string().uuid(),
    targetDocumentType: z.string(),
    targetDocumentId: z.string().uuid(),
    reason: z.string(),
  }),
});

export const dangerZoneApprovedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("dangerzone.approved"),
  payload: z.object({
    requestId: z.string().uuid(),
    type: z.enum(DANGER_ZONE_TYPE),
    approvedBy: z.string().uuid(),
  }),
});

export const dangerZoneExecutedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("dangerzone.executed"),
  payload: z.object({
    requestId: z.string().uuid(),
    type: z.enum(DANGER_ZONE_TYPE),
    executedBy: z.string().uuid(),
    result: z.record(z.unknown()),
  }),
});
```

---

## 8) Controls Configuration

```typescript
// packages/axis-registry/src/schemas/controls/config.ts

export const controlsConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Session settings
  sessionTimeoutMinutes: z.number().int().min(5).default(60),
  maxConcurrentSessions: z.number().int().min(1).default(3),
  
  // Password policy
  passwordMinLength: z.number().int().min(8).default(12),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireLowercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSpecial: z.boolean().default(true),
  passwordExpiryDays: z.number().int().min(0).default(90), // 0 = never
  passwordHistoryCount: z.number().int().min(0).default(5), // Prevent reuse
  
  // MFA
  mfaRequired: z.boolean().default(false),
  mfaRequiredForRoles: z.array(z.string()).default([]),
  
  // Danger zones
  dangerZoneExpiryHours: z.number().int().min(1).default(24),
  dangerZoneRequireReason: z.boolean().default(true),
  dangerZoneMinReasonLength: z.number().int().min(0).default(10),
  
  // Audit
  auditRetentionDays: z.number().int().min(30).default(2555), // 7 years
  auditHighRiskActions: z.array(z.string()).default([
    "document_void",
    "period_override",
    "master_data_delete",
  ]),
  
  // Rate limiting
  maxFailedLoginAttempts: z.number().int().min(3).default(5),
  lockoutDurationMinutes: z.number().int().min(5).default(30),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type ControlsConfig = z.infer<typeof controlsConfigSchema>;
```

---

## 9) Exit Criteria (B8 Gate)

**B8 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | RBAC with roles and permissions                        | ✅        | `roleSchema`, `permissionSchema` defined     |
| 2   | Permission check function works                        | ✅        | `hasPermission()` logic defined              |
| 3   | Scoped permissions (own/team/tenant)                   | ✅        | `PERMISSION_SCOPE` implemented               |
| 4   | Policy engine evaluates rules                          | ✅        | `evaluatePolicies()` logic defined           |
| 5   | Approval limit policies configurable                   | ✅        | `policyRuleSchema` with conditions           |
| 6   | Segregation of duties enforced                         | ✅        | Policy type: `segregation`                   |
| 7   | Danger zones require approval + reason                 | ✅        | `dangerZoneRequestSchema` defined            |
| 8   | Danger zone actions have expiry                        | ✅        | `expiresAt` field enforced                   |
| 9   | Extended audit with before/after states                | ✅        | `auditExtensionSchema` defined               |
| 10  | Controls events published to outbox                    | ✅        | B02 outbox integration ready                 |
| 11  | Standard role hierarchy defined                        | ✅        | Owner → Admin → Manager → User               |
| 12  | Controls configuration per tenant                      | ✅        | `controlsConfigSchema` defined               |

### Implementation Files

| Component             | Location                                                   |
| --------------------- | ---------------------------------------------------------- |
| Controls Constants    | `packages/axis-registry/src/schemas/controls/constants.ts` |
| Role Schemas          | `packages/axis-registry/src/schemas/controls/role.ts`      |
| Permission Schemas    | `packages/axis-registry/src/schemas/controls/permission.ts`|
| Policy Schemas        | `packages/axis-registry/src/schemas/controls/policy.ts`    |
| Danger Zone Schemas   | `packages/axis-registry/src/schemas/controls/danger-zone.ts`|
| Audit Schemas         | `packages/axis-registry/src/schemas/controls/audit.ts`     |
| Controls Tables       | `packages/db/src/schema/controls/*.ts`                     |
| Controls Events       | `packages/axis-registry/src/schemas/events/controls.ts`    |

---

## 10) Integration with Other Phases

| Phase               | Dependency on B08         | What B08 Provides                    |
| ------------------- | ------------------------- | ------------------------------------ |
| **B01** (Posting)   | Danger Zone hooks         | Override for closed period posting   |
| **B02** (Domains)   | Event contracts           | Controls event schemas               |
| **B04** (Sales)     | Approval policies         | SO/Invoice approval limits           |
| **B05** (Purchase)  | Approval policies         | PR/PO approval limits                |
| **B06** (Inventory) | Adjustment controls       | Inventory adjustment approvals       |
| **B07** (Accounting)| Period close controls     | Soft/hard close Danger Zones         |
| **B08-01** (Workflow)| Base approval framework  | Policy evaluation for workflows      |
| **B09** (Reconciliation)| Audit queries         | Exception investigation              |

---

## 11) Related: B08-01 Workflow

> **See [B08-01-WORKFLOW.md](./B08-01-WORKFLOW.md) for:**
> - Multi-step approval workflows
> - Delegation and proxy approval
> - Escalation and timeout handling
> - State machine integration
> - Notification triggers

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B8 (Controls)                                   |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: Workflow integration defined in B08-01-WORKFLOW.md.

---

## Related Documents

| Document                                       | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §6 (PDR Mantra)                |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)           | Roadmap: Phase B8 definition               |
| [B01-DOCUMENTATION.md](./B01-DOCUMENTATION.md) | Posting Spine (Danger Zone hooks)          |
| [B02-DOMAINS.md](./B02-DOMAINS.md)             | Domain boundaries (Controls domain)        |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)       | Accounting (period close controls)         |
| [B08-01-WORKFLOW.md](./B08-01-WORKFLOW.md)     | Workflow (approval workflows)              |

---

> *"PROTECT. DETECT. REACT. Security is not a feature — it's a mindset embedded in every layer."*
