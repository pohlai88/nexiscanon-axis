# B08-01 — Workflow Engine
## Approvals, State Machines & Process Orchestration

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |                             |                           |               |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------------------------: | :-----------------------: | :-----------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | [B07](./B07-ACCOUNTING.md)  | [B08](./B08-CONTROLS.md)  | **[B08-01]**  |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |         Accounting          |         Controls          |   Workflow    |

---

> **Derived From:** [B08-CONTROLS.md](./B08-CONTROLS.md) (Approval Framework), [A01-CANONICAL.md](./A01-CANONICAL.md) §7 (Human-Machine Symbiosis)
>
> **Tag:** `WORKFLOW` | `APPROVAL` | `STATE-MACHINE` | `PHASE-B8-01`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B08-01 Workflow schemas follow the **Single Source of Truth** pattern:

| Component                | Source                                               |
| ------------------------ | ---------------------------------------------------- |
| Workflow types/enums     | `@axis/registry/schemas/workflow/constants.ts`       |
| Workflow Definition      | `@axis/registry/schemas/workflow/definition.ts`      |
| Workflow Instance        | `@axis/registry/schemas/workflow/instance.ts`        |
| Approval Task            | `@axis/registry/schemas/workflow/task.ts`            |
| Delegation schema        | `@axis/registry/schemas/workflow/delegation.ts`      |
| Escalation schema        | `@axis/registry/schemas/workflow/escalation.ts`      |
| Workflow events          | `@axis/registry/schemas/events/workflow.ts`          |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"Human judgment gates machine speed."*

From A01 §7 (Human-Machine Symbiosis):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE WORKFLOW PRINCIPLE                                   │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     MACHINES EXECUTE. HUMANS APPROVE.                             ║    │
│    ║                                                                   ║    │
│    ║     Workflows ensure:                                             ║    │
│    ║     • The right person approves at the right time                 ║    │
│    ║     • No document proceeds without required sign-off              ║    │
│    ║     • Absence doesn't block business (delegation)                 ║    │
│    ║     • Stalled work surfaces automatically (escalation)            ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    Approval workflows are the bridge between automation and control.         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without workflows, approvals are ad-hoc and inconsistent
- Without delegation, one person's absence blocks the entire company
- Without escalation, forgotten tasks pile up silently
- Without state machines, document status becomes guesswork

---

## 2) The Workflow Model

### 2.1 Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WORKFLOW ARCHITECTURE                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   WORKFLOW DEFINITION                                    ││
│  │  Template that defines approval steps, conditions, and routing          ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     │ Instantiate                            │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   WORKFLOW INSTANCE                                      ││
│  │  Runtime execution of workflow for a specific document                   ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     │ Creates                                │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   APPROVAL TASKS                                         ││
│  │  Individual approval/rejection decisions assigned to users/roles         ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────────────────┐│
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │  DELEGATION   │         │  ESCALATION   │         │ NOTIFICATION  │     ││
│  │  (Proxy)      │         │  (Timeout)    │         │  (Alerts)     │     ││
│  └───────────────┘         └───────────────┘         └───────────────┘     ││
│                                                                              │
│  FLOW:                                                                       │
│  Document Submitted → Instance Created → Tasks Assigned → Approved/Rejected  │
│                                                                              │
│  PARALLEL FLOW:                                                              │
│  Document Submitted → Multiple Tasks Created → All Approve → Continue        │
│                                                                              │
│  SEQUENTIAL FLOW:                                                            │
│  Document Submitted → Task 1 → Task 2 → Task 3 → Complete                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Workflow Domain Ownership

| Entity Category        | Tables (Prefix)       | Description                              |
| ---------------------- | --------------------- | ---------------------------------------- |
| **Definitions**        | `wf_definitions`      | Workflow templates                       |
| **Steps**              | `wf_steps`            | Steps within definitions                 |
| **Instances**          | `wf_instances`        | Running workflow executions              |
| **Tasks**              | `wf_tasks`            | Individual approval tasks                |
| **Task History**       | `wf_task_history`     | Completed task records                   |
| **Delegations**        | `wf_delegations`      | Approval delegation rules                |
| **Escalation Rules**   | `wf_escalations`      | Timeout and escalation configs           |
| **Notifications**      | `wf_notifications`    | Pending/sent notification queue          |

---

## 3) Workflow Definition

### 3.1 Definition Schema

```typescript
// packages/axis-registry/src/schemas/workflow/constants.ts

export const WORKFLOW_TYPE = [
  "approval",         // Simple approve/reject
  "review",           // Review with comments
  "multi_step",       // Sequential approval chain
  "parallel",         // Multiple approvers simultaneously
  "conditional",      // Route based on conditions
] as const;

export const WORKFLOW_STATUS = [
  "draft",
  "active",
  "suspended",
  "archived",
] as const;

export const STEP_TYPE = [
  "approval",         // Requires approval
  "notification",     // Just notify, no action required
  "condition",        // Conditional routing
  "parallel_start",   // Start parallel branch
  "parallel_end",     // Join parallel branches
  "escalation",       // Escalate to higher level
] as const;

export const APPROVER_TYPE = [
  "user",             // Specific user
  "role",             // Anyone with role
  "manager",          // Requester's manager
  "document_owner",   // Document creator
  "field_value",      // Dynamic from document field
  "script",           // Custom logic
] as const;

export const APPROVAL_MODE = [
  "any",              // Any one approver is sufficient
  "all",              // All approvers must approve
  "majority",         // Majority must approve
  "threshold",        // Specific count required
] as const;
```

```typescript
// packages/axis-registry/src/schemas/workflow/definition.ts

import { z } from "zod";

export const workflowDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  
  // Type
  workflowType: z.enum(WORKFLOW_TYPE),
  
  // Target
  targetDomain: z.string(),
  targetDocumentType: z.string(),
  targetAction: z.string(), // e.g., "submit", "post", "void"
  
  // Trigger conditions
  triggerCondition: z.record(z.unknown()).optional(), // When to start workflow
  
  // Status
  status: z.enum(WORKFLOW_STATUS).default("draft"),
  
  // Priority
  priority: z.number().int().default(0), // Higher = evaluated first
  
  // Version control
  version: z.number().int().default(1),
  isLatest: z.boolean().default(true),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export const workflowStepSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),
  
  // Ordering
  stepNumber: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  
  // Type
  stepType: z.enum(STEP_TYPE),
  
  // Approver assignment
  approverType: z.enum(APPROVER_TYPE),
  approverValue: z.string().optional(), // Role ID, User ID, field name, etc.
  
  // Multi-approver settings
  approvalMode: z.enum(APPROVAL_MODE).default("any"),
  requiredCount: z.number().int().min(1).optional(), // For threshold mode
  
  // Conditions
  condition: z.record(z.unknown()).optional(), // Skip step if false
  
  // Timeout
  timeoutHours: z.number().int().min(0).optional(),
  timeoutAction: z.enum(["escalate", "auto_approve", "auto_reject", "remind"]).optional(),
  
  // Reminder
  reminderHours: z.number().int().min(0).optional(),
  reminderRepeat: z.boolean().default(false),
  
  // Branching (for conditional workflows)
  onApproveNextStep: z.number().int().optional(), // Step number
  onRejectNextStep: z.number().int().optional(),
  
  // Parallel (for parallel workflows)
  parallelGroupId: z.string().optional(),
  
  createdAt: z.string().datetime(),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
```

### 3.2 Common Workflow Templates

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMMON WORKFLOW TEMPLATES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SINGLE APPROVAL                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │    [Submit] ──▶ [Manager Approval] ──▶ [Approved/Rejected]              ││
│  │                                                                          ││
│  │    Use case: Simple document approval                                    ││
│  │    Example: Leave request, expense < $500                                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  2. TIERED APPROVAL (Amount-based)                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │    [Submit] ──▶ [Condition: Amount]                                      ││
│  │                       │                                                  ││
│  │         ┌─────────────┼─────────────┬─────────────┐                     ││
│  │         ▼             ▼             ▼             ▼                     ││
│  │     < $1K         < $10K        < $50K        >= $50K                   ││
│  │   Auto-approve    Manager      Director       Owner                     ││
│  │                                                                          ││
│  │    Use case: Purchase orders, invoices                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  3. SEQUENTIAL MULTI-LEVEL                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │    [Submit] ──▶ [Manager] ──▶ [Finance] ──▶ [Director] ──▶ [Approved]   ││
│  │                    │              │              │                       ││
│  │                    ▼              ▼              ▼                       ││
│  │               [Rejected]     [Rejected]     [Rejected]                   ││
│  │                                                                          ││
│  │    Use case: High-value POs, contracts                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  4. PARALLEL APPROVAL                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │                        ┌──▶ [Legal] ──┐                                  ││
│  │    [Submit] ──▶ [Fork] ├──▶ [Finance] ─┼──▶ [Join] ──▶ [Approved]       ││
│  │                        └──▶ [IT] ─────┘                                  ││
│  │                                                                          ││
│  │    All must approve (mode: all)                                          ││
│  │    Use case: Vendor onboarding, new system requests                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  5. ESCALATION CHAIN                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │    [Submit] ──▶ [Manager] ──timeout(24h)──▶ [Director] ──timeout(24h)──▶││
│  │                     │                            │                       ││
│  │                     ▼                            ▼                       ││
│  │                [Approved]                   [Approved]                   ││
│  │                                                                          ││
│  │    Use case: Urgent approvals, auto-escalation                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Workflow Instance

### 4.1 Instance Schema

```typescript
// packages/axis-registry/src/schemas/workflow/instance.ts

export const INSTANCE_STATUS = [
  "pending",          // Waiting for approval
  "in_progress",      // One or more steps completed
  "approved",         // All steps approved
  "rejected",         // Rejected at any step
  "cancelled",        // Cancelled by requester
  "expired",          // Timed out without resolution
] as const;

export const workflowInstanceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Definition reference
  workflowDefinitionId: z.string().uuid(),
  workflowCode: z.string(),
  workflowVersion: z.number().int(),
  
  // Target document
  documentType: z.string(),
  documentId: z.string().uuid(),
  documentNumber: z.string().optional(),
  
  // Requester
  requestedBy: z.string().uuid(),
  requestedAt: z.string().datetime(),
  
  // Current state
  status: z.enum(INSTANCE_STATUS).default("pending"),
  currentStepNumber: z.number().int().default(1),
  
  // Context data (for condition evaluation)
  contextData: z.record(z.unknown()).optional(),
  
  // Completion
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional(),
  
  // Result
  finalDecision: z.enum(["approved", "rejected"]).optional(),
  finalComments: z.string().max(2000).optional(),
  
  // Expiry
  expiresAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WorkflowInstance = z.infer<typeof workflowInstanceSchema>;
```

### 4.2 Instance Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INSTANCE LIFECYCLE                                        │
│                                                                              │
│                           ┌──────────────┐                                   │
│                           │   PENDING    │                                   │
│                           └──────┬───────┘                                   │
│                                  │                                           │
│              ┌───────────────────┼───────────────────┐                       │
│              │                   │                   │                       │
│              ▼                   ▼                   ▼                       │
│     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│     │   CANCELLED    │  │  IN_PROGRESS   │  │    EXPIRED     │              │
│     │  (by user)     │  │                │  │  (timeout)     │              │
│     └────────────────┘  └────────┬───────┘  └────────────────┘              │
│                                  │                                           │
│              ┌───────────────────┼───────────────────┐                       │
│              │                   │                   │                       │
│              ▼                   ▼                   ▼                       │
│     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│     │    REJECTED    │  │    APPROVED    │  │   ESCALATED    │              │
│     │  (at any step) │  │  (all steps)   │  │  (continue)    │              │
│     └────────────────┘  └────────────────┘  └────────────────┘              │
│                                                                              │
│  TRANSITIONS:                                                                │
│  • PENDING → IN_PROGRESS: First step started                                 │
│  • IN_PROGRESS → APPROVED: All required approvals obtained                   │
│  • IN_PROGRESS → REJECTED: Any step rejected                                 │
│  • PENDING/IN_PROGRESS → CANCELLED: Requester cancels                        │
│  • PENDING/IN_PROGRESS → EXPIRED: No action before deadline                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5) Approval Tasks

### 5.1 Task Schema

```typescript
// packages/axis-registry/src/schemas/workflow/task.ts

export const TASK_STATUS = [
  "pending",
  "approved",
  "rejected",
  "delegated",
  "escalated",
  "expired",
  "cancelled",
] as const;

export const approvalTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Workflow reference
  workflowInstanceId: z.string().uuid(),
  workflowStepId: z.string().uuid(),
  stepNumber: z.number().int(),
  
  // Assignment
  assignedToType: z.enum(["user", "role"]),
  assignedToId: z.string().uuid(), // User ID or Role ID
  assignedToName: z.string(), // Denormalized for display
  
  // Original assignee (before delegation)
  originalAssigneeId: z.string().uuid().optional(),
  delegatedFrom: z.string().uuid().optional(), // Delegation rule ID
  
  // Status
  status: z.enum(TASK_STATUS).default("pending"),
  
  // Decision
  decision: z.enum(["approved", "rejected"]).optional(),
  decidedBy: z.string().uuid().optional(),
  decidedAt: z.string().datetime().optional(),
  comments: z.string().max(2000).optional(),
  
  // Timing
  dueAt: z.string().datetime().optional(),
  reminderSentAt: z.string().datetime().optional(),
  escalatedAt: z.string().datetime().optional(),
  
  // Priority
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const taskHistorySchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  
  // Action
  action: z.enum([
    "created",
    "viewed",
    "approved",
    "rejected",
    "delegated",
    "escalated",
    "reminded",
    "cancelled",
  ]),
  
  // Actor
  performedBy: z.string().uuid(),
  performedAt: z.string().datetime(),
  
  // Details
  comments: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ApprovalTask = z.infer<typeof approvalTaskSchema>;
export type TaskHistory = z.infer<typeof taskHistorySchema>;
```

### 5.2 Task Assignment Logic

```typescript
// packages/db/src/queries/workflow/task.ts

/**
 * Create approval tasks for a workflow step
 */
export async function createTasksForStep(
  db: Database,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<ApprovalTask[]> {
  const tasks: ApprovalTask[] = [];
  
  // Resolve approvers based on step configuration
  const approvers = await resolveApprovers(db, instance, step);
  
  // Calculate due date
  const dueAt = step.timeoutHours
    ? new Date(Date.now() + step.timeoutHours * 60 * 60 * 1000).toISOString()
    : undefined;
  
  for (const approver of approvers) {
    // Check for delegation
    const effectiveApprover = await checkDelegation(
      db, instance.tenantId, approver.id, instance.documentType
    );
    
    const task = await db.insert(approvalTasks).values({
      id: generateUUID(),
      tenantId: instance.tenantId,
      workflowInstanceId: instance.id,
      workflowStepId: step.id,
      stepNumber: step.stepNumber,
      assignedToType: effectiveApprover.type,
      assignedToId: effectiveApprover.id,
      assignedToName: effectiveApprover.name,
      originalAssigneeId: effectiveApprover.delegatedFrom ? approver.id : undefined,
      delegatedFrom: effectiveApprover.delegationId,
      status: "pending",
      dueAt,
      priority: determinePriority(instance),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    tasks.push(task[0]);
    
    // Send notification
    await sendTaskNotification(db, task[0], "assigned");
    
    // Schedule reminder if configured
    if (step.reminderHours) {
      await scheduleReminder(db, task[0], step.reminderHours);
    }
  }
  
  return tasks;
}

/**
 * Resolve approvers based on step configuration
 */
async function resolveApprovers(
  db: Database,
  instance: WorkflowInstance,
  step: WorkflowStep
): Promise<Array<{ id: string; type: "user" | "role"; name: string }>> {
  switch (step.approverType) {
    case "user":
      const user = await db.query.users.findFirst({
        where: eq(users.id, step.approverValue!),
      });
      return [{ id: user.id, type: "user", name: user.name }];
      
    case "role":
      // Return role - tasks assigned to role can be claimed by any role member
      const role = await db.query.roles.findFirst({
        where: eq(roles.id, step.approverValue!),
      });
      return [{ id: role.id, type: "role", name: role.name }];
      
    case "manager":
      const requester = await db.query.users.findFirst({
        where: eq(users.id, instance.requestedBy),
        with: { manager: true },
      });
      if (!requester.manager) {
        throw new Error("Requester has no manager assigned");
      }
      return [{ id: requester.manager.id, type: "user", name: requester.manager.name }];
      
    case "document_owner":
      // Get document and find owner
      const document = await getDocument(db, instance.documentType, instance.documentId);
      return [{ id: document.createdBy, type: "user", name: document.createdByName }];
      
    case "field_value":
      // Get approver ID from document field
      const doc = await getDocument(db, instance.documentType, instance.documentId);
      const approverId = doc[step.approverValue!];
      const approverUser = await db.query.users.findFirst({
        where: eq(users.id, approverId),
      });
      return [{ id: approverUser.id, type: "user", name: approverUser.name }];
      
    case "script":
      // Execute custom script to determine approvers
      return await executeApproverScript(db, step.approverValue!, instance);
      
    default:
      throw new Error(`Unknown approver type: ${step.approverType}`);
  }
}
```

---

## 6) Delegation

### 6.1 Delegation Schema

```typescript
// packages/axis-registry/src/schemas/workflow/delegation.ts

export const DELEGATION_TYPE = [
  "all",              // All approvals delegated
  "document_type",    // Specific document types
  "amount_threshold", // Below certain amount
] as const;

export const delegationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Delegator (who is delegating)
  delegatorId: z.string().uuid(),
  delegatorName: z.string(),
  
  // Delegate (who receives the authority)
  delegateId: z.string().uuid(),
  delegateName: z.string(),
  
  // Type
  delegationType: z.enum(DELEGATION_TYPE),
  
  // Scope (for document_type)
  documentTypes: z.array(z.string()).optional(),
  
  // Threshold (for amount_threshold)
  maxAmount: z.string().optional(), // Decimal
  currency: z.string().length(3).optional(),
  
  // Validity period
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime(),
  
  // Reason
  reason: z.string().max(500).optional(), // e.g., "Annual leave"
  
  // Status
  isActive: z.boolean().default(true),
  
  // Audit
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  revokedAt: z.string().datetime().optional(),
  revokedBy: z.string().uuid().optional(),
});

export type Delegation = z.infer<typeof delegationSchema>;
```

### 6.2 Delegation Logic

```typescript
// packages/db/src/queries/workflow/delegation.ts

/**
 * Check for active delegation and return effective approver
 */
export async function checkDelegation(
  db: Database,
  tenantId: string,
  originalApproverId: string,
  documentType: string,
  amount?: string
): Promise<{
  id: string;
  type: "user";
  name: string;
  delegatedFrom?: string;
  delegationId?: string;
}> {
  const now = new Date();
  
  // Find active delegation
  const delegation = await db.query.delegations.findFirst({
    where: and(
      eq(delegations.tenantId, tenantId),
      eq(delegations.delegatorId, originalApproverId),
      eq(delegations.isActive, true),
      lte(delegations.effectiveFrom, now),
      gte(delegations.effectiveTo, now),
      // Check delegation type matches
      or(
        eq(delegations.delegationType, "all"),
        and(
          eq(delegations.delegationType, "document_type"),
          sql`${delegations.documentTypes} @> ARRAY[${documentType}]`
        ),
        and(
          eq(delegations.delegationType, "amount_threshold"),
          amount ? sql`${delegations.maxAmount}::numeric >= ${amount}::numeric` : sql`true`
        )
      )
    ),
  });
  
  if (delegation) {
    // Return delegate instead of original approver
    const delegate = await db.query.users.findFirst({
      where: eq(users.id, delegation.delegateId),
    });
    
    return {
      id: delegate.id,
      type: "user",
      name: delegate.name,
      delegatedFrom: originalApproverId,
      delegationId: delegation.id,
    };
  }
  
  // No delegation - return original approver
  const original = await db.query.users.findFirst({
    where: eq(users.id, originalApproverId),
  });
  
  return {
    id: original.id,
    type: "user",
    name: original.name,
  };
}

/**
 * Create a delegation
 */
export async function createDelegation(
  db: Database,
  tenantId: string,
  delegatorId: string,
  data: {
    delegateId: string;
    delegationType: DelegationType;
    documentTypes?: string[];
    maxAmount?: string;
    currency?: string;
    effectiveFrom: Date;
    effectiveTo: Date;
    reason?: string;
  }
): Promise<Delegation> {
  // Validate delegate exists and is active
  const delegate = await db.query.users.findFirst({
    where: and(
      eq(users.id, data.delegateId),
      eq(users.tenantId, tenantId),
      eq(users.isActive, true)
    ),
  });
  
  if (!delegate) {
    throw new Error("Delegate user not found or inactive");
  }
  
  // Prevent circular delegation
  const reverseExists = await db.query.delegations.findFirst({
    where: and(
      eq(delegations.delegatorId, data.delegateId),
      eq(delegations.delegateId, delegatorId),
      eq(delegations.isActive, true)
    ),
  });
  
  if (reverseExists) {
    throw new Error("Circular delegation not allowed");
  }
  
  const delegator = await db.query.users.findFirst({
    where: eq(users.id, delegatorId),
  });
  
  const delegation = await db.insert(delegations).values({
    id: generateUUID(),
    tenantId,
    delegatorId,
    delegatorName: delegator.name,
    delegateId: data.delegateId,
    delegateName: delegate.name,
    delegationType: data.delegationType,
    documentTypes: data.documentTypes,
    maxAmount: data.maxAmount,
    currency: data.currency,
    effectiveFrom: data.effectiveFrom.toISOString(),
    effectiveTo: data.effectiveTo.toISOString(),
    reason: data.reason,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: delegatorId,
  }).returning();
  
  // Emit event
  await writeToOutbox(db, tenantId, {
    eventType: "delegation.created",
    eventId: generateUUID(),
    correlationId: delegation[0].id,
    sourceDomain: "workflow",
    sourceAggregateId: delegation[0].id,
    sourceAggregateType: "delegation",
    payload: {
      delegationId: delegation[0].id,
      delegatorId,
      delegateId: data.delegateId,
      effectiveFrom: data.effectiveFrom.toISOString(),
      effectiveTo: data.effectiveTo.toISOString(),
    },
  });
  
  return delegation[0];
}
```

---

## 7) Escalation

### 7.1 Escalation Schema

```typescript
// packages/axis-registry/src/schemas/workflow/escalation.ts

export const ESCALATION_ACTION = [
  "reassign",         // Reassign to different approver
  "notify_manager",   // Notify but keep assignment
  "auto_approve",     // Automatically approve
  "auto_reject",      // Automatically reject
  "expire",           // Mark as expired
] as const;

export const escalationRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Scope
  workflowDefinitionId: z.string().uuid().optional(), // Null = all workflows
  documentType: z.string().optional(),
  
  // Trigger
  triggerAfterHours: z.number().int().min(1),
  
  // Action
  escalationAction: z.enum(ESCALATION_ACTION),
  
  // For reassign action
  reassignToType: z.enum(["user", "role", "manager"]).optional(),
  reassignToId: z.string().uuid().optional(),
  
  // Notification settings
  notifyOriginalApprover: z.boolean().default(true),
  notifyRequester: z.boolean().default(true),
  notifyEscalateTo: z.boolean().default(true),
  
  // Repeat
  repeatAfterHours: z.number().int().min(0).optional(), // 0 = don't repeat
  maxRepeatCount: z.number().int().min(0).default(0),
  
  // Status
  isActive: z.boolean().default(true),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EscalationRule = z.infer<typeof escalationRuleSchema>;
```

### 7.2 Escalation Processor

```typescript
// packages/db/src/queries/workflow/escalation.ts

/**
 * Process escalations for overdue tasks (run as scheduled job)
 */
export async function processEscalations(db: Database): Promise<{
  processed: number;
  errors: string[];
}> {
  const now = new Date();
  let processed = 0;
  const errors: string[] = [];
  
  // Find overdue tasks
  const overdueTasks = await db.query.approvalTasks.findMany({
    where: and(
      eq(approvalTasks.status, "pending"),
      lte(approvalTasks.dueAt, now)
    ),
    with: {
      workflowInstance: true,
      workflowStep: true,
    },
  });
  
  for (const task of overdueTasks) {
    try {
      // Find matching escalation rule
      const rule = await findEscalationRule(
        db,
        task.tenantId,
        task.workflowInstance.workflowDefinitionId,
        task.workflowInstance.documentType
      );
      
      if (!rule) continue;
      
      // Check if already escalated max times
      const escalationCount = await countEscalations(db, task.id);
      if (rule.maxRepeatCount > 0 && escalationCount >= rule.maxRepeatCount) {
        continue;
      }
      
      // Execute escalation action
      await executeEscalation(db, task, rule);
      processed++;
      
    } catch (error) {
      errors.push(`Task ${task.id}: ${error.message}`);
    }
  }
  
  return { processed, errors };
}

/**
 * Execute escalation action
 */
async function executeEscalation(
  db: Database,
  task: ApprovalTask,
  rule: EscalationRule
): Promise<void> {
  await db.transaction(async (tx) => {
    switch (rule.escalationAction) {
      case "reassign":
        // Reassign to new approver
        const newApprover = await resolveEscalationTarget(tx, task, rule);
        
        // Create new task for escalation target
        await tx.insert(approvalTasks).values({
          ...task,
          id: generateUUID(),
          assignedToId: newApprover.id,
          assignedToName: newApprover.name,
          originalAssigneeId: task.assignedToId,
          status: "pending",
          escalatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Mark original task as escalated
        await tx.update(approvalTasks)
          .set({ 
            status: "escalated",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(approvalTasks.id, task.id));
        break;
        
      case "notify_manager":
        // Just send notification, don't change task
        await sendEscalationNotification(tx, task, rule);
        break;
        
      case "auto_approve":
        await approveTask(tx, task.id, "system", "Auto-approved due to timeout");
        break;
        
      case "auto_reject":
        await rejectTask(tx, task.id, "system", "Auto-rejected due to timeout");
        break;
        
      case "expire":
        await tx.update(approvalTasks)
          .set({
            status: "expired",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(approvalTasks.id, task.id));
        
        // Also expire the workflow instance
        await tx.update(workflowInstances)
          .set({
            status: "expired",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(workflowInstances.id, task.workflowInstanceId));
        break;
    }
    
    // Record escalation in history
    await tx.insert(taskHistory).values({
      id: generateUUID(),
      taskId: task.id,
      action: "escalated",
      performedBy: "system",
      performedAt: new Date().toISOString(),
      metadata: {
        ruleId: rule.id,
        action: rule.escalationAction,
      },
    });
    
    // Emit event
    await writeToOutbox(tx, task.tenantId, {
      eventType: "task.escalated",
      eventId: generateUUID(),
      correlationId: task.id,
      sourceDomain: "workflow",
      sourceAggregateId: task.id,
      sourceAggregateType: "approval_task",
      payload: {
        taskId: task.id,
        workflowInstanceId: task.workflowInstanceId,
        escalationRuleId: rule.id,
        action: rule.escalationAction,
      },
    });
  });
}
```

---

## 8) Notifications

### 8.1 Notification Schema

```typescript
// packages/axis-registry/src/schemas/workflow/notification.ts

export const NOTIFICATION_TYPE = [
  "task_assigned",
  "task_reminder",
  "task_escalated",
  "workflow_approved",
  "workflow_rejected",
  "delegation_created",
  "delegation_expiring",
] as const;

export const NOTIFICATION_CHANNEL = [
  "in_app",
  "email",
  "sms",
  "push",
] as const;

export const NOTIFICATION_STATUS = [
  "pending",
  "sent",
  "failed",
  "read",
] as const;

export const workflowNotificationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Type
  notificationType: z.enum(NOTIFICATION_TYPE),
  channel: z.enum(NOTIFICATION_CHANNEL),
  
  // Recipient
  recipientId: z.string().uuid(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  
  // Content
  subject: z.string().max(255),
  body: z.string().max(5000),
  htmlBody: z.string().optional(),
  
  // Reference
  workflowInstanceId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  
  // Status
  status: z.enum(NOTIFICATION_STATUS).default("pending"),
  
  // Timing
  scheduledAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  readAt: z.string().datetime().optional(),
  
  // Error tracking
  errorMessage: z.string().optional(),
  retryCount: z.number().int().default(0),
  
  createdAt: z.string().datetime(),
});

export type WorkflowNotification = z.infer<typeof workflowNotificationSchema>;
```

### 8.2 Notification Sending

```typescript
// packages/db/src/queries/workflow/notification.ts

/**
 * Send task notification
 */
export async function sendTaskNotification(
  db: Database,
  task: ApprovalTask,
  type: "assigned" | "reminder" | "escalated"
): Promise<void> {
  const instance = await db.query.workflowInstances.findFirst({
    where: eq(workflowInstances.id, task.workflowInstanceId),
  });
  
  const recipient = await db.query.users.findFirst({
    where: eq(users.id, task.assignedToId),
  });
  
  // Get notification template
  const template = getNotificationTemplate(type, instance.documentType);
  
  // Render content
  const content = renderTemplate(template, {
    recipientName: recipient.name,
    documentType: instance.documentType,
    documentNumber: instance.documentNumber,
    requesterName: await getRequesterName(db, instance.requestedBy),
    dueDate: task.dueAt ? formatDate(task.dueAt) : "N/A",
    actionUrl: `${getAppUrl()}/approvals/${task.id}`,
  });
  
  // Create notification records for configured channels
  const channels = await getNotificationChannels(db, task.tenantId, type);
  
  for (const channel of channels) {
    await db.insert(workflowNotifications).values({
      id: generateUUID(),
      tenantId: task.tenantId,
      notificationType: `task_${type}`,
      channel,
      recipientId: recipient.id,
      recipientEmail: channel === "email" ? recipient.email : undefined,
      subject: content.subject,
      body: content.body,
      htmlBody: content.htmlBody,
      workflowInstanceId: instance.id,
      taskId: task.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }
}
```

---

## 9) Workflow Engine

### 9.1 Start Workflow

```typescript
// packages/db/src/queries/workflow/engine.ts

/**
 * Start a workflow for a document
 */
export async function startWorkflow(
  db: Database,
  tenantId: string,
  userId: string,
  document: {
    type: string;
    id: string;
    number?: string;
    action: string;
    data: Record<string, unknown>;
  }
): Promise<WorkflowInstance | null> {
  // 1. Find matching workflow definition
  const definition = await findMatchingWorkflow(
    db, tenantId, document.type, document.action, document.data
  );
  
  if (!definition) {
    // No workflow configured - document can proceed
    return null;
  }
  
  // 2. Create workflow instance
  const instance = await db.insert(workflowInstances).values({
    id: generateUUID(),
    tenantId,
    workflowDefinitionId: definition.id,
    workflowCode: definition.code,
    workflowVersion: definition.version,
    documentType: document.type,
    documentId: document.id,
    documentNumber: document.number,
    requestedBy: userId,
    requestedAt: new Date().toISOString(),
    status: "pending",
    currentStepNumber: 1,
    contextData: document.data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).returning();
  
  // 3. Get first step
  const firstStep = await db.query.workflowSteps.findFirst({
    where: and(
      eq(workflowSteps.workflowId, definition.id),
      eq(workflowSteps.stepNumber, 1)
    ),
  });
  
  // 4. Create tasks for first step
  await createTasksForStep(db, instance[0], firstStep);
  
  // 5. Emit event
  await writeToOutbox(db, tenantId, {
    eventType: "workflow.started",
    eventId: generateUUID(),
    correlationId: instance[0].id,
    sourceDomain: "workflow",
    sourceAggregateId: instance[0].id,
    sourceAggregateType: "workflow_instance",
    payload: {
      instanceId: instance[0].id,
      workflowCode: definition.code,
      documentType: document.type,
      documentId: document.id,
      requestedBy: userId,
    },
  });
  
  return instance[0];
}

/**
 * Find matching workflow definition
 */
async function findMatchingWorkflow(
  db: Database,
  tenantId: string,
  documentType: string,
  action: string,
  data: Record<string, unknown>
): Promise<WorkflowDefinition | null> {
  const definitions = await db.query.workflowDefinitions.findMany({
    where: and(
      eq(workflowDefinitions.tenantId, tenantId),
      eq(workflowDefinitions.targetDocumentType, documentType),
      eq(workflowDefinitions.targetAction, action),
      eq(workflowDefinitions.status, "active"),
      eq(workflowDefinitions.isLatest, true)
    ),
    orderBy: [desc(workflowDefinitions.priority)],
  });
  
  // Evaluate trigger conditions
  for (const def of definitions) {
    if (!def.triggerCondition || evaluateCondition(def.triggerCondition, data)) {
      return def;
    }
  }
  
  return null;
}
```

### 9.2 Process Task Decision

```typescript
/**
 * Approve a task
 */
export async function approveTask(
  db: Database,
  taskId: string,
  userId: string,
  comments?: string
): Promise<{
  task: ApprovalTask;
  workflowComplete: boolean;
  finalDecision?: "approved" | "rejected";
}> {
  return db.transaction(async (tx) => {
    // 1. Get and validate task
    const task = await tx.query.approvalTasks.findFirst({
      where: eq(approvalTasks.id, taskId),
      with: {
        workflowInstance: true,
        workflowStep: true,
      },
    });
    
    if (!task) {
      throw new Error("Task not found");
    }
    
    if (task.status !== "pending") {
      throw new Error(`Task is not pending: ${task.status}`);
    }
    
    // 2. Validate approver
    const canApprove = await validateApprover(tx, task, userId);
    if (!canApprove) {
      throw new Error("User not authorized to approve this task");
    }
    
    // 3. Update task
    await tx.update(approvalTasks)
      .set({
        status: "approved",
        decision: "approved",
        decidedBy: userId,
        decidedAt: new Date().toISOString(),
        comments,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(approvalTasks.id, taskId));
    
    // 4. Record history
    await tx.insert(taskHistory).values({
      id: generateUUID(),
      taskId,
      action: "approved",
      performedBy: userId,
      performedAt: new Date().toISOString(),
      comments,
    });
    
    // 5. Check step completion
    const stepComplete = await isStepComplete(tx, task);
    
    if (stepComplete) {
      // 6. Move to next step or complete workflow
      return await advanceWorkflow(tx, task.workflowInstance, task.workflowStep);
    }
    
    return {
      task: await tx.query.approvalTasks.findFirst({ where: eq(approvalTasks.id, taskId) }),
      workflowComplete: false,
    };
  });
}

/**
 * Reject a task
 */
export async function rejectTask(
  db: Database,
  taskId: string,
  userId: string,
  comments: string
): Promise<{
  task: ApprovalTask;
  workflowComplete: boolean;
  finalDecision: "rejected";
}> {
  return db.transaction(async (tx) => {
    const task = await tx.query.approvalTasks.findFirst({
      where: eq(approvalTasks.id, taskId),
      with: { workflowInstance: true },
    });
    
    if (!task || task.status !== "pending") {
      throw new Error("Task not found or not pending");
    }
    
    // Rejection requires comments
    if (!comments || comments.length < 10) {
      throw new Error("Rejection requires detailed comments (min 10 chars)");
    }
    
    // Update task
    await tx.update(approvalTasks)
      .set({
        status: "rejected",
        decision: "rejected",
        decidedBy: userId,
        decidedAt: new Date().toISOString(),
        comments,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(approvalTasks.id, taskId));
    
    // Cancel other pending tasks for this step
    await tx.update(approvalTasks)
      .set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(approvalTasks.workflowInstanceId, task.workflowInstanceId),
        eq(approvalTasks.stepNumber, task.stepNumber),
        eq(approvalTasks.status, "pending"),
        ne(approvalTasks.id, taskId)
      ));
    
    // Complete workflow as rejected
    await tx.update(workflowInstances)
      .set({
        status: "rejected",
        finalDecision: "rejected",
        finalComments: comments,
        completedAt: new Date().toISOString(),
        completedBy: userId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(workflowInstances.id, task.workflowInstanceId));
    
    // Emit event
    await writeToOutbox(tx, task.tenantId, {
      eventType: "workflow.rejected",
      eventId: generateUUID(),
      correlationId: task.workflowInstanceId,
      sourceDomain: "workflow",
      sourceAggregateId: task.workflowInstanceId,
      sourceAggregateType: "workflow_instance",
      payload: {
        instanceId: task.workflowInstanceId,
        rejectedBy: userId,
        rejectionComments: comments,
        rejectedAtStep: task.stepNumber,
      },
    });
    
    // Notify requester
    await sendWorkflowNotification(tx, task.workflowInstance, "rejected", userId, comments);
    
    return {
      task: await tx.query.approvalTasks.findFirst({ where: eq(approvalTasks.id, taskId) }),
      workflowComplete: true,
      finalDecision: "rejected",
    };
  });
}

/**
 * Advance workflow to next step or complete
 */
async function advanceWorkflow(
  tx: Transaction,
  instance: WorkflowInstance,
  currentStep: WorkflowStep
): Promise<{
  task: ApprovalTask;
  workflowComplete: boolean;
  finalDecision?: "approved" | "rejected";
}> {
  // Get next step
  const nextStepNumber = currentStep.onApproveNextStep || currentStep.stepNumber + 1;
  
  const nextStep = await tx.query.workflowSteps.findFirst({
    where: and(
      eq(workflowSteps.workflowId, instance.workflowDefinitionId),
      eq(workflowSteps.stepNumber, nextStepNumber)
    ),
  });
  
  if (!nextStep) {
    // No more steps - workflow complete
    await tx.update(workflowInstances)
      .set({
        status: "approved",
        finalDecision: "approved",
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(workflowInstances.id, instance.id));
    
    // Emit event
    await writeToOutbox(tx, instance.tenantId, {
      eventType: "workflow.approved",
      eventId: generateUUID(),
      correlationId: instance.id,
      sourceDomain: "workflow",
      sourceAggregateId: instance.id,
      sourceAggregateType: "workflow_instance",
      payload: {
        instanceId: instance.id,
        documentType: instance.documentType,
        documentId: instance.documentId,
      },
    });
    
    // Notify requester
    await sendWorkflowNotification(tx, instance, "approved");
    
    return {
      task: null,
      workflowComplete: true,
      finalDecision: "approved",
    };
  }
  
  // Update instance to next step
  await tx.update(workflowInstances)
    .set({
      status: "in_progress",
      currentStepNumber: nextStepNumber,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(workflowInstances.id, instance.id));
  
  // Create tasks for next step
  const tasks = await createTasksForStep(tx, instance, nextStep);
  
  return {
    task: tasks[0],
    workflowComplete: false,
  };
}
```

---

## 10) Workflow Events

```typescript
// packages/axis-registry/src/schemas/events/workflow.ts

export const workflowStartedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("workflow.started"),
  payload: z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    documentNumber: z.string().optional(),
    requestedBy: z.string().uuid(),
  }),
});

export const workflowApprovedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("workflow.approved"),
  payload: z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    approvedAt: z.string().datetime(),
  }),
});

export const workflowRejectedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("workflow.rejected"),
  payload: z.object({
    instanceId: z.string().uuid(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    rejectedBy: z.string().uuid(),
    rejectedAtStep: z.number().int(),
    rejectionComments: z.string(),
  }),
});

export const taskAssignedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("task.assigned"),
  payload: z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    assignedToId: z.string().uuid(),
    assignedToType: z.enum(["user", "role"]),
    dueAt: z.string().datetime().optional(),
  }),
});

export const taskEscalatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("task.escalated"),
  payload: z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    escalationRuleId: z.string().uuid(),
    action: z.enum(ESCALATION_ACTION),
    escalatedTo: z.string().uuid().optional(),
  }),
});

export const delegationCreatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("delegation.created"),
  payload: z.object({
    delegationId: z.string().uuid(),
    delegatorId: z.string().uuid(),
    delegateId: z.string().uuid(),
    effectiveFrom: z.string().datetime(),
    effectiveTo: z.string().datetime(),
  }),
});
```

---

## 11) Workflow Configuration

```typescript
// packages/axis-registry/src/schemas/workflow/config.ts

export const workflowConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Default timeouts
  defaultTaskTimeoutHours: z.number().int().min(0).default(48),
  defaultReminderHours: z.number().int().min(0).default(24),
  
  // Escalation
  enableAutoEscalation: z.boolean().default(true),
  defaultEscalationHours: z.number().int().min(1).default(72),
  
  // Delegation
  allowDelegation: z.boolean().default(true),
  maxDelegationDepth: z.number().int().min(1).default(2), // Prevent long chains
  requireDelegationApproval: z.boolean().default(false),
  
  // Notifications
  enableEmailNotifications: z.boolean().default(true),
  enablePushNotifications: z.boolean().default(false),
  enableSmsNotifications: z.boolean().default(false),
  
  // Business hours (for timeout calculation)
  useBusinessHoursOnly: z.boolean().default(false),
  businessStartHour: z.number().int().min(0).max(23).default(9),
  businessEndHour: z.number().int().min(0).max(23).default(17),
  businessDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]), // Mon-Fri
  
  // Holidays
  excludeHolidays: z.boolean().default(false),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type WorkflowConfig = z.infer<typeof workflowConfigSchema>;
```

---

## 12) Exit Criteria (B8-01 Gate)

**B8-01 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | Workflow definitions with steps                        | ✅        | `workflowDefinitionSchema` defined           |
| 2   | Workflow instances track state                         | ✅        | `workflowInstanceSchema` defined             |
| 3   | Approval tasks assigned to users/roles                 | ✅        | `approvalTaskSchema` defined                 |
| 4   | Sequential approval chains work                        | ✅        | `advanceWorkflow()` logic                    |
| 5   | Parallel approval branches work                        | ✅        | `parallelGroupId` + join logic               |
| 6   | Delegation redirects tasks                             | ✅        | `checkDelegation()` function                 |
| 7   | Escalation on timeout                                  | ✅        | `processEscalations()` job                   |
| 8   | Notifications sent for assignments                     | ✅        | `sendTaskNotification()`                     |
| 9   | Reject at any step cancels workflow                    | ✅        | `rejectTask()` logic                         |
| 10  | Task history tracked                                   | ✅        | `taskHistorySchema` defined                  |
| 11  | Workflow events published to outbox                    | ✅        | B02 outbox integration ready                 |
| 12  | Workflow configuration per tenant                      | ✅        | `workflowConfigSchema` defined               |

### Implementation Files

| Component              | Location                                                    |
| ---------------------- | ----------------------------------------------------------- |
| Workflow Constants     | `packages/axis-registry/src/schemas/workflow/constants.ts`  |
| Definition Schemas     | `packages/axis-registry/src/schemas/workflow/definition.ts` |
| Instance Schemas       | `packages/axis-registry/src/schemas/workflow/instance.ts`   |
| Task Schemas           | `packages/axis-registry/src/schemas/workflow/task.ts`       |
| Delegation Schemas     | `packages/axis-registry/src/schemas/workflow/delegation.ts` |
| Escalation Schemas     | `packages/axis-registry/src/schemas/workflow/escalation.ts` |
| Workflow Tables        | `packages/db/src/schema/workflow/*.ts`                      |
| Workflow Events        | `packages/axis-registry/src/schemas/events/workflow.ts`     |

---

## 13) Integration with Other Phases

| Phase               | Dependency on B08-01      | What B08-01 Provides                 |
| ------------------- | ------------------------- | ------------------------------------ |
| **B04** (Sales)     | SO/Invoice approval       | Approval workflows for sales docs    |
| **B05** (Purchase)  | PR/PO approval            | Approval workflows for purchase docs |
| **B06** (Inventory) | Adjustment approval       | Approval for large adjustments       |
| **B07** (Accounting)| Journal approval          | Approval for manual journals         |
| **B08** (Controls)  | Base controls             | Policy-triggered workflows           |
| **B09** (Reconciliation)| Exception workflows  | Approval for exception resolution    |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | B08-CONTROLS.md v1.0.0, A01-CANONICAL.md v0.3.0 |
| **Phase**        | B8-01 (Workflow)                                |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: Workflow engine integrates with B08 Controls for policy-triggered approvals.

---

## Related Documents

| Document                                       | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §7 (Human-Machine Symbiosis)   |
| [B08-CONTROLS.md](./B08-CONTROLS.md)           | Controls (approval policies)               |
| [B04-SALES.md](./B04-SALES.md)                 | Sales (order/invoice approvals)            |
| [B05-PURCHASE.md](./B05-PURCHASE.md)           | Purchase (PR/PO approvals)                 |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)       | Accounting (journal approvals)             |

---

> *"Machines execute. Humans approve. Workflows ensure the right person approves at the right time, every time."*
