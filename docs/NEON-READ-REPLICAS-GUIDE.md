# Neon Read Replicas - Implementation Guide

## Overview

Neon read replicas are independent read-only computes that access the **same storage** as your primary compute. No data duplication or replication occurs, making them:

- ✅ **Instant to create** (~seconds, no data copy)
- ✅ **Cost-efficient** (no storage duplication)
- ✅ **Eventually consistent** (async updates via Safekeepers)
- ✅ **Scale-to-zero capable** (like primary computes)

## Current Setup

### Branches
- **Production**: `br-icy-darkness-a1eom4rq` (primary, default)
- **Test**: `br-withered-frog-a1rgjj2o`

### Existing Computes
```
Production Branch:
- ep-fancy-wildflower-a1o82bpk (read-write, primary)
- Region: aws-ap-southeast-1
- Autoscaling: 0.25-2 CU
- Pooler: Enabled ✅

Test Branch:
- ep-morning-fog-a1lvzmtd (read-write)
- Region: aws-ap-southeast-1
- Autoscaling: 0.25-2 CU
- Pooler: Enabled ✅
```

### Read Replica Capacity
**Free Plan Limit**: 3 read replicas max per project
**Current**: 0 read replicas (capacity for 3)

## Use Cases for Read Replicas

### 1. Horizontal Scaling
Distribute read traffic across multiple computes:
```
Primary (write) → Handle all writes + some reads
Read Replica 1 → Analytics queries
Read Replica 2 → User dashboard queries
Read Replica 3 → Reporting/exports
```

### 2. Analytics Workloads
Offload resource-intensive queries:
```typescript
// Heavy analytics on read replica
const analyticsDb = neon(process.env.DATABASE_URL_REPLICA);
const report = await analyticsDb`
  SELECT 
    date_trunc('month', created_at) as month,
    count(*) as requests,
    avg(processing_time) as avg_time
  FROM requests
  WHERE created_at > now() - interval '1 year'
  GROUP BY month
  ORDER BY month DESC
`;
```

### 3. Read-Only Access
Grant safe database access to users/tools:
- External reporting tools
- Third-party integrations
- Developer sandbox access
- QA/testing environments

## How to Create Read Replicas

### Method 1: Using Scripts (Recommended)

```bash
# Create read replica on production branch
pnpm neon:create-replica production

# Create read replica with custom settings
pnpm neon:create-replica production --min-cu 0.5 --max-cu 4

# List all replicas
pnpm neon:list-replicas

# Delete read replica
pnpm neon:delete-replica <endpoint-id>
```

### Method 2: Using Neon API

```bash
curl --request POST \
     --url https://console.neon.tech/api/v2/projects/dark-band-87285012/endpoints \
     --header 'Accept: application/json' \
     --header "Authorization: Bearer $NEON_API_KEY" \
     --header 'Content-Type: application/json' \
     --data '{
       "endpoint": {
         "type": "read_only",
         "branch_id": "br-icy-darkness-a1eom4rq",
         "autoscaling_limit_min_cu": 0.25,
         "autoscaling_limit_max_cu": 2,
         "pooler_enabled": true,
         "suspend_timeout_seconds": 300
       }
     }'
```

### Method 3: Using Neon Console

1. Go to: https://console.neon.tech/app/projects/dark-band-87285012
2. Select branch: "production"
3. Click "Add Read Replica"
4. Configure compute settings
5. Click "Create"

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
└────┬──────────────────────────────────┬─────────┘
     │ Writes + Some Reads              │ Reads Only
     │                                  │
┌────▼────────────┐              ┌─────▼──────────┐
│ Primary Compute │              │ Read Replica 1 │
│  (read-write)   │              │  (read-only)   │
└────┬────────────┘              └─────┬──────────┘
     │                                 │
     └────────┬────────────────────────┘
              │
         ┌────▼──────────┐
         │  Pageserver   │
         │ (Same Storage)│
         └───────────────┘
              ▲
              │ Safekeepers keep replicas up-to-date
              │
```

### Key Points
- **Same Storage**: All computes read from same Pageserver
- **Async Updates**: Safekeepers propagate changes to read replicas
- **Eventually Consistent**: Slight lag possible (typically < 100ms)
- **No Data Duplication**: Zero storage overhead

## Connection Strings

### Primary (Read-Write)
```bash
# For writes and reads
DATABASE_URL=postgresql://user:pass@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb
```

### Read Replica (Read-Only)
```bash
# After creating replica, you'll get a new endpoint:
DATABASE_URL_REPLICA=postgresql://user:pass@ep-<new-id>-pooler.ap-southeast-1.aws.neon.tech/neondb
```

### Application Configuration

```typescript
// packages/db/src/client.ts
import { neon } from "@neondatabase/serverless";

// Primary connection (writes + reads)
export const primaryDb = neon(process.env.DATABASE_URL!);

// Read replica connection (reads only)
export const replicaDb = process.env.DATABASE_URL_REPLICA 
  ? neon(process.env.DATABASE_URL_REPLICA)
  : primaryDb; // Fallback to primary if no replica

// Usage
async function getUsers() {
  // Use replica for read-only query
  return await replicaDb`SELECT * FROM users`;
}

async function createUser(data) {
  // Use primary for writes
  return await primaryDb`INSERT INTO users ...`;
}
```

## Cost Implications

### Without Read Replicas
```
Storage: $0.xxxxx/GB-month (shared across all computes)
Compute: 0.25-2 CU × $0.xxxxx/hour
```

### With Read Replicas (3 replicas)
```
Storage: $0.xxxxx/GB-month (SAME - no increase)
Primary Compute: 0.25-2 CU × $0.xxxxx/hour
Replica 1: 0.25-2 CU × $0.xxxxx/hour (with scale-to-zero)
Replica 2: 0.25-2 CU × $0.xxxxx/hour (with scale-to-zero)
Replica 3: 0.25-2 CU × $0.xxxxx/hour (with scale-to-zero)
```

**Key Savings**:
- ✅ No storage cost increase (no data duplication)
- ✅ Replicas can scale to zero when idle
- ✅ Pay only for compute time when active
- ✅ More cost-effective than traditional replication

## Best Practices

### 1. Connection Pooling
✅ **DO**: Enable pooler on all read replicas
```json
{
  "pooler_enabled": true,
  "pooler_mode": "transaction"
}
```

### 2. Scale-to-Zero
✅ **DO**: Configure suspend timeout for cost savings
```json
{
  "suspend_timeout_seconds": 300  // 5 minutes
}
```

### 3. Workload Distribution
✅ **DO**: Route queries strategically
- Heavy analytics → Replica 1
- User dashboards → Replica 2
- Reports/exports → Replica 3
- Writes → Primary only

### 4. Consistency Awareness
⚠️ **CONSIDER**: Read replicas are eventually consistent
```typescript
// After write, immediate read might not reflect change
await primaryDb`INSERT INTO users ...`;
// This MIGHT not see the new user yet (rare, < 100ms lag)
const users = await replicaDb`SELECT * FROM users`;
```

**Solution**: Use primary for read-after-write scenarios

### 5. Monitoring
✅ **DO**: Monitor replica lag and performance
```bash
# Check replica status
pnpm neon:list-replicas

# Monitor query performance
pnpm db:performance
```

## Limitations & Considerations

### Same-Region Only
❌ **Cannot create replicas in different regions**
- All replicas must be in: `aws-ap-southeast-1`
- For cross-region: Use logical replication (see below)

### Eventually Consistent
⚠️ **Slight lag possible** (typically < 100ms)
- Use primary for read-after-write
- Acceptable for analytics, reporting
- May not suit real-time dashboards

### Free Plan Limits
- Max 3 read replicas per project
- Same compute size limits apply

## Cross-Region Replication

For cross-region setup, use logical replication:

```bash
# Setup Neon-to-Neon logical replication
# 1. Create project in target region
# 2. Configure logical replication
# 3. Point read traffic to target region

# See: https://neon.tech/docs/guides/logical-replication-neon-to-neon
```

## Implementation Checklist

### Phase 1: Setup (This Guide)
- [ ] Review current compute configuration
- [ ] Determine read replica use cases
- [ ] Plan workload distribution strategy

### Phase 2: Create Replicas
- [ ] Create read replica on production branch
- [ ] Test read replica connectivity
- [ ] Verify performance and lag

### Phase 3: Application Integration
- [ ] Add `DATABASE_URL_REPLICA` to environment
- [ ] Update database client to support replicas
- [ ] Route appropriate queries to replicas
- [ ] Test read-after-write scenarios

### Phase 4: Monitoring & Optimization
- [ ] Monitor replica performance with pg_stat_statements
- [ ] Adjust autoscaling settings as needed
- [ ] Configure scale-to-zero for cost optimization
- [ ] Set up alerts for replica lag (if needed)

## Quick Reference

### Create Read Replica
```bash
# Via script (after implementation)
pnpm neon:create-replica production

# Via API
curl -X POST https://console.neon.tech/api/v2/projects/dark-band-87285012/endpoints \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{"endpoint": {"type": "read_only", "branch_id": "br-icy-darkness-a1eom4rq"}}'
```

### List Replicas
```bash
pnpm neon:list-replicas
# Or check: https://console.neon.tech/app/projects/dark-band-87285012
```

### Delete Replica
```bash
pnpm neon:delete-replica <endpoint-id>
```

## Resources

- **Official Docs**: https://neon.tech/docs/introduction/read-replicas
- **Create & Manage Guide**: https://neon.tech/docs/guides/read-replica-guide
- **Integration Examples**: https://neon.tech/docs/guides/read-replica-integrations
- **Console**: https://console.neon.tech/app/projects/dark-band-87285012

## Next Steps

1. **Decide on use case**: Analytics? Horizontal scaling? Read-only access?
2. **Create first replica**: Start with one on production branch
3. **Update application**: Add replica connection string support
4. **Test & monitor**: Verify performance improvement
5. **Scale as needed**: Add more replicas (up to 3 on Free plan)

---

**Current Status**: No read replicas configured
**Next Action**: Create first read replica for [your use case]
**Scripts**: Ready (once implemented in next step)
