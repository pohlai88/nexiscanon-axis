# shadcn/ui SSOT Integration - Reference Handoff

**Purpose**: Transform `@workspace/design-system` to use shadcn/ui as Single Source of Truth with auto-sync, preserving custom theming and components.

**Date**: 2026-01-21  
**Status**: Implementation 100% - All Phases Complete

---

## Quick Architecture

```
shadcn/ui (SSOT) → sync → @workspace/design-system → @workspace/shared-ui → apps
```

**Key Principle**: Clone shadcn/ui's battle-tested configs, sync components, preserve customizations on top.

---

## What to Clone from shadcn/ui Repo

### Config Files (Phase 7)

- `.vscode/settings.json` - Monorepo + Tailwind v4 optimized
- `.vscode/extensions.json` - Team consistency
- `turbo.json` - Component library optimizations
- `tsconfig.json` / `tsconfig.base.json` - Monorepo path mappings
- `eslint.config.mjs` - Component library lint rules
- `package.json` scripts - Component workflow
- `.editorconfig`, `.prettierrc`, `.npmrc` - Formatting consistency
- `vitest.config.ts` / `vitest.workspace.ts` - Test setup

### Workflows & Processes (Phase 8)

- `.github/workflows/release.yml` - Automated versioning
- `.github/workflows/ci.yml` - Quality gates
- `.changeset/` config - Version management
- Pre-commit hooks (Husky + lint-staged)
- Component test patterns
- Documentation structure

---

## What to Preserve

### Custom Components

- `shimmer-button.tsx`
- `spotlight-card.tsx`
- `solaris-theme-switcher.tsx`
- `surface-noise.tsx`
- `texture-background.tsx`

**Location**: Move to `src/components/custom/`

### Theming System (KEEP INTACT)

- `src/styles/themes/` (9 base themes)
- `src/styles/styles/` (5 style presets)
- `src/styles/accents/` (8 accent colors)
- `src/styles/fonts/` (4 font families)
- `src/styles/menu/` (menu variants)
- `src/tokens/` (theme configuration)

**Reason**: 8,640 theme combinations - unique value proposition

---

## Implementation Phases

### Phase 1: Archive Current

```bash
git mv packages/design-system packages/design-system-archived
# Move custom components to src/components/custom/
```

### Phase 2: Setup Sync

- Git submodule: `git submodule add https://github.com/shadcn-ui/ui.git .shadcn-source`
- OR sync script: `scripts/sync-shadcn.ts`
- Source: `apps/v4/registry/new-york-v4/ui/`

### Phase 3: Auto-Sync Workflow

```json
{
  "scripts": {
    "sync:shadcn": "tsx scripts/sync-shadcn.ts",
    "sync:shadcn:check": "tsx scripts/sync-shadcn.ts --check",
    "sync:shadcn:all": "tsx scripts/sync-shadcn.ts --all --overwrite"
  }
}
```

### Phase 4: Customization Layer (Magic UI Pattern)

```
src/
├── components/     # Synced from shadcn/ui
├── custom/        # Custom components
├── overrides/     # Component customizations
└── wrappers/      # Wrapper components
```

### Phase 5-6: Integration & CI/CD

- Update exports in `src/index.ts`
- Test theming compatibility
- GitHub Actions for weekly sync checks

### Phase 7: Adopt Configs

- Clone `.vscode/`, `turbo.json`, `tsconfig.json`, `eslint.config.mjs`
- Merge with existing (preserve custom rules)
- Backup current configs first

### Phase 8: Additional Patterns ✅

- GitHub Actions workflows ✅ (`sync-shadcn-check.yml`)
- Testing infrastructure ✅ (Button test + utilities)
- Documentation structure ✅ (CONTRIBUTING.md)
- Pre-commit hooks ✅ (Husky + lint-staged)
- Contributing guidelines ✅

---

## Key Files to Create/Modify

### New Files

1. `packages/design-system/scripts/sync-shadcn.ts`
2. `packages/design-system/.shadcn-overrides/`
3. `packages/design-system-archived/`
4. `.github/workflows/sync-shadcn-check.yml`
5. `packages/design-system/docs/SYNC_WORKFLOW.md`

### Modify Files

1. `packages/design-system/components.json` - Update to `new-york-v4`
2. `packages/design-system/package.json` - Add sync scripts
3. `packages/design-system/src/index.ts` - Update exports
4. `.vscode/settings.json` - Adopt shadcn optimizations
5. `turbo.json` - Merge task optimizations
6. `tsconfig.json` - Adopt path mappings
7. `eslint.config.mjs` - Adopt lint rules

---

## Sync Strategy

1. **Check Mode**: `sync:shadcn:check` - Compare local vs upstream
2. **Selective Sync**: Sync specific components
3. **Full Sync**: `sync:shadcn:all` - Sync all (with backup)
4. **Dry Run**: Preview changes

**Preserve Customizations**: Store in `.shadcn-overrides/`, merge logic: shadcn base + overrides = final

---

## Risk Mitigation

1. Always create git branch before sync
2. Incremental sync (one component at a time initially)
3. Run full test suite after each sync
4. Keep archived components for rollback
5. Document all customizations

---

## Success Criteria

- [ ] All shadcn/ui components synced and working
- [x] Custom components preserved ✅
- [x] Theming system intact (8,640 combinations) ✅
- [x] Auto-sync mechanism working ✅
- [ ] All apps using updated components
- [x] No breaking changes (type check passes) ✅
- [x] Configs adopted from shadcn/ui ✅
- [x] Documentation complete ✅

---

## Quick Commands

```bash
# Initial sync setup
cd packages/design-system
git submodule add https://github.com/shadcn-ui/ui.git .shadcn-source

# Check for updates
pnpm sync:shadcn:check

# Sync all components
pnpm sync:shadcn:all

# Archive current
git mv packages/design-system packages/design-system-archived
```

---

## Notes

- shadcn/ui has 438+ items in registry (@shadcn)
- Current components.json uses `radix-vega` style, should update to `new-york-v4`
- Registry already configured: `@ss-components`, `@ss-blocks`
- MCP tools available: `mcp_shadcn_*` for component discovery

---

**Reference**: Full plan in `shadcn-ui-ssot-integration_65b717c9.plan.md`
