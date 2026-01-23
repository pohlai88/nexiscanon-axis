# Multi-Tenancy Architecture

> **Explanation**: Understanding how AXIS handles multiple organizations, teams, and users.

## What is Multi-Tenancy?

Multi-tenancy means a single application serves multiple customers (tenants), each with their own isolated data and configuration.

In AXIS, tenants are:
- **Organizations** - Top-level entities (companies, groups)
- **Teams** - Sub-entities within organizations
- **Personal workspaces** - Individual user spaces

---

## The Tenant Model

```sql
tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR(63) UNIQUE,     -- URL identifier
  name VARCHAR(255),           -- Display name
  type VARCHAR(20),            -- 'organization', 'team', 'personal'
  parent_id UUID,              -- For hierarchy (teams → org)
  status VARCHAR(20),          -- 'active', 'suspended', etc.
  plan VARCHAR(20),            -- 'free', 'starter', 'professional'
  settings JSONB               -- Branding, billing, custom domain
)
```

### Hierarchy Rules

| Type | `parent_id` | Can Have Children |
|------|-------------|-------------------|
| `organization` | `null` | Yes (teams) |
| `team` | org UUID | No |
| `personal` | `null` | No |

---

## Tenant Resolution

When a request comes in, we need to determine which tenant it's for.

### Path-Based (Default)

```
https://app.com/acme-corp/settings
                 ↑
            Tenant slug
```

The `[tenant]` dynamic segment in Next.js captures this.

### Subdomain-Based (Optional)

```
https://acme-corp.app.com/settings
        ↑
   Tenant slug
```

Requires `SUBDOMAIN_ROUTING_ENABLED=true` and DNS configuration.

### Resolution Priority

1. Subdomain (if enabled)
2. Path segment
3. Custom domain lookup (if configured)

---

## Data Isolation

### Row-Level Isolation

Every tenant-scoped table has a `tenant_id` foreign key:

```sql
-- API keys belong to a tenant
api_keys (
  id UUID,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  ...
)

-- Audit logs are tenant-scoped
audit_logs (
  id UUID,
  tenant_id UUID REFERENCES tenants(id),
  ...
)
```

### Query Patterns

Always include `tenant_id` in queries:

```typescript
// ✅ Correct: Scoped to tenant
const keys = await sql`
  SELECT * FROM api_keys
  WHERE tenant_id = ${tenantId}
`;

// ❌ Wrong: Could leak data across tenants
const keys = await sql`
  SELECT * FROM api_keys
`;
```

---

## User Membership

Users can belong to multiple tenants with different roles:

```sql
tenant_users (
  tenant_id UUID,
  user_id UUID,
  role VARCHAR(20),  -- 'owner', 'admin', 'member', 'viewer'
  PRIMARY KEY (tenant_id, user_id)
)
```

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| `owner` | Full control, delete tenant, transfer ownership |
| `admin` | Manage members, settings, billing |
| `member` | Read/write access to resources |
| `viewer` | Read-only access |

---

## Workspace Switcher

Users can switch between tenants they belong to:

```typescript
// Get user's tenants for switcher
const tenants = await getUserTenants(userId);

// Returns:
[
  { slug: "acme-corp", name: "Acme Corp", role: "owner", type: "organization" },
  { slug: "acme-engineering", name: "Engineering", role: "admin", type: "team" },
  { slug: "personal-123", name: "My Workspace", role: "owner", type: "personal" }
]
```

The switcher groups by type and shows hierarchy.

---

## Branding

Each tenant can customize their appearance:

```json
// tenants.settings.branding
{
  "emoji": "🚀",
  "brandColor": "#3b82f6",
  "description": "Building the future"
}
```

This is displayed in the sidebar and workspace switcher.

---

## Custom Domains

Organizations can use their own domain:

```json
// tenants.settings
{
  "customDomain": "portal.acme.com"
}
```

The middleware checks for custom domains and resolves to the correct tenant.

---

## Why This Approach?

### Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Database per tenant** | Complete isolation | Expensive, complex migrations |
| **Schema per tenant** | Good isolation | Doesn't scale well |
| **Row-level (our choice)** | Simple, scales well | Requires careful query discipline |

### Our Choice: Row-Level with Strong Conventions

- Single database, single schema
- Every query includes `tenant_id`
- Middleware enforces tenant context
- Server actions validate membership

This balances simplicity with proper isolation for most SaaS use cases.

---

## Related Documentation

- **[Architecture](./architecture.md)** - Overall system design
- **[API Reference](../reference/api/)** - Tenant discovery endpoints
- **[Database Schema](../reference/database/)** - Table definitions
