# Neon MCP Configuration Guide

## Overview
This workspace uses the **Neon MCP (Model Context Protocol)** integration to interact with your Neon PostgreSQL database directly from the AI assistant.

## Current Configuration

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "neon.projectId": "dark-band-87285012",
  "neon.defaultBranch": "br-icy-darkness-a1eom4rq",
  "neon.databaseName": "neondb",
  "neon.region": "aws-ap-southeast-1"
}
```

### Environment Variables (`.envExample`)
```bash
NEON_PROJECT_ID=dark-band-87285012
NEON_API_KEY=napi_pbu7zv32cluaofcpfh24o3r9buq4q104qg7vxtjj6l1tfrcqpmb1xq6558s9exwc
DATABASE_URL=postgresql://neondb_owner:...@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb
```

## Available MCP Tools

### 1. Database Operations
- `mcp_Neon_run_sql` - Execute single SQL statement
- `mcp_Neon_run_sql_transaction` - Execute multiple SQL statements in transaction
- `mcp_Neon_explain_sql_statement` - Analyze query execution plan
- `mcp_Neon_describe_table_schema` - Get table structure
- `mcp_Neon_get_database_tables` - List all tables

### 2. Schema Management
- `mcp_Neon_prepare_database_migration` - Create migration in temp branch
- `mcp_Neon_complete_database_migration` - Apply migration to main branch
- `mcp_Neon_compare_database_schema` - Diff schemas between branches

### 3. Query Optimization
- `mcp_Neon_list_slow_queries` - Find performance bottlenecks
- `mcp_Neon_prepare_query_tuning` - Analyze & suggest optimizations
- `mcp_Neon_complete_query_tuning` - Apply performance improvements

### 4. Branch Management
- `mcp_Neon_create_branch` - Create new database branch
- `mcp_Neon_describe_branch` - View branch details
- `mcp_Neon_delete_branch` - Remove branch
- `mcp_Neon_reset_from_parent` - Reset branch to parent state

### 5. Project Management
- `mcp_Neon_list_projects` - List all Neon projects
- `mcp_Neon_describe_project` - Get project details
- `mcp_Neon_get_connection_string` - Get database connection string
- `mcp_Neon_list_branch_computes` - List compute endpoints

### 6. Authentication & API
- `mcp_Neon_provision_neon_auth` - Set up Neon Auth
- `mcp_Neon_provision_neon_data_api` - Set up Data API (PostgREST)

### 7. Search & Discovery
- `mcp_Neon_search` - Search across projects/branches
- `mcp_Neon_fetch` - Get detailed resource info

## Usage Examples

### Query Database
```typescript
// Ask AI: "Show me all users in the database"
// AI uses: mcp_Neon_run_sql
// Result: SELECT * FROM users;
```

### Create Migration
```typescript
// Ask AI: "Add email_verified column to users table"
// AI uses: mcp_Neon_prepare_database_migration
// Result: Creates temp branch, tests migration, waits for approval
```

### Optimize Query
```typescript
// Ask AI: "Why is this query slow: SELECT * FROM requests WHERE status = 'pending'"
// AI uses: mcp_Neon_prepare_query_tuning
// Result: Suggests indexes, analyzes execution plan
```

### Branch Management
```typescript
// Ask AI: "Create a test branch for this feature"
// AI uses: mcp_Neon_create_branch
// Result: New branch with copy of production data
```

## Configuration Files

### 1. Workspace Settings (`.vscode/settings.json`)
- Project ID, default branch, database name
- File associations for SQL/MDC files
- SQL formatting preferences

### 2. Environment Variables (`.env`)
- API credentials (NEON_API_KEY)
- Connection strings (DATABASE_URL)
- Project identifiers

### 3. Package Scripts (`package.json`)
```json
{
  "neon:optimize": "tsx scripts/optimize-neon-config.ts",
  "neon:info": "tsx scripts/neon-info.ts"
}
```

## Integration Points

### AI Assistant Integration
The Neon MCP is automatically available when you:
1. Use Cursor/VS Code with Neon extension
2. Have NEON_API_KEY in environment
3. Reference database operations in chat

### GitHub Actions
```yaml
# .github/workflows/neon-preview.yml
env:
  NEON_PROJECT_ID: dark-band-87285012
  NEON_API_KEY: ${{ secrets.NEON_API_KEY }}
```

### Application Code
```typescript
// packages/db/src/client.ts
// Auto-connects using DATABASE_URL
// Auto-enables connection pooling
```

## Security Best Practices

### ✅ DO
- Store NEON_API_KEY in environment variables
- Use GitHub Secrets for CI/CD
- Rotate API keys every 90 days
- Use project-scoped keys (not account-wide)

### ❌ DON'T
- Commit API keys to git
- Share keys in plain text
- Use root/admin keys for applications
- Store keys in code or config files

## Troubleshooting

### Issue: MCP Tools Not Available
**Solution:**
```bash
# Check if NEON_API_KEY is set
echo $env:NEON_API_KEY  # PowerShell
echo $NEON_API_KEY      # Bash

# Verify in .env file
cat .env | grep NEON_API_KEY
```

### Issue: "Project Not Found"
**Solution:**
```bash
# Verify project ID in settings
# .vscode/settings.json should have:
# "neon.projectId": "dark-band-87285012"
```

### Issue: "Authentication Failed"
**Solution:**
```bash
# Regenerate API key at:
# https://console.neon.tech/app/settings/api-keys

# Update .env and GitHub Secrets
```

### Issue: "Branch Not Found"
**Solution:**
```bash
# List available branches
pnpm neon:info

# Update default branch in .vscode/settings.json
```

## Current Setup Status

### ✅ Configured
- Project ID: `dark-band-87285012`
- Default branch: `br-icy-darkness-a1eom4rq` (production)
- Database: `neondb`
- Region: `aws-ap-southeast-1`
- API Key: Set in `.envExample`
- Connection pooling: Enabled

### ⏳ Optional Enhancements
- Data API: Not provisioned (can be added)
- GitHub Actions: Ready (needs NEON_API_KEY secret)
- Branch-per-PR: Configured (needs activation)

## Quick Reference

### Check Configuration
```powershell
# Run verification script
.\scripts\verify-neon-config.ps1

# Check project info
pnpm neon:info
```

### Update Settings
1. Edit `.vscode/settings.json` for workspace defaults
2. Edit `.env` for runtime credentials
3. Update GitHub Secrets for CI/CD

### Get Help
```bash
# AI Assistant: "How do I use Neon MCP?"
# AI Assistant: "Show me available Neon tools"
# AI Assistant: "Query my database"
```

## Resources

- **Neon Console**: https://console.neon.tech/app/projects/dark-band-87285012
- **API Documentation**: https://api-docs.neon.tech
- **MCP Protocol**: https://modelcontextprotocol.io
- **Workspace Docs**: `docs/NEON-SAAS-OPTIMIZATION.md`

## Version Info

- **Neon Project**: nexuscanon-axis
- **PostgreSQL**: 17
- **Plan**: Free/Launch (scale-to-zero restricted)
- **Last Updated**: 2026-01-20
- **Configuration Status**: ✅ Production Ready
