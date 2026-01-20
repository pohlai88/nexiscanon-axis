# Drizzle + Read Replica Integration Guide

## How Read Replicas Work with Drizzle

Drizzle ORM connects to your Neon database via the `@neondatabase/serverless` driver. To use read replicas, you need **separate Drizzle instances** pointing to different Neon endpoints:

```
Primary Drizzle Instance → DATABASE_URL → Read-Write Compute
Replica Drizzle Instance → DATABASE_URL_REPLICA → Read-Only Compute
                                    ↓
                            Same Pageserver (Same Data)
```

## Updated Architecture

Your `packages/db/src/client.ts` now exports:

### Primary Database (Read-Write)
```typescript
import { getDb } from "@workspace/db";

const db = getDb(); // Singleton, uses DATABASE_URL
```

### Read Replica (Read-Only)
```typescript
import { getReplicaDb } from "@workspace/db";

const replicaDb = getReplicaDb(); // Singleton, uses DATABASE_URL_REPLICA
```

## Usage Examples

### 1. Basic Read Operations

```typescript
import { getDb, getReplicaDb } from "@workspace/db";
import { users } from "@workspace/db/schema";

// ❌ DON'T: Use primary for everything
const allUsers = await getDb().select().from(users);

// ✅ DO: Use replica for read-only queries
const allUsers = await getReplicaDb().select().from(users);
```

### 2. Analytics & Reporting

```typescript
import { getReplicaDb } from "@workspace/db";
import { requests } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

// Heavy analytics query on read replica
const report = await getReplicaDb()
  .select({
    month: sql`date_trunc('month', ${requests.createdAt})`,
    count: sql`count(*)`,
    avgTime: sql`avg(${requests.processingTime})`,
  })
  .from(requests)
  .where(sql`${requests.createdAt} > now() - interval '1 year'`)
  .groupBy(sql`date_trunc('month', ${requests.createdAt})`);
```

### 3. Write Operations

```typescript
import { getDb } from "@workspace/db";
import { users } from "@workspace/db/schema";

// ✅ ALWAYS use primary for writes
const newUser = await getDb()
  .insert(users)
  .values({
    email: "user@example.com",
    name: "John Doe",
  })
  .returning();
```

### 4. Read-After-Write (Important!)

```typescript
import { getDb, getReplicaDb } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

// Write to primary
const newUser = await getDb()
  .insert(users)
  .values({ email: "user@example.com", name: "John" })
  .returning();

// ❌ DON'T: Read from replica immediately after write
// (May not see the new user yet due to async replication)
const user = await getReplicaDb()
  .select()
  .from(users)
  .where(eq(users.id, newUser[0].id));

// ✅ DO: Read from primary for read-after-write
const user = await getDb()
  .select()
  .from(users)
  .where(eq(users.id, newUser[0].id));
```

### 5. Dashboard Queries

```typescript
import { getReplicaDb } from "@workspace/db";
import { requests, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

// User dashboard - can tolerate slight lag
const userRequests = await getReplicaDb()
  .select()
  .from(requests)
  .leftJoin(users, eq(requests.userId, users.id))
  .where(eq(requests.userId, currentUserId))
  .limit(50);
```

### 6. Real Example: Request Repository

```typescript
// packages/db/src/repos/requests.ts
import { getDb, getReplicaDb } from "../client";
import { requests } from "../schema";
import { eq } from "drizzle-orm";

export class RequestRepository {
  // Write operations → use primary
  async create(data: InsertRequest) {
    return await getDb()
      .insert(requests)
      .values(data)
      .returning();
  }

  async update(id: string, data: Partial<InsertRequest>) {
    return await getDb()
      .update(requests)
      .set(data)
      .where(eq(requests.id, id))
      .returning();
  }

  // Read operations → use replica when possible
  async findById(id: string, useReplica = true) {
    const db = useReplica ? getReplicaDb() : getDb();
    return await db
      .select()
      .from(requests)
      .where(eq(requests.id, id))
      .limit(1);
  }

  async list(filters: any) {
    // List queries are perfect for replicas
    return await getReplicaDb()
      .select()
      .from(requests)
      // ... filters
      .limit(100);
  }

  // After write, read from primary
  async createAndFetch(data: InsertRequest) {
    const [created] = await getDb()
      .insert(requests)
      .values(data)
      .returning();
    
    // Use primary to ensure consistency
    return await this.findById(created.id, false);
  }
}
```

## Decision Tree: Which Database to Use?

```
┌─────────────────────────────────┐
│   Is it a WRITE operation?      │
└────────┬─────────────────────┬──┘
         │ YES                 │ NO
         ↓                     ↓
    ┌────────┐          ┌──────────────────┐
    │ Use    │          │ Did you just     │
    │ Primary│          │ write this data? │
    └────────┘          └────┬──────────┬──┘
                             │ YES      │ NO
                             ↓          ↓
                        ┌────────┐  ┌─────────┐
                        │ Use    │  │ Use     │
                        │ Primary│  │ Replica │
                        └────────┘  └─────────┘
```

## Configuration

### Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:pass@ep-primary-pooler.region.neon.tech/neondb
DATABASE_URL_REPLICA=postgresql://user:pass@ep-replica-pooler.region.neon.tech/neondb
```

### Fallback Behavior

If `DATABASE_URL_REPLICA` is not set:
- `getReplicaDb()` automatically falls back to primary
- No code changes needed
- Logs: `[DB] No read replica configured, using primary for reads`

## Performance Considerations

### Latency
- **Read Replica Lag**: Typically < 100ms (eventually consistent)
- **Same Storage**: No network transfer between primary and replica
- **Pooler**: Both primary and replica use connection pooling

### Cost
- **Storage**: $0 extra (same storage, no duplication)
- **Compute**: Only pay for active compute time
- **Scale-to-Zero**: Replicas can suspend when idle

### When to Use Replicas

✅ **GOOD for replicas:**
- Analytics queries (complex aggregations)
- Reporting (historical data)
- Dashboard loads (user-facing, slight lag OK)
- List operations (paginated results)
- Search queries
- Read-heavy workloads

❌ **NOT good for replicas:**
- Read-after-write scenarios
- Critical real-time data
- Transaction consistency requirements
- Immediately after updates/inserts

## Migration Guide

### Step 1: Create Read Replica

```bash
pnpm neon:create-replica production
```

### Step 2: Add to Environment

```bash
# Copy connection string from script output
echo "DATABASE_URL_REPLICA=postgresql://..." >> .env
```

### Step 3: Update Code Gradually

Start with non-critical reads:

```typescript
// Before
const users = await getDb().select().from(users);

// After
const users = await getReplicaDb().select().from(users);
```

### Step 4: Test & Monitor

```bash
# Monitor query performance
pnpm db:performance

# Check replica status
pnpm neon:list-replicas
```

## Best Practices

### 1. Explicit Replica Choice

```typescript
// ✅ GOOD: Clear intent
async function getReport(useReplica = true) {
  const db = useReplica ? getReplicaDb() : getDb();
  return await db.select().from(reports);
}

// ❌ BAD: Hidden replica usage
async function getReport() {
  // Unclear if using replica
  return await getReplicaDb().select().from(reports);
}
```

### 2. Repository Pattern

```typescript
class UserRepository {
  // Default to replica for reads
  async findMany(useReplica = true) {
    const db = useReplica ? getReplicaDb() : getDb();
    return await db.select().from(users);
  }

  // Always use primary for writes
  async create(data: InsertUser) {
    return await getDb().insert(users).values(data);
  }
}
```

### 3. Type Safety

```typescript
import type { Database, ReplicaDatabase } from "@workspace/db";

// Enforce read-only operations
function runAnalytics(db: ReplicaDatabase) {
  // TypeScript ensures no writes
  return db.select().from(requests);
}
```

## Troubleshooting

### Issue: "Data not found after insert"

```typescript
// ❌ WRONG: Reading from replica immediately
await getDb().insert(users).values(data);
const user = await getReplicaDb().select()...;

// ✅ RIGHT: Read from primary after write
await getDb().insert(users).values(data);
const user = await getDb().select()...;
```

### Issue: "Using replica but still hitting primary"

```bash
# Check logs for:
[DB] No read replica configured, using primary for reads

# Solution: Set DATABASE_URL_REPLICA in .env
```

### Issue: "Replica lag too high"

- Read replicas are async (typically < 100ms lag)
- For critical reads, use primary
- Monitor with pg_stat_statements

## Testing

### Unit Tests

```typescript
import { createDb, createReplicaDb } from "@workspace/db/client";

describe("Database Client", () => {
  it("should use replica when configured", () => {
    process.env.DATABASE_URL_REPLICA = "postgresql://...";
    const replicaDb = createReplicaDb();
    expect(replicaDb).toBeDefined();
  });

  it("should fallback to primary when no replica", () => {
    delete process.env.DATABASE_URL_REPLICA;
    const replicaDb = createReplicaDb();
    // Should not throw, falls back to primary
    expect(replicaDb).toBeDefined();
  });
});
```

## Summary

### Key Points
1. **Drizzle needs separate instances** for primary vs replica
2. **Use `getDb()` for writes**, `getReplicaDb()` for reads
3. **Read-after-write must use primary** (consistency)
4. **Replicas are eventually consistent** (< 100ms lag typically)
5. **Automatic fallback** if no replica configured

### Quick Reference

| Operation | Use | Reason |
|-----------|-----|--------|
| INSERT/UPDATE/DELETE | `getDb()` | Writes only on primary |
| SELECT after write | `getDb()` | Ensure consistency |
| Analytics queries | `getReplicaDb()` | Offload heavy reads |
| Dashboard queries | `getReplicaDb()` | Slight lag acceptable |
| List operations | `getReplicaDb()` | Read-heavy, non-critical |
| Search queries | `getReplicaDb()` | Distribute load |

### Files Updated
- ✅ `packages/db/src/client.ts` - Added replica support
- ✅ Exports: `getReplicaDb()`, `createReplicaDb()`
- ✅ Automatic fallback to primary if no replica
- ✅ Connection pooling for both primary and replica

**Status**: Ready to use! Start with analytics/reporting queries.
