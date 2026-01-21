# KER Implementation Crosswalk

**Purpose:** Map kernel specifications (KER000-KER340) to actual codebase implementation  
**Status:** Living Document (Updated as implementation progresses)  
**Last Updated:** 2026-01-20

---

## Overview

This document bridges the gap between **specification** (KER docs) and **implementation** (actual code). Use this to:

- Verify that KER specs match reality
- Find where kernel primitives are implemented
- Identify implementation gaps
- Guide new developers to actual code

---

## Core Kernel Infrastructure

### K-M7 Telemetry Propagation

**Spec:** [KER260](KER260-TELEMETRY-PROPAGATION-K-M7.md)  
**Status:** ✅ Implemented  
**Package:** `packages/observability`

**Implementation Files:**

```typescript
// packages/observability/src/context.ts
export type RequestContext = {
  traceId: string;
  requestId: string;
  routeId?: string;
  method?: string;
  tenantId?: string;
  actorId?: string;
  roles?: string[];
};

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T;
export function getContext(): RequestContext | undefined;
export function requireContext(): RequestContext;
export function updateContext(updates: Partial<RequestContext>): void;
export function generateId(): string;

// packages/observability/src/tracing.ts
export function getActiveTraceId(): string | undefined;
export function getActiveSpan(): Span | undefined;
export function markSpanError(error: Error | string): void;
export function setSpanAttributes(
  attributes: Record<string, string | number | boolean>,
): void;
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
): Promise<T>;
```

**Integration Point:**

```typescript
// packages/api-kernel/src/kernel.ts (lines 124-144)
const traceId = getActiveTraceId() ?? generateId();
const requestId = generateId();

const ctx: RequestContext = {
  traceId,
  requestId,
  routeId: spec.routeId,
  method: spec.method,
};

return runWithContext(ctx, async () => {
  setSpanAttributes({
    'route.id': spec.routeId,
    'http.method': spec.method,
  });
  // ... rest of handler
});
```

**EVI Status:** 🔴 Not Certified (EVI044 pending)

---

### K-M6 Traffic Governor & Idempotency

**Spec:** [KER210](KER210-IDEMPOTENCY-TRAFFIC-GOVERNOR-K-M6.md)  
**Status:** 🔴 Not Implemented  
**Package:** `packages/api-kernel` (planned)

**Planned Implementation:**

```typescript
// packages/api-kernel/src/traffic.ts (TO BE CREATED)
export interface RateLimitPolicy {
  tenantId: string;
  scope: 'tenant' | 'tenant_user' | 'tenant_ip';
  routeId: string;
  windowSeconds: number;
  maxRequests: number;
}

export interface IdempotencyRecord {
  tenantId: string;
  key: string;
  routeId: string;
  method: string;
  requestHash: string;
  statusCode: number;
  responseBodyRef: string;
  createdAt: string;
  expiresAt: string;
}

export async function checkRateLimit(
  tenantId: string,
  routeId: string,
  scope: string,
): Promise<{ allowed: boolean; retryAfter?: number }>;

export async function checkIdempotency(
  tenantId: string,
  key: string,
  routeId: string,
  method: string,
  requestHash: string,
): Promise<{ exists: boolean; response?: unknown }>;
```

**Integration Point (Planned):**

```typescript
// packages/api-kernel/src/kernel.ts (to be added)
// Before handler execution:
if (spec.idempotent) {
  const idempotencyKey = request.headers.get('idempotency-key');
  if (idempotencyKey) {
    const cached = await checkIdempotency(
      tenantId,
      idempotencyKey,
      spec.routeId,
      spec.method,
      requestHash,
    );
    if (cached.exists) {
      return cached.response; // Replay cached response
    }
  }
}
```

**EVI Status:** 🔴 Not Started (EVI043 pending)

---

### K-M5 Scheduler (Heartbeat)

**Spec:** [KER220](KER220-SCHEDULER-HEARTBEAT-K-M5.md)  
**Status:** 🟡 Partially Implemented  
**Package:** `packages/jobs`

**Implementation Files:**

```typescript
// packages/jobs/src/client.ts (ACTUAL CODE)
import { run, makeWorkerUtils, type WorkerUtils } from 'graphile-worker';

export async function createWorkerUtils(
  connectionString: string,
): Promise<WorkerUtils>;

export async function runWorker(
  connectionString: string,
  handlers: JobHandlers,
  options?: {
    concurrency?: number;
    pollInterval?: number;
  },
): Promise<void>;

// packages/jobs/src/types.ts
export type JobPayload = Record<string, unknown>;
export type JobHandler = (payload: JobPayload) => Promise<void>;
export type JobHandlers = Record<string, JobHandler>;
```

**Usage Example:**

```typescript
// scripts/run-worker.ts
import { runWorker } from '@workspace/jobs';
import { exampleHandler } from './handlers/example';

await runWorker(
  process.env.DATABASE_URL!,
  {
    'example.job': exampleHandler,
  },
  {
    concurrency: 5,
    pollInterval: 1000,
  },
);
```

**Missing:**

- Job envelope schema (JobEnvelope with tenantId, fairnessClass, etc.)
- Circuit breaker integration
- Fairness scheduling per tenant
- Job audit records

**EVI Status:** 🔴 Not Certified (EVI042 pending implementation of missing features)

---

### K-M4 Keymaster (Signing Primitive)

**Spec:** [KER230](KER230-KEYMASTER-SIGNING-K-M4.md)  
**Status:** 🔴 Not Implemented  
**Package:** `packages/api-kernel` (planned)

**Planned Implementation:**

```typescript
// packages/api-kernel/src/keymaster.ts (TO BE CREATED)
export interface KeyScope {
  tenantId: string;
  keyAlias: string;
  purpose:
    | 'einvoice_signing'
    | 'webhook_signing'
    | 'audit_sealing'
    | 'regulator_bundle_signing';
  algorithm: 'RSA_SHA256' | 'ECDSA_SHA256';
  isActive: boolean;
  currentVersion: number;
  createdAt: string;
}

export interface SignRequest {
  tenantId: string;
  keyAlias: string;
  payloadDigest: string;
  purpose: string;
  objectRef?: { type: string; id?: string };
}

export interface SignResult {
  signature: string;
  keyAlias: string;
  keyVersion: number;
  signedAt: string;
}

export async function createKey(
  input: CreateKeyInput,
): Promise<{ keyAlias: string; version: number }>;
export async function sign(input: SignRequest): Promise<SignResult>;
export async function rotateKey(
  tenantId: string,
  keyAlias: string,
  reason: string,
): Promise<{ newVersion: number }>;
```

**EVI Status:** 🔴 Not Started (EVI041 pending)

---

## Route Handler Pattern (Mandatory)

**Spec:** KER000 Law #6, CAN003  
**Status:** ✅ Implemented  
**Package:** `packages/api-kernel`

**Implementation:**

```typescript
// packages/api-kernel/src/kernel.ts (lines 112-265)
export function kernel<TQuery, TBody, TOutput>(
  spec: RouteSpec<TQuery, TBody, TOutput>,
): (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> },
) => Promise<Response>;

// packages/api-kernel/src/types.ts (lines 52-75)
export type RouteSpec<TQuery, TBody, TOutput> = {
  method: HttpMethod;
  routeId: string;
  tenant?: TenantConfig;
  auth?: AuthConfig;
  query?: TQuery;
  body?: TBody;
  output: TOutput;
  handler: (
    ctx: HandlerContext<z.infer<TQuery>, z.infer<TBody>>,
  ) => Promise<z.infer<TOutput>>;
};
```

**Usage Example (Actual):**

```typescript
// apps/web/app/api/health/route.ts
import { kernel } from '@workspace/api-kernel';
import { healthOutputSchema } from '@workspace/validation';

export const GET = kernel({
  method: 'GET',
  routeId: 'health.check',
  auth: { mode: 'public' },
  output: healthOutputSchema,
  handler: async () => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
  }),
});
```

**Enforcement:** This is THE ONLY allowed pattern. All routes MUST use `kernel(spec)`.

---

## HTTP Envelopes (Standard Response Format)

**Spec:** KER000 Law #6  
**Status:** ✅ Implemented  
**Package:** `packages/api-kernel`

**Implementation:**

```typescript
// packages/api-kernel/src/http.ts (ACTUAL CODE)
export function ok<T>(
  data: T,
  traceId: string,
): NextResponse<SuccessEnvelope<T>>;
export function fail(
  code: ErrorCodeType,
  message: string,
  traceId: string,
  options?: {
    details?: Record<string, unknown>;
    fieldErrors?: Record<string, string[]>;
    status?: number;
  },
): NextResponse<ErrorEnvelope>;

// packages/api-kernel/src/types.ts (lines 77-97)
export type SuccessEnvelope<T> = {
  data: T;
  meta: { traceId: string };
};

export type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    traceId: string;
    details?: Record<string, unknown>;
    fieldErrors?: Record<string, string[]>;
  };
};
```

**Actual Response Examples:**

```json
// Success (200)
{
  "data": { "status": "ok", "timestamp": "2026-01-20T10:00:00Z" },
  "meta": { "traceId": "abc123..." }
}

// Error (400)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "traceId": "abc123...",
    "fieldErrors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

---

## Zod Contract Validation

**Spec:** KER000 Law #7  
**Status:** ✅ Implemented  
**Package:** `packages/validation`, `packages/api-kernel`

**Schema Definitions (Actual):**

```typescript
// packages/validation/src/api.ts (ACTUAL CODE)
export const echoBodySchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export const echoOutputSchema = z.object({
  echoed: z.string(),
});

export type EchoBody = z.infer<typeof echoBodySchema>;
export type EchoOutput = z.infer<typeof echoOutputSchema>;

// packages/validation/src/auth.ts
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password required'),
});
```

**Validation Implementation:**

```typescript
// packages/api-kernel/src/kernel.ts (lines 75-106)
function validateSchema<T extends z.ZodTypeAny>(
  schema: T | undefined,
  data: unknown,
  schemaName: string,
): z.infer<T> | undefined {
  if (!schema) return undefined;

  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || schemaName;
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }

    throw new KernelError(
      ErrorCode.VALIDATION_ERROR,
      `${schemaName} validation failed`,
      undefined,
      fieldErrors,
    );
  }

  return result.data;
}
```

---

## Database Client

**Spec:** K-S1 (Schema governance), implicit kernel requirement  
**Status:** ✅ Implemented  
**Package:** `packages/db`

**Implementation:**

```typescript
// packages/db/src/client.ts (ACTUAL CODE)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createSqlClient() {
  return neon(getDatabaseUrl());
}

export function createDb() {
  const sql = createSqlClient();
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export type Database = ReturnType<typeof createDb>;
```

**Missing (Per K-M7):**

- DB query trace comment injection
- Performance budget tracking per query

---

## Implementation Status Summary

| Capability                  | Spec     | Status          | Package                 | EVI Status        |
| --------------------------- | -------- | --------------- | ----------------------- | ----------------- |
| **Route Handler Pattern**   | KER000   | ✅ Complete     | api-kernel              | ✅ Enforced       |
| **HTTP Envelopes**          | KER000   | ✅ Complete     | api-kernel              | ✅ Enforced       |
| **Zod Validation**          | KER000   | ✅ Complete     | validation, api-kernel  | ✅ Enforced       |
| **Telemetry (K-M7)**        | KER260   | ✅ Complete     | observability           | 🔴 EVI044 pending |
| **Scheduler (K-M5)**        | KER220   | 🟡 Partial      | jobs                    | 🔴 EVI042 pending |
| **DB Client**               | Implicit | ✅ Complete     | db                      | N/A               |
| **Traffic Governor (K-M6)** | KER210   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI043 pending |
| **Keymaster (K-M4)**        | KER230   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI041 pending |
| **Secrets (K-V1)**          | KER240   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI047 pending |
| **Audit (K-W1)**            | KER250   | 🔴 Not Started  | observability (planned) | 🔴 EVI048 pending |
| **Migrations (K-S1)**       | KER280   | 🟡 Drizzle only | db                      | 🔴 EVI045 pending |
| **Sequences (K-M10)**       | KER100   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI055 pending |
| **Approvals (K-M11)**       | KER110   | 🔴 Not Started  | domain (planned)        | 🔴 EVI058 pending |
| **Batch (K-M13)**           | KER120   | 🔴 Not Started  | jobs (planned)          | 🔴 EVI059 pending |
| **Privacy (K-B1)**          | KER290   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI023 pending |
| **Guest Links (K-B2)**      | KER300   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI028 pending |
| **EventBus (K-E1)**         | KER310   | 🔴 Not Started  | jobs (planned)          | 🔴 EVI027 pending |
| **Contracts (K-R1)**        | KER270   | 🔴 Not Started  | validation (planned)    | 🔴 EVI046 pending |
| **AI Gateway (K-I1)**       | KER340   | 🔴 Not Started  | api-kernel (planned)    | 🔴 EVI057 pending |

**Legend:**

- ✅ Complete — Fully implemented and production-ready
- 🟡 Partial — Basic implementation exists, missing kernel-specific features
- 🔴 Not Started — Spec complete, implementation pending

---

## Next Implementation Priority (2026 Q1)

### Week 1-2: Core Infrastructure

1. Complete K-M7 Telemetry (add DB query trace comment injection)
2. Implement K-M6 Traffic Governor + Idempotency
3. Certify EVI044, EVI043

### Week 3-4: Security Foundation

1. Implement K-M4 Keymaster (signing primitive)
2. Implement K-V1 Secrets Lifecycle
3. Certify EVI041, EVI047

### Week 5-6: Trust Layer

1. Implement K-W1 Audit Immutability
2. Enhance K-S1 Migrations (add governance layer)
3. Certify EVI048, EVI045

### Week 7-8: ERP-Ready

1. Implement K-M10 Sequences
2. Implement K-M11 Approvals
3. Implement K-M13 Batch Framework
4. Certify EVI055, EVI058, EVI059

---

## How to Use This Document

### For Implementers

1. Find capability you're implementing in table above
2. Read the KERxxx spec document
3. Check "Planned Implementation" section for interface contracts
4. Implement in the specified package
5. Write EVI test suite
6. Update this document's status

### For Reviewers

1. Verify implementation matches KERxxx spec
2. Check that actual code matches "Planned Implementation" interfaces
3. Ensure kernel laws (KER000) are upheld
4. Confirm EVI test suite exists and passes

### For Architects

1. Use this to track implementation progress
2. Identify gaps between spec and reality
3. Update KER specs if implementation reveals better patterns
4. Ensure no drift between spec and code

---

**Maintenance:** Update this document whenever:

- A new kernel capability is implemented
- An EVI is certified
- Implementation patterns change
- Package structure changes

---

**End of KER Implementation Crosswalk**
