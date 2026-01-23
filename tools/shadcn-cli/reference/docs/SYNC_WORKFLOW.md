# shadcn/ui Sync Workflow

This document describes how to sync components from shadcn/ui registry to `@workspace/design-system`.

## Quick Start

```bash
# Sync a specific component (auto-applies overrides)
pnpm sync:shadcn button

# Dry run (preview changes)
pnpm sync:shadcn button --dry-run

# Check sync status
pnpm sync:shadcn:status

# Sync all components
pnpm sync:shadcn:all
```

## Verified Working (2026-01-21)

- ✅ Registry API: `https://ui.shadcn.com/r/styles/new-york-v4/{name}.json`
- ✅ Path transformation: `registry/new-york-v4/ui/*.tsx` → `src/components/*.tsx`
- ✅ Import transformation: `@/lib/utils` → `../lib/utils`
- ✅ Custom component protection: `src/components/custom/` never overwritten

## Architecture

```
shadcn/ui Registry
       ↓
  sync script
       ↓
  1. Fetch component JSON
  2. Transform imports (@/lib/utils → ../lib/utils)
  3. Add sync metadata header (@shadcn-sync)
  4. Apply overrides from .shadcn-overrides/{name}.ts
       ↓
  @workspace/design-system/src/components/
       ├── custom/      (never touched by sync)
       └── *.tsx        (synced + auto-patched)
```

## Sync Strategy

### 1. Check Mode

```bash
pnpm sync:shadcn:check
```

Compares local components with upstream registry and reports differences.

### 2. Selective Sync

```bash
pnpm sync:shadcn <component-name>
```

Syncs a specific component from shadcn/ui registry.

### 3. Full Sync

```bash
pnpm sync:shadcn:all
```

Syncs all components from the registry. Use `--overwrite` to force update existing components.

## Customization Preservation

### Custom Components

Components in `src/components/custom/` are **never** overwritten by sync:

- `shimmer-button.tsx`
- `spotlight-card.tsx`
- `solaris-theme-switcher.tsx`
- `surface-noise.tsx`
- `texture-background.tsx`

### Automated Overrides (Recommended)

Local patches are automatically applied after every sync:

1. Create `.shadcn-overrides/{component}.ts`:

   ```ts
   import type { ComponentOverride } from './types';

   const override: ComponentOverride = {
     component: 'button',
     patches: [
       {
         id: 'my-patch',
         description: 'What it does',
         reason: 'Why needed',
         find: `exact string to find`,
         replace: `replacement string`,
       },
     ],
   };
   export default override;
   ```

2. Sync: `pnpm sync:shadcn button`
3. Patches are applied automatically

### Wrapper Components

Create wrapper components in `src/components/wrappers/` to extend shadcn components without modifying originals.

## Configuration

Sync uses `components.json` configuration:

- `style`: `new-york-v4` (shadcn/ui style variant)
- `registries`: Registry URLs for component fetching
- `aliases`: Import path mappings

## Best Practices

1. **Always create a git branch before syncing**

   ```bash
   git checkout -b sync/shadcn-update-YYYY-MM-DD
   ```

2. **Test after sync**

   ```bash
   pnpm check-types
   pnpm lint
   ```

3. **Document customizations**
   - Update `.shadcn-overrides/` when modifying synced components
   - Note breaking changes in CHANGELOG

4. **Incremental sync**
   - Start with one component
   - Verify theming compatibility
   - Then sync remaining components

## Troubleshooting

### Component not found

- Verify component name matches registry
- Check `components.json` registry configuration

### Import errors after sync

- Verify `src/index.ts` exports are updated
- Check component file paths match exports

### Theming issues

- Verify CSS variables compatibility
- Check `src/styles/globals.css` includes required tokens

## Registry Source

Components are synced from:

- **Style**: `new-york-v4`
- **Registry**: `@shadcn` (configured in `components.json`)
- **API**: `https://ui.shadcn.com/r/styles/new-york-v4/{name}.json`

## Known Overrides

Components with automated patches (in `.shadcn-overrides/*.ts`):

| Component | Patch ID              | Description                          |
| --------- | --------------------- | ------------------------------------ |
| `button`  | `icon-xs-size`        | Adds `icon-xs` size variant (size-6) |
| `button`  | `button-props-export` | Exports `ButtonProps` type           |

## Related Files

- `scripts/sync-shadcn.ts` - Sync script implementation
- `components.json` - shadcn/ui configuration
- `.shadcn-overrides/` - Automated override patches
  - `types.ts` - Patch type definitions
  - `README.md` - Override documentation
  - `{component}.ts` - Component-specific patches
- `src/index.ts` - Component exports
