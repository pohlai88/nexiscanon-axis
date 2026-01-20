# Neon Extension Settings - Quick Reference

## VS Code Settings Location
`.vscode/settings.json`

## Current Configuration

```json
{
  // Neon MCP Configuration
  "neon.projectId": "dark-band-87285012",
  "neon.defaultBranch": "br-icy-darkness-a1eom4rq",
  "neon.databaseName": "neondb",
  "neon.region": "aws-ap-southeast-1"
}
```

## What Each Setting Does

| Setting | Value | Purpose |
|---------|-------|---------|
| `neon.projectId` | `dark-band-87285012` | Your Neon project identifier (from console) |
| `neon.defaultBranch` | `br-icy-darkness-a1eom4rq` | Default database branch (production) |
| `neon.databaseName` | `neondb` | Default database name for queries |
| `neon.region` | `aws-ap-southeast-1` | AWS region (Singapore) |

## How to Update

### 1. Via VS Code UI
1. Open Settings (Ctrl+,)
2. Search for "neon"
3. Update values directly

### 2. Via settings.json
1. Open `.vscode/settings.json`
2. Edit values under Neon MCP Configuration
3. Save file

### 3. Via Command Palette
1. Press Ctrl+Shift+P
2. Type "Preferences: Open Workspace Settings (JSON)"
3. Edit Neon settings

## When to Update

### Change Project ID
- If switching to different Neon project
- If creating new project for different environment

### Change Default Branch
- If you want AI to query test/staging branch by default
- If you've renamed your production branch

### Change Database Name
- If using custom database name (not `neondb`)
- If working with multiple databases in same project

### Change Region
- **Rarely needed** - region is fixed at project creation
- Only if migrating to different Neon project

## Verification

```powershell
# Run verification script
.\scripts\verify-neon-config.ps1

# Or check manually
pnpm neon:info
```

## Related Files

- `.env` - Runtime credentials (NEON_API_KEY, DATABASE_URL)
- `.envExample` - Template with documented variables
- `docs/NEON-MCP-CONFIGURATION.md` - Full documentation

## Common Tasks

### Switch to Test Branch
```json
{
  "neon.defaultBranch": "br-withered-frog-a1rgjj2o"  // test-integration
}
```

### Use Different Database
```json
{
  "neon.databaseName": "postgres"  // or your custom DB name
}
```

### Work with Multiple Projects
```json
{
  "neon.projectId": "your-other-project-id"
}
```

## Pro Tips

1. **Keep settings.json in git** - Team shares same defaults
2. **Use .env for secrets** - API keys never in settings.json
3. **Document changes** - Comment why you changed defaults
4. **Test after changes** - Run verify script to confirm

## Troubleshooting

### Setting Not Taking Effect
1. Reload VS Code window (Ctrl+Shift+P → "Reload Window")
2. Check for typos in setting names
3. Verify JSON syntax is valid

### Wrong Branch/Database
1. Check `neon.defaultBranch` and `neon.databaseName`
2. Run `pnpm neon:info` to see available options
3. Update settings.json with correct values

### API Not Working
1. Settings.json is for **defaults only**
2. API credentials go in `.env` (NEON_API_KEY)
3. Never put API keys in settings.json

## Current Status

✅ **Configured**: All Neon settings properly set
✅ **Verified**: Settings match production project
✅ **Documented**: Full guide available in `docs/`

**Last Updated**: 2026-01-20
**Configuration Status**: Production Ready
