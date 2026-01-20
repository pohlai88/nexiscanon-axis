# Drizzle RLS vs SQL RLS - Quick Comparison

## 📊 Side-by-Side Comparison

### Adding a New Table

#### SQL Approach (Current)

**Files to modify:** 3

```typescript
// 1. packages/db/src/schema.ts
export const newTable = pgTable("new_table", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
});
```

```bash
# 2. Generate migration
pnpm db:generate
```

```bash
# 3. Manually run enable-rls script
pnpm rls:enable
```

**Risk:** ⚠️ Easy to forget step 3!

#### Drizzle Approach (Target)

**Files to modify:** 1

```typescript
// packages/db/src/schema.ts
export const newTable = pgTable("new_table", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
}, (table) => ({
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: sql`(tenant_id = auth.user_tenant_id())`,
  }),
}));
```

```bash
# Generate migration (includes RLS!)
pnpm db:generate
```

**Risk:** ✅ None! Can't forget RLS (it's in the schema).

---

## 📈 Comparison Matrix

| Feature | SQL Approach | Drizzle Approach |
|---------|--------------|------------------|
| **Files to edit** | 3 (schema + scripts) | 1 (schema only) |
| **Manual steps** | 3 (generate + migrate + rls) | 1 (generate) |
| **Type safety** | ❌ No | ✅ Yes |
| **Co-located** | ❌ Separate files | ✅ Single file |
| **Review ease** | ⚠️ Hard (SQL scattered) | ✅ Easy (all in schema) |
| **Forgot RLS risk** | ⚠️ High | ✅ None |
| **Maintenance** | ⚠️ Hard | ✅ Easy |
| **Runtime** | ✅ Same | ✅ Same |
| **Performance** | ✅ Same | ✅ Same |

---

## 🎯 Real-World Example

### Scenario: Add `comments` table

#### SQL Approach

```typescript
// Step 1: schema.ts
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  content: text("content").notNull(),
});

// Step 2: Generate
// $ pnpm db:generate

// Step 3: Apply migration
// $ pnpm db:migrate

// Step 4: Enable RLS (EASY TO FORGET!)
// $ pnpm rls:enable

// Step 5: Create auth functions (if not exists)
// $ pnpm rls:create-functions

// Step 6: Manually test RLS
// $ pnpm rls:check
```

**Total steps:** 6  
**Total commands:** 4  
**Files touched:** 2 (schema + migration)  
**Time:** ~10 minutes

#### Drizzle Approach

```typescript
// Step 1: schema.ts
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  content: text("content").notNull(),
}, (table) => ({
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: sql`(tenant_id = auth.user_tenant_id())`,
  }),
}));

// Step 2: Generate & apply
// $ pnpm db:generate
// $ pnpm db:migrate

// RLS automatically included in migration!
```

**Total steps:** 2  
**Total commands:** 2  
**Files touched:** 1 (schema only)  
**Time:** ~2 minutes

---

## 🚨 Security Comparison

### SQL Approach (Risky)

```
Developer adds table:
├─ schema.ts ✅
├─ db:generate ✅
├─ db:migrate ✅
└─ rls:enable ❌ FORGOT!

Result: 🚨 TABLE HAS NO RLS! 
Data leak possible!
```

### Drizzle Approach (Safe)

```
Developer adds table:
├─ schema.ts with crudPolicy ✅
├─ db:generate (includes RLS) ✅
└─ db:migrate ✅

Result: ✅ RLS ALWAYS APPLIED!
Can't forget (part of schema).
```

---

## 💡 Key Insights

### Current Pain Points

1. **Scattered Logic**
   - RLS policies in `scripts/enable-rls.ts`
   - Auth functions in `scripts/create-auth-functions.ts`
   - Schema in `packages/db/src/schema.ts`
   - Hard to see full picture

2. **Manual Steps**
   - Easy to forget `pnpm rls:enable`
   - No enforcement mechanism
   - Relies on developer discipline

3. **Review Difficulty**
   - RLS changes in separate PR commits
   - Can't review schema + RLS together
   - SQL scripts hard to understand

### Drizzle Benefits

1. **Single Source of Truth**
   ```typescript
   // Everything in one place!
   export const table = pgTable("table", {
     // Columns
   }, (table) => ({
     // Indexes
     // RLS Policies ← Right here!
   }));
   ```

2. **Automatic**
   - RLS policies auto-generated in migrations
   - Can't forget (compile error if missing)
   - Enforced by TypeScript

3. **Reviewable**
   - Schema + RLS in same file
   - Easy to review in PRs
   - TypeScript is readable

---

## 🔄 Migration Summary

### What Changes

- ✅ RLS policies move to schema (from scripts)
- ✅ Drizzle generates policies in migrations
- ✅ No more `rls:enable` script

### What Stays the Same

- ✅ Same SQL policies (runtime identical)
- ✅ Same security guarantees
- ✅ Same performance
- ✅ Same auth functions (`auth.user_tenant_id()`)

### What Gets Better

- ✅ Easier to maintain
- ✅ Harder to forget RLS
- ✅ Easier to review
- ✅ Type-safe
- ✅ Co-located with schema

---

## 📋 Decision Matrix

### When to Migrate

✅ **Yes, migrate if:**
- You're adding new tables frequently
- You want better maintainability
- You want to prevent RLS gaps
- You prefer TypeScript over SQL scripts

❌ **No, don't migrate if:**
- Schema is stable (no new tables)
- You're comfortable with SQL scripts
- Migration effort not worth it (< 5 tables)

### For NexusCanon-AXIS

**Recommendation:** ✅ **Migrate**

**Reasons:**
- 7 multi-tenant tables (significant)
- Active development (new tables coming)
- Team prefers TypeScript
- Want to prevent RLS gaps
- Better code review experience

**Effort:** 1-2 hours  
**Benefit:** Long-term maintainability

---

## 🎯 Next Steps

1. Review example: `docs/examples/schema-with-drizzle-rls.ts`
2. Read guide: `docs/DRIZZLE-RLS-MIGRATION-GUIDE.md`
3. Decide: Migrate now or later?
4. If migrating: Follow step-by-step guide

**Question?** Ask! 🙋‍♂️
