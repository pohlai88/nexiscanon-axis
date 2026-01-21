# @axis/kernel

> Core utilities for AXIS ERP - Auth, Tenant, Config

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-4.x-3068B7)](https://zod.dev/v4)

[← Back to root](../../README.md)

---

## Overview

Shared kernel utilities used across the AXIS platform:

- **Auth**: Session management, RBAC, Neon Auth integration
- **Tenant**: Context, resolution, middleware helpers
- **Config**: Environment validation, feature flags

---

## Exports

### `@axis/kernel`

```typescript
// Auth
export { getCurrentSession, validateSession } from "./auth";
export { hasPermission, PERMISSIONS } from "./auth/rbac";

// Tenant
export { TenantProvider, useTenant } from "./tenant/context";
export { resolveTenant } from "./tenant/resolve";

// Config
export { env, validateEnv } from "./config/env";
export { isFeatureEnabled, FEATURES } from "./config/features";
```

---

## Auth Module

### Session Management

```typescript
import { getCurrentSession, validateSession } from "@axis/kernel";

// Get current session (server-side)
const session = await getCurrentSession();
if (!session) {
  redirect("/login");
}

// Validate session token
const isValid = await validateSession(token);
```

### RBAC (Role-Based Access Control)

```typescript
import { hasPermission, PERMISSIONS } from "@axis/kernel";

// Check permission
if (!hasPermission(user.role, PERMISSIONS.MANAGE_TEAM)) {
  return { error: "Insufficient permissions" };
}
```

**Permission Matrix:**

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| VIEW_DASHBOARD | ✓ | ✓ | ✓ | ✓ |
| MANAGE_SETTINGS | ✓ | ✓ | - | - |
| MANAGE_TEAM | ✓ | ✓ | - | - |
| MANAGE_BILLING | ✓ | - | - | - |
| DELETE_WORKSPACE | ✓ | - | - | - |

---

## Tenant Module

### Tenant Context (Client Components)

```typescript
// In a client component
import { useTenant } from "@axis/kernel";

function Dashboard() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) return <Skeleton />;

  return <h1>Welcome to {tenant.name}</h1>;
}
```

### Tenant Resolution (Server)

```typescript
import { resolveTenant } from "@axis/kernel";

// Resolve tenant from slug
const tenant = await resolveTenant("acme");
if (!tenant) {
  notFound();
}
```

### Middleware Helper

```typescript
import { getTenantFromRequest } from "@axis/kernel";

// In middleware.ts
const tenantSlug = getTenantFromRequest(request);
```

---

## Config Module

### Environment Validation

```typescript
import { env } from "@axis/kernel";

// Type-safe environment access
const dbUrl = env.DATABASE_URL;
const stripeKey = env.STRIPE_SECRET_KEY;

// Validated at startup - throws if missing required vars
```

### Feature Flags

```typescript
import { isFeatureEnabled, FEATURES } from "@axis/kernel";

if (isFeatureEnabled(FEATURES.NEW_DASHBOARD)) {
  return <NewDashboard />;
}
```

---

## Directory Structure

```
packages/kernel/
├── src/
│   ├── index.ts              # Main exports
│   ├── auth/
│   │   ├── index.ts          # Auth exports
│   │   ├── neon-auth.ts      # Neon Auth integration
│   │   ├── rbac.ts           # Role-based access control
│   │   └── session.ts        # Session management
│   ├── config/
│   │   ├── index.ts          # Config exports
│   │   ├── env.ts            # Environment validation
│   │   └── features.ts       # Feature flags
│   └── tenant/
│       ├── index.ts          # Tenant exports
│       ├── context.tsx       # React context provider
│       ├── middleware.ts     # Middleware helpers
│       └── resolve.ts        # Tenant resolution
├── package.json
└── tsconfig.json
```

---

## Usage in apps/web

```typescript
// Server action
import { getCurrentSession } from "@axis/kernel";
import { hasPermission, PERMISSIONS } from "@axis/kernel";

export async function updateSettings() {
  const session = await getCurrentSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  if (!hasPermission(session.role, PERMISSIONS.MANAGE_SETTINGS)) {
    return { error: "Forbidden" };
  }

  // ... update settings
}
```

```tsx
// Client component
"use client";
import { useTenant } from "@axis/kernel";

export function WorkspaceHeader() {
  const { tenant } = useTenant();
  return <h1>{tenant?.name ?? "Loading..."}</h1>;
}
```

---

[← Back to root](../../README.md)
