# Neon WebSocket Support Guide

## Overview

Neon's `@neondatabase/serverless` driver supports **two connection modes**:

1. **HTTP Mode** (what you're currently using with Drizzle)
2. **WebSocket Mode** (for transactions and interactive sessions)

### Current Project Status

```typescript
// Your current setup (HTTP mode via Drizzle)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http"; // ← HTTP mode

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });
```

**Driver Version**: `@neondatabase/serverless` v0.10.0

## HTTP vs WebSocket Mode

### HTTP Mode (Current - What You're Using)

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(DATABASE_URL);

// Single query via HTTP
const result = await sql`SELECT * FROM users`;
```

**Pros:**
- ✅ Simpler, less overhead
- ✅ Stateless (perfect for serverless)
- ✅ Works in all edge environments
- ✅ Faster for single queries

**Cons:**
- ❌ No transactions (BEGIN/COMMIT/ROLLBACK)
- ❌ No session state
- ❌ Can't use prepared statements
- ❌ Each query is independent

### WebSocket Mode (For Transactions)

```typescript
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws"; // Required for Node.js < v22

// Configure WebSocket (Node.js < v22 only)
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: DATABASE_URL });

// Now you can use transactions!
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO audit_logs ...');
  await client.query('COMMIT');
} finally {
  client.release();
}
```

**Pros:**
- ✅ Full transaction support
- ✅ Session state maintained
- ✅ Prepared statements
- ✅ Compatible with `pg` (node-postgres) API

**Cons:**
- ⚠️ More overhead (WebSocket handshake)
- ⚠️ Must close connections properly
- ⚠️ Not ideal for edge (connection persistence issues)

## When to Use Each Mode

| Use Case | Mode | Reason |
|----------|------|--------|
| **Simple SELECT queries** | HTTP | Faster, stateless |
| **INSERT/UPDATE/DELETE (single)** | HTTP | No transaction needed |
| **Drizzle ORM queries** | HTTP | Default Drizzle mode |
| **Multi-step transactions** | WebSocket | Need BEGIN/COMMIT |
| **Conditional updates** | WebSocket | Need session state |
| **Audit trail + data change** | WebSocket | Atomic transaction |
| **Edge/Serverless functions** | HTTP | Better for stateless |

## Your Project's Use Cases

### Current (HTTP Mode - Perfect for Most Cases)

```typescript
// ✅ GOOD: Simple CRUD via Drizzle (HTTP mode)
const users = await db.select().from(users);
const [created] = await db.insert(users).values(data).returning();
const [updated] = await db.update(users).set(data).where(eq(users.id, id));
```

### When You'd Need WebSocket Mode

```typescript
// Complex audit trail scenario
async function createRequestWithAudit(data: CreateRequestData) {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create request
    const request = await client.query(
      'INSERT INTO requests (...) VALUES (...) RETURNING *'
    );
    
    // 2. Create audit log (must succeed together)
    await client.query(
      'INSERT INTO audit_logs (action, request_id, user_id) VALUES ($1, $2, $3)',
      ['created', request.rows[0].id, userId]
    );
    
    // 3. Link evidence files
    if (evidenceIds.length > 0) {
      await client.query(
        'INSERT INTO request_evidence_links ...'
      );
    }
    
    await client.query('COMMIT');
    return request.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
```

## Integration with Your Stack

### Option 1: Keep HTTP Mode (Recommended for Now)

**Your current setup is fine for 95% of use cases.**

```typescript
// packages/db/src/client.ts (current)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// This uses HTTP mode - perfect for most queries
export function createDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}
```

**When HTTP mode is sufficient:**
- ✅ CRUD operations via Drizzle
- ✅ Read queries (with or without joins)
- ✅ Single inserts/updates
- ✅ RLS-filtered queries
- ✅ Analytics queries

### Option 2: Add WebSocket Support (For Transactions)

If you need transactions, add a separate WebSocket client:

```typescript
// packages/db/src/client.ts
import { neon, Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Configure WebSocket for Node.js < v22
if (typeof WebSocket === 'undefined') {
  const ws = require('ws');
  neonConfig.webSocketConstructor = ws;
}

// HTTP mode (existing - keep this)
export function createDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
}

// WebSocket mode (new - for transactions)
export function createPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    // For serverless, ensure connections close
    max: 1, // Only 1 connection in serverless
    idleTimeoutMillis: 1000,
  });
}

// Helper for transactions
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = createPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
```

**Usage:**

```typescript
// Regular query (HTTP mode)
const users = await getDb().select().from(users);

// Transaction (WebSocket mode)
await withTransaction(async (client) => {
  await client.query('INSERT INTO requests ...');
  await client.query('INSERT INTO audit_logs ...');
});
```

## Drizzle with WebSocket Mode

Drizzle **can** use WebSocket mode via the `neon-serverless` adapter:

```typescript
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// Now Drizzle uses WebSocket mode
// But you need to manage pool lifecycle!
```

**Trade-offs:**
- ✅ Transactions work with Drizzle syntax
- ❌ Must manage pool connections manually
- ❌ More complex in serverless environments
- ❌ Connection leaks if not closed properly

## Configuration

### Environment Variables

```bash
# .env
# Same connection string works for both modes
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db

# For WebSocket mode, pooler is still recommended
# The -pooler suffix works with both HTTP and WebSocket
```

### Node.js Version Considerations

```typescript
// Node.js >= v22: Native WebSocket support
// No extra configuration needed

// Node.js < v22: Need 'ws' package
import ws from 'ws';
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;
```

### Serverless Environment Best Practices

```typescript
// ❌ DON'T: Reuse pool across requests
const pool = new Pool(...); // Global - BAD in serverless

export async function handler(event) {
  const client = await pool.connect();
  // ...
}

// ✅ DO: Create and close within request
export async function handler(event) {
  const pool = new Pool(...);
  const client = await pool.connect();
  try {
    // ... your queries
  } finally {
    client.release();
    await pool.end(); // Important!
  }
}
```

## Performance Considerations

### HTTP Mode (Current)
- **Latency**: ~50-100ms per query (includes HTTP overhead)
- **Throughput**: High (stateless, scales easily)
- **Connection overhead**: Low (no persistent connection)

### WebSocket Mode
- **Latency**: ~20-50ms per query (after initial handshake)
- **Initial handshake**: ~100-200ms (one-time)
- **Throughput**: Lower (stateful connections)
- **Connection overhead**: Higher (must manage lifecycle)

### Recommendation for Your Project

**Stick with HTTP mode (current setup) unless you have specific transaction needs.**

If you need transactions:
1. Add WebSocket support for those specific cases
2. Keep HTTP mode for regular queries
3. Use a transaction helper function
4. Ensure proper connection cleanup

## Package Dependencies

### Current (HTTP Mode)
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.10.0",
    "drizzle-orm": "^0.38.0"
  }
}
```

### With WebSocket Support
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.10.0",
    "drizzle-orm": "^0.38.0",
    "ws": "^8.18.0" // Only if Node.js < v22
  },
  "devDependencies": {
    "@types/ws": "^8.5.12" // TypeScript support
  }
}
```

## Testing

### Test HTTP Mode
```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const result = await sql`SELECT 1 as test`;
console.log('HTTP mode works:', result[0].test === 1);
```

### Test WebSocket Mode
```typescript
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const client = await pool.connect();
try {
  const result = await client.query('SELECT 1 as test');
  console.log('WebSocket mode works:', result.rows[0].test === 1);
} finally {
  client.release();
  await pool.end();
}
```

## Common Issues

### Issue 1: "WebSocket is not defined"
```typescript
// Node.js < v22
import ws from 'ws';
import { neonConfig } from "@neondatabase/serverless";
neonConfig.webSocketConstructor = ws;
```

### Issue 2: Connection Pool Exhaustion
```typescript
// Always close pools in serverless!
try {
  // ... queries
} finally {
  await pool.end(); // Critical!
}
```

### Issue 3: Transaction Timeout
```typescript
// Set timeout for long-running transactions
const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 seconds
});
```

## Summary

### Current Setup (HTTP Mode)
- ✅ Perfect for your use case
- ✅ Simple, stateless, fast
- ✅ Works with Drizzle ORM
- ✅ No changes needed

### When to Add WebSocket Mode
- Need multi-step transactions
- Need session state (temp tables, etc.)
- Need prepared statements
- Need full `pg` compatibility

### Recommendation
**Keep HTTP mode (current setup) unless you have a specific transaction requirement.**

If you need transactions later:
1. Add WebSocket support alongside HTTP
2. Use HTTP for regular queries (90%+ of cases)
3. Use WebSocket only for transactions
4. Ensure proper connection cleanup

---

**Status**: HTTP mode is optimal for your current architecture. No changes needed unless you require transaction support.
