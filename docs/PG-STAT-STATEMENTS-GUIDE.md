# pg_stat_statements Extension - Query Performance Monitoring

## ✅ Installation Complete

The `pg_stat_statements` extension has been successfully installed on your Neon database.

### Extension Details
- **Version**: 1.11
- **Database**: neondb
- **PostgreSQL**: 17.7
- **Status**: Active and tracking queries

## What is pg_stat_statements?

`pg_stat_statements` tracks execution statistics for all SQL statements executed on your database:
- Execution times (mean, min, max)
- Query frequency (call count)
- Resource usage (rows returned, blocks read)
- Standard deviation (performance consistency)

Since Neon doesn't log queries and has limited built-in performance visibility, this extension is **essential** for troubleshooting and optimization.

## Quick Start

### View Query Performance
```bash
# Show top 10 slow queries
pnpm db:performance

# Show top 20 slow queries
pnpm db:performance --limit=20

# Find queries slower than 500ms
pnpm db:performance --min-time=500
```

### Reset Statistics
```bash
# Clear all statistics (useful after testing)
pnpm db:reset-stats
```

## Usage Examples

### 1. Find Slow Queries
```bash
pnpm db:performance
```

Output:
```
📊 Top Slow Queries (by average execution time)

1. SELECT * FROM requests WHERE status = $1 ORDER BY created_at DESC
   Calls: 234 | Avg: 145.23ms | Min: 89.12ms | Max: 456.78ms
   Total Time: 33.98s | Rows: 2340

2. SELECT r.*, u.name FROM requests r JOIN users u ON r.user_id = u.id...
   Calls: 89 | Avg: 98.45ms | Min: 45.23ms | Max: 234.56ms
   Total Time: 8.76s | Rows: 890
```

### 2. Find Most Frequent Queries
```bash
pnpm db:performance
```

Shows queries ordered by call count (helps identify caching opportunities).

### 3. Find Queries Above Threshold
```bash
# Find all queries averaging > 1 second
pnpm db:performance --min-time=1000
```

### 4. Direct SQL Queries

#### Top 5 Slowest Queries
```sql
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 5;
```

#### Most Frequently Called
```sql
SELECT 
  query,
  calls,
  mean_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 5;
```

#### Queries Using Most Total Time
```sql
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 5;
```

## Available Scripts

### `scripts/query-performance.ts`
Comprehensive performance analysis tool with:
- Top slow queries (by avg time)
- Most frequent queries
- Threshold filtering
- Formatted output with colors

### `scripts/reset-query-stats.ts`
Resets all pg_stat_statements counters. Use when:
- Starting fresh performance analysis
- After testing/benchmarking
- When statistics are outdated

## Optimization Workflow

### 1. Identify Slow Queries
```bash
pnpm db:performance --min-time=100
```

### 2. Analyze Query Plan
```bash
# Use Neon MCP tool or psql
EXPLAIN ANALYZE <your slow query>;
```

### 3. Add Indexes
```sql
-- Example: If queries filter by status frequently
CREATE INDEX idx_requests_status ON requests(status);

-- Example: If queries join on user_id
CREATE INDEX idx_requests_user_id ON requests(user_id);
```

### 4. Verify Improvement
```bash
# Reset stats
pnpm db:reset-stats

# Run application
pnpm dev

# Check performance again
pnpm db:performance
```

## Integration with Neon MCP

You can use Neon MCP tools for advanced analysis:

```typescript
// Via AI Assistant:
"Show me slow queries from pg_stat_statements"
"Analyze the execution plan for: SELECT * FROM requests WHERE status = 'pending'"
"Suggest indexes for my slow queries"
```

The AI will use:
- `mcp_Neon_list_slow_queries` - Built-in slow query detection
- `mcp_Neon_explain_sql_statement` - Query plan analysis
- `mcp_Neon_prepare_query_tuning` - Automated optimization suggestions

## Best Practices

### ✅ DO
- Monitor regularly (weekly or after major releases)
- Reset stats after schema changes
- Focus on queries with high `total_exec_time` (biggest impact)
- Consider both frequency AND duration
- Use `EXPLAIN ANALYZE` for detailed investigation

### ⚠️ CAUTION
- pg_stat_statements uses memory (tracks 5000 queries by default)
- Very long queries are truncated (1024 chars default)
- Statistics persist across server restarts (until reset)
- Parameterized queries are normalized (e.g., `WHERE id = $1`)

### ❌ DON'T
- Don't optimize queries with <10ms avg time (diminishing returns)
- Don't reset stats in production without reason
- Don't ignore frequent queries (even if fast, they add up)
- Don't forget to reanalyze after adding indexes

## Troubleshooting

### Issue: No Data Showing
**Cause**: No queries have been executed yet
**Solution**: Run your application, then check again

### Issue: Query Truncated
**Cause**: Default 1024 char limit
**Solution**: View full query in application logs or increase `track_activity_query_size`

### Issue: Stats Reset Unexpectedly
**Cause**: Someone ran `pg_stat_statements_reset()`
**Solution**: Statistics accumulate over time; just wait and monitor again

### Issue: High Memory Usage
**Cause**: Tracking too many unique queries
**Solution**: Increase parameterization (use prepared statements)

## Configuration

### Current Settings (Neon Defaults)
```sql
-- Check current configuration
SELECT 
  name, 
  setting, 
  unit 
FROM pg_settings 
WHERE name LIKE 'pg_stat_statements%';
```

### Key Parameters
- `pg_stat_statements.max` - Max queries tracked (default: 5000)
- `pg_stat_statements.track` - What to track (default: top)
- `track_activity_query_size` - Query text length (default: 1024)

**Note**: On Neon, some parameters cannot be modified (managed service).

## Resources

- **Script Location**: `scripts/query-performance.ts`
- **Extension Docs**: https://www.postgresql.org/docs/17/pgstatstatements.html
- **Neon Performance**: https://neon.com/docs/guides/performance
- **Query Optimization**: `docs/NEON-SAAS-OPTIMIZATION.md`

## Quick Reference

```bash
# View performance stats
pnpm db:performance

# View with custom settings
pnpm db:performance --limit=20 --min-time=500

# Reset statistics
pnpm db:reset-stats

# Check extension status
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';"
```

## Status

- ✅ Extension installed: `pg_stat_statements` v1.11
- ✅ Tracking active: All queries monitored
- ✅ Scripts ready: `query-performance.ts`, `reset-query-stats.ts`
- ✅ Package.json updated: `pnpm db:performance`, `pnpm db:reset-stats`

**Ready to use!** Run `pnpm db:performance` to start monitoring.
