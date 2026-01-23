# Scripts

Utility scripts for NexusCanon-AXIS development and operations.

## Available Scripts

### `seed.ts` - Database Seed

Creates demo data for development and testing.

```bash
# Run with environment from .env.local
pnpm tsx scripts/seed.ts

# Or with specific DATABASE_URL
DATABASE_URL="postgresql://..." pnpm tsx scripts/seed.ts
```

**What it creates:**
- 2 users (admin + demo)
- 3 tenants (organization + team + personal)
- 5 memberships with appropriate roles
- 3 audit log entries

**Neon Best Practices Applied:**
- Uses connection pooling (`-pooler` suffix)
- Single transaction for atomicity
- Idempotent (safe to run multiple times)
- UPSERT patterns to avoid duplicates

---

## Neon Connection Guidelines

When creating new scripts that connect to Neon:

### 1. Use Pooled Connections

Always use the `-pooler` suffix in your DATABASE_URL:

```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb
                           ^^^^^^^ required for serverless
```

### 2. Limit Connections

Scripts should use minimal connections:

```typescript
const sql = postgres(DATABASE_URL, {
  max: 1,           // Scripts only need 1 connection
  idle_timeout: 20, // Close idle connections
  connect_timeout: 10,
});
```

### 3. Use Transactions

Wrap related operations in transactions:

```typescript
await sql.begin(async (tx) => {
  await tx`INSERT INTO ...`;
  await tx`UPDATE ...`;
});
```

### 4. Clean Up

Always close the connection when done:

```typescript
try {
  // ... operations
} finally {
  await sql.end();
}
```

### 5. Branch Awareness

For branch-specific operations, use `BRANCH_ID`:

```typescript
const branchId = process.env.BRANCH_ID;
console.log(`Operating on branch: ${branchId}`);
```

---

## References

- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Neon Node.js Guide](https://neon.tech/docs/guides/node)
- [Neon Branching](https://neon.tech/docs/introduction/branching)
