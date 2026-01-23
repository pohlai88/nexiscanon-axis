# Migration Guide: Adopting @axis/registry

This guide explains how to migrate existing code to use the Single Source of Truth pattern.

## Overview

The `@axis/registry` package provides:
- **Zod schemas** as the Single Source of Truth
- **TypeScript types** inferred via `z.infer<>`
- **Drizzle schemas** generated via codegen
- **SQL migrations** generated via codegen

## Migration Phases

### Phase 1: Import Types from Registry (Current)

**Before:**
```typescript
import { 
  type Document, 
  type SixW1HContext 
} from "@axis/db/schema";
```

**After:**
```typescript
import type { 
  Document, 
  SixW1HContext 
} from "@axis/db/types"; // Bridge to registry
```

**Or directly:**
```typescript
import type { 
  Document, 
  SixW1HContext 
} from "@axis/registry/types";
```

### Phase 2: Use Registry Schemas for Validation

**Before (duplicated schemas):**
```typescript
// In @axis/db/validation/posting-spine.ts
export const sixW1HContextSchema = z.object({
  who: z.object({ ... }),
  // ... duplicated definition
});
```

**After (single source):**
```typescript
// In @axis/db/validation/posting-spine.ts
export { sixW1HContextSchema } from "@axis/registry/schemas";
```

### Phase 3: Use Generated Drizzle Schemas (Future)

Once codegen is stable, replace manual Drizzle schemas:

**Before:**
```typescript
// In @axis/db/schema/document.ts (manual)
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ... manual definition
});
```

**After:**
```typescript
// Copy from @axis/registry/__generated__/drizzle-schemas.ts
// Or import directly if published
```

## Current State

### Packages Using Registry

| Package | Status | Notes |
|---------|--------|-------|
| `@axis/registry` | ✅ Source | Single Source of Truth |
| `@axis/db` | 🔄 Partial | Types bridged, schemas still local |
| `@axis/web` | 🔄 Partial | Uses `@axis/db/schema` types |

### What's Working

1. **Type Inference** - All types in registry are `z.infer<>` based
2. **Schema Validation** - Registry schemas work for validation
3. **Codegen** - Drizzle + SQL generation working
4. **Type Bridge** - `@axis/db/types` re-exports from registry

### What's Pending

1. **Schema Deduplication** - `posting-spine.ts` still has local schemas
2. **Drizzle Replacement** - Manual schemas still in `@axis/db/schema/`
3. **CI Integration** - Codegen not yet in build pipeline

## Commands

```bash
# Run codegen
pnpm --filter @axis/registry codegen

# Validate schemas
pnpm --filter @axis/registry validate

# Typecheck all packages
pnpm typecheck
```

## Benefits After Migration

| Metric | Before | After |
|--------|--------|-------|
| Files to update per schema change | 3+ | 1 |
| Type definition method | Manual | Inferred |
| Type drift possible | Yes | No |
| Schema validation | Per-file | Centralized |
| SQL migrations | Manual | Generated |

## Best Practices

1. **Never manually define types** - Always use `z.infer<typeof schema>`
2. **Import from types, not schema** - Use `@axis/db/types` or `@axis/registry/types`
3. **Run codegen after schema changes** - `pnpm --filter @axis/registry codegen`
4. **Check generated files** - Review `__generated__/` before applying
