# Neon SaaS Optimization Guide

## Overview
This document outlines the optimizations made to align the NexusCanon-AXIS project with [Neon SaaS best practices](https://neon.com/use-cases/postgres-for-saas).

## Optimizations Applied

### 1. ✅ Connection Pooling (pgBouncer)
**Status**: Auto-configured in application code

**Change**: Updated `packages/db/src/client.ts` to automatically use `-pooler` endpoint suffix.

**Benefits**:
- Handles high connection counts efficiently
- Reduces connection overhead
- Built-in pgBouncer at no extra cost
- Essential for serverless/edge environments

**Implementation**:
```typescript
// Automatically converts:
// ep-fancy-wildflower-a1o82bpk.ap-southeast-1.aws.neon.tech
// To:
// ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech
```

### 2. ⏳ Scale-to-Zero Configuration
**Status**: Requires API key to enable

**Target**: Set `suspend_timeout_seconds: 300` (5 minutes)

**Benefits**:
- Automatic compute suspension during idle periods
- Significant cost savings for variable workloads
- Instant wake-up when new requests arrive

**How to Enable**:
1. Get Neon API key from: https://console.neon.tech/app/settings/api-keys
2. Run the optimization script:
   ```bash
   NEON_API_KEY=your_key_here tsx scripts/optimize-neon-config.ts
   ```

### 3. ⏳ Enable Pooler on Computes
**Status**: Requires API key to enable

**Target**: Set `pooler_enabled: true` on both computes

**How to Enable**: Same script as above handles both optimizations

## Cost Impact

### Before Optimization
- Compute never suspends (24/7 running)
- Direct connections without pooling
- Estimated cost: ~$20-40/month (varies by usage)

### After Optimization
- Compute suspends after 5 min idle
- Connection pooling reduces overhead
- Estimated cost: ~$5-15/month (varies by usage)
- **Potential savings: 50-75%** for typical SaaS workloads

## Performance Impact

### Connection Pooling
- ✅ Faster connection reuse
- ✅ Better handling of connection spikes
- ✅ Reduced latency for serverless functions
- ⚠️ Slight overhead for very first connection (minimal)

### Scale-to-Zero
- ✅ Cost-efficient for dev/test environments
- ✅ Production workloads stay active during business hours
- ⚠️ ~500ms cold start when waking from suspension
- 💡 Tip: Use keep-alive pings for critical production workloads

## Already Configured

### ✅ Database Branching
- Production branch: `br-icy-darkness-a1eom4rq`
- Test branch: `test-integration`
- Instant, copy-on-write clones

### ✅ Autoscaling
- Min: 0.25 CU, Max: 2 CU
- Automatic CPU/memory scaling

### ✅ Serverless Driver
- `@neondatabase/serverless` (HTTP-based)
- Perfect for edge/serverless environments

### ✅ Neon Auth
- 9 tables provisioned
- OAuth ready (Google/GitHub)
- JWT validation infrastructure

## Recommended Next Steps

### High Priority
1. **Run the optimization script** to enable pooling + scale-to-zero
   ```bash
   NEON_API_KEY=your_key tsx scripts/optimize-neon-config.ts
   ```

2. **Set up Branch-per-PR automation**
   - [Neon GitHub Integration](https://neon.com/docs/guides/branching-github-actions)
   - [Neon Vercel Integration](https://neon.com/docs/guides/vercel)

3. **Monitor storage limits**
   - Current: 512 MB per branch
   - Track usage in Neon Console
   - Upgrade plan if approaching limits

### Medium Priority
4. **Consider Neon Data API** (PostgREST-compatible)
   - HTTP-based database access
   - RLS policy enforcement
   - Use MCP tool: `provision_neon_data_api`

5. **Review production suspend timeout**
   - 300s (5 min) good for dev/test
   - Consider 60s for very active production
   - Or 0s (never suspend) for latency-critical workloads

### Low Priority
6. **IP Allow List** (if needed for compliance)
7. **Private Link** (Enterprise feature for VPC isolation)

## Verification

### Connection String Format
After optimization, your connection strings should use `-pooler`:

```bash
# ✅ Good (uses pooler)
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db

# ❌ Bad (direct connection, no pooling)
postgresql://user:pass@ep-xxx.region.aws.neon.tech/db
```

### Check Compute Status
```bash
# Should show pooler_enabled: true, suspend_timeout_seconds: 300
tsx scripts/neon-info.ts
```

## References
- [Neon SaaS Use Case](https://neon.com/use-cases/postgres-for-saas)
- [Connection Pooling Guide](https://neon.com/docs/connect/connection-pooling)
- [Autoscaling Documentation](https://neon.com/docs/introduction/autoscaling)
- [Branching Guide](https://neon.com/docs/introduction/branching)
