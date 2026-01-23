# @axis/registry - MetadataLite Registry

> Single Source of Truth for all AXIS schema definitions. Zero type drift. Zero debugging hell.

## The Problem

Traditional ERP development suffers from **type mismatch hell**:

```
packages/db/schema/*.ts      → Drizzle table definitions (manual)
packages/db/validation/*.ts  → Zod schemas (manual sync)
apps/web/actions/*.ts        → Action param types (manual sync)
```

Every change requires manual sync across 3+ files → drift → runtime errors → debugging.

## The Solution

**Single Source of Truth + Codegen**:

```
@axis/registry/schemas/*.ts  → Define ONCE
        ↓ codegen
Drizzle schemas (generated)
Zod validation (re-exported)
TypeScript types (inferred)
SQL migrations (generated)
```

## Quick Start

### 1. Import Types (Always Inferred)

```typescript
// Types are ALWAYS inferred from Zod schemas - never manually defined
import type { Document, EconomicEvent, SixW1HContext } from "@axis/registry/types";

// Use the inferred type
const doc: Document = await createDocument(db, { ... });
```

### 2. Import Schemas (For Validation)

```typescript
import { documentRegistrySchema, postingBatchSchema } from "@axis/registry/schemas";

// Validate input
const validated = documentRegistrySchema.parse(input);

// Journal balance validation built-in
const batch = postingBatchSchema.parse({
  batchId: "...",
  postings: [{ direction: "debit", ... }, { direction: "credit", ... }],
}); // Throws if Debits ≠ Credits
```

### 3. Import Constants (Enums)

```typescript
import { DOCUMENT_TYPE, DOCUMENT_STATE, DOCUMENT_STATE_MACHINE } from "@axis/registry/types";

// Type-safe enum usage
const docType: DocumentType = "sales_invoice"; // ✅ Typed
const invalidType = "invalid"; // ❌ Type error

// State machine transitions
const validNextStates = DOCUMENT_STATE_MACHINE["draft"]; // ["submitted", "voided"]
```

### 4. Run Codegen (After Schema Changes)

```bash
pnpm --filter @axis/registry codegen
```

Generates:
- `__generated__/drizzle-schemas.ts` - Drizzle table definitions
- `__generated__/b01-posting-spine.sql` - Raw SQL migration
- `__generated__/types.ts` - Type barrel export

## Architecture

```
@axis/registry/
├── src/
│   ├── schemas/           # 🎯 SINGLE SOURCE OF TRUTH
│   │   ├── constants.ts   # Enums (DOCUMENT_TYPE, etc.)
│   │   ├── common.ts      # 6W1H, MetadataLite, Lineage
│   │   ├── document.ts    # Document schema + Drizzle mapping
│   │   ├── economic-event.ts
│   │   ├── ledger-posting.ts
│   │   └── account.ts
│   ├── types/             # Inferred types (z.infer<>)
│   │   └── index.ts       # Type exports
│   └── codegen/           # Generation tools
│       ├── drizzle-generator.ts
│       ├── sql-generator.ts
│       ├── validator.ts
│       └── generate.ts    # Main entry
└── __generated__/         # Generated artifacts (gitignored)
```

## Key Patterns (From shadcn Registry)

### 1. Self-Describing Schemas

```typescript
export const documentRegistrySchema = metadataFullSchema.extend({
  $schema: z.literal("axis://document/v1").default("axis://document/v1"),
  // ...
});
```

### 2. Discriminated Unions

```typescript
// Different entity types have different required fields
z.discriminatedUnion("entityType", [
  documentSchema,
  economicEventSchema,
  ledgerPostingSchema,
]);
```

### 3. Common + Extension Pattern

```typescript
// Base schema shared by all entities
export const metadataLiteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string().datetime(),
  // ...
});

// Extended for full audit trail
export const metadataFullSchema = metadataLiteSchema.extend({
  context6w1h: sixW1HContextSchema,
  dangerZone: dangerZoneSchema.optional(),
});

// Entity-specific extension
export const documentRegistrySchema = metadataFullSchema.extend({
  documentType: z.enum(DOCUMENT_TYPE),
  state: z.enum(DOCUMENT_STATE),
  // ...
});
```

### 4. Drizzle Mapping (For Codegen)

```typescript
export const documentDrizzleMapping = {
  tableName: "documents",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    tenantId: { type: "uuid", notNull: true, references: "tenants.id" },
    // ...
  },
  indexes: [
    { columns: ["tenantId", "documentNumber"], unique: true },
  ],
  immutable: false, // or true for economic_events, ledger_postings
};
```

## Benefits

| Before (Manual Sync) | After (Registry + Codegen) |
|---------------------|---------------------------|
| 3+ files to update per change | 1 file to update |
| Manual type definitions | Types inferred automatically |
| Runtime type errors | Compile-time type errors |
| Drift between layers | Zero drift guaranteed |
| Hours debugging | Minutes validating |

## Philosophy

Derived from shadcn's registry schema pattern:

1. **Define once, use everywhere** - Single Source of Truth
2. **Infer, don't define** - `z.infer<>` for all types
3. **Self-describing** - `$schema` field for versioning
4. **Codegen over manual sync** - Generate derived artifacts
5. **Validate at boundaries** - Zod validation at API/DB layers

## Related Documents

- [A01-CANONICAL.md](../../.cursor/ERP/A01-CANONICAL.md) - AXIS philosophy
- [B01-DOCUMENTATION.md](../../.cursor/ERP/B01-DOCUMENTATION.md) - Posting Spine spec
- [shadcn registry schema](../design-system/shadcn/src/registry/schema.ts) - Inspiration
