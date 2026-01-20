# Drizzle + Neon Read Replicas: How They Work Together

## The Connection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your Next.js Application                     │
└──────────────────────┬──────────────────────────┬───────────────┘
                       │                          │
                   WRITES                      READS
                       │                          │
                       ↓                          ↓
         ┌─────────────────────┐    ┌─────────────────────────┐
         │ import { getDb }    │    │ import { getReplicaDb } │
         │ from "@workspace/db"│    │ from "@workspace/db"    │
         └──────────┬──────────┘    └───────────┬─────────────┘
                    │                            │
                    ↓                            ↓
      ┌──────────────────────────┐  ┌─────────────────────────────┐
      │ Drizzle Instance #1      │  │ Drizzle Instance #2         │
      │ (Primary)                │  │ (Replica)                   │
      └──────────┬───────────────┘  └───────────┬─────────────────┘
                 │                               │
                 ↓                               ↓
    ┌────────────────────────┐      ┌───────────────────────────┐
    │ @neondatabase/         │      │ @neondatabase/            │
    │ serverless             │      │ serverless                │
    │ (Primary Connection)   │      │ (Replica Connection)      │
    └────────────┬───────────┘      └───────────┬───────────────┘
                 │                               │
                 ↓                               ↓
    DATABASE_URL (env var)          DATABASE_URL_REPLICA (env var)
                 │                               │
                 ↓                               ↓
    ┌────────────────────────────────────────────────────────────┐
    │                      Neon Infrastructure                    │
    ├────────────────────┬───────────────────────────────────────┤
    │ Primary Compute    │ Read Replica Compute                  │
    │ (Read-Write)       │ (Read-Only)                           │
    │ ep-fancy-wildflower│ ep-<replica-id>                       │
    │ -pooler.neon.tech  │ -pooler.neon.tech                     │
    └────────┬───────────┴───────────┬───────────────────────────┘
             │                       │
             │    Both read from     │
             └───────────┬───────────┘
                         ↓
              ┌─────────────────────┐
              │   Pageserver        │
              │  (SAME STORAGE)     │
              │  No Data Duplication│
              └─────────────────────┘
```

## Key Concepts

### 1. Two Separate Drizzle Instances

Drizzle doesn't automatically know about read replicas. You need to:

```typescript
// Primary Drizzle instance
const primarySql = neon(DATABASE_URL);
const primaryDb = drizzle(primarySql, { schema });

// Replica Drizzle instance
const replicaSql = neon(DATABASE_URL_REPLICA);
const replicaDb = drizzle(replicaSql, { schema });
```

### 2. Same Schema, Different Endpoints

Both Drizzle instances use the **same schema definition**, but connect to **different Neon endpoints**:

```typescript
import * as schema from "./schema"; // SAME schema

// But different connections:
drizzle(primarySql, { schema });  // → Primary compute
drizzle(replicaSql, { schema });  // → Replica compute
```

### 3. Smart Routing in Your Code

**YOU decide** which instance to use based on the operation:

```typescript
// Write → Primary
await getDb().insert(users).values(data);

// Read → Replica (when safe)
await getReplicaDb().select().from(users);

// Read-after-write → Primary (for consistency)
const [user] = await getDb().insert(users).values(data).returning();
const fresh = await getDb().select().from(users).where(eq(users.id, user.id));
```

## Why This Architecture?

### Q: Why not use a single Drizzle instance that routes automatically?

**A**: Drizzle ORM doesn't have built-in read/write splitting. The connection is determined at creation time, not per-query.

### Q: Why not use PostgreSQL read replica URLs directly?

**A**: Neon read replicas are **not PostgreSQL streaming replicas**. They're separate computes that both read from the same Pageserver (Neon's storage layer).

### Q: Do I need to configure anything in Drizzle?

**A**: No! Drizzle just needs a connection. The "replica magic" happens at the Neon level (Pageserver + Safekeepers).

## Comparison with Traditional Replication

### Traditional PostgreSQL Replication
```
Primary DB (Write) → Streaming Replication → Replica DB (Read)
       ↓                                           ↓
  Storage 1 (10GB)                           Storage 2 (10GB)
                    [20GB total storage used]
```

### Neon Read Replicas
```
Primary Compute → ┐
                  ├→ Same Pageserver → Storage (10GB)
Replica Compute → ┘
                    [10GB total storage used]
```

## Real-World Query Flow

### Example: Dashboard Loading

```typescript
// 1. User requests dashboard
async function loadDashboard(userId: string) {
  // Step 1: Get user (replica)
  const user = await getReplicaDb()
    .select()
    .from(users)
    .where(eq(users.id, userId));
  
  // Step 2: Get recent requests (replica)
  const requests = await getReplicaDb()
    .select()
    .from(requests)
    .where(eq(requests.userId, userId))
    .limit(10);
  
  // Step 3: Get statistics (replica)
  const stats = await getReplicaDb()
    .select({
      total: sql`count(*)`,
      pending: sql`count(*) filter (where status = 'pending')`,
    })
    .from(requests)
    .where(eq(requests.userId, userId));
  
  return { user, requests, stats };
}

// All 3 queries hit the read replica compute
// Primary compute handles only writes
```

### Example: Create Request

```typescript
async function createRequest(data: InsertRequest) {
  // Step 1: Insert (primary)
  const [created] = await getDb()
    .insert(requests)
    .values(data)
    .returning();
  
  // Step 2: Immediate read - MUST use primary
  const request = await getDb()
    .select()
    .from(requests)
    .where(eq(requests.id, created.id));
  
  // If we used replica here, might not see the new request yet!
  // (async replication delay ~100ms)
  
  return request;
}
```

## Environment Variable Strategy

```bash
# .env (local development - no replica)
DATABASE_URL=postgresql://...@ep-primary-pooler.neon.tech/neondb
# DATABASE_URL_REPLICA not set → falls back to primary

# .env.production (with replica)
DATABASE_URL=postgresql://...@ep-primary-pooler.neon.tech/neondb
DATABASE_URL_REPLICA=postgresql://...@ep-replica-pooler.neon.tech/neondb
```

**Benefit**: Same code works with or without replicas!

## Summary

### How They Work Together

| Component | Role |
|-----------|------|
| **Drizzle ORM** | Provides type-safe query builder |
| **@neondatabase/serverless** | Connects to Neon via HTTP |
| **Neon Primary Compute** | Handles writes + reads |
| **Neon Read Replica** | Handles reads only |
| **Pageserver** | Serves data to ALL computes |
| **Safekeepers** | Keep replicas up-to-date |

### Your Responsibilities

1. ✅ Create separate Drizzle instances (`getDb()` vs `getReplicaDb()`)
2. ✅ Route writes to primary instance
3. ✅ Route reads to replica instance (when safe)
4. ✅ Use primary for read-after-write scenarios

### Neon's Responsibilities

1. ✅ Store data once (Pageserver)
2. ✅ Serve reads from same storage to all computes
3. ✅ Keep replicas in sync (Safekeepers)
4. ✅ Handle connection pooling (pgBouncer)

---

**Bottom Line**: Drizzle connects to Neon. Neon provides the replica infrastructure. You choose which connection to use for each query.
