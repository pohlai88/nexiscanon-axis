# Turbo 2.0 Migration + Best Practices

> **Status:** 🔄 Ready for Implementation  
> **Incorporates:** Official Turborepo best practices + Turbo 2.0 features

---

## 📚 Navigation

- [Main Project README](../../README.md)
- [Migration Patterns](../eslintV9/PATTERNS.md)
- [Deferred Tasks](./DEFERRED.md)
- [Current turbo.json](../../turbo.json)

---

## 🎯 Migration + Optimization Strategy

### **What We're Doing:**

1. ✅ **Upgrade to Turbo 2.0** (v1.9.9 → v2.7.5)
2. ✅ **Apply Best Practices** from official docs
3. ✅ **Optimize Configuration** for performance
4. ✅ **Follow Turborepo Patterns** for monorepos

---

## 📊 Current vs Best Practice Analysis

### **Current Structure** ✅ GOOD

```
NexusCanon-AXIS/
├── packages/
│   ├── design-system/
│   │   ├── shadcn/         # CLI tool
│   │   └── tailwindV4/     # Next.js app (docs)
│   ├── framework-template/  # Templates
│   └── eslintV9/           # Documentation
```

**Analysis:**
- ✅ Logical package organization
- ✅ Follows monorepo conventions
- ✅ Separation of concerns

**No restructuring needed** - structure is already optimal!

---

## 🔧 Step 1: Update Catalog (Turbo 2.0)

### **File:** `pnpm-workspace.yaml`

```yaml
catalog:
  # Build tools
  turbo: ^2.7.5                    # ✅ UPGRADE from ^1.9.9
  'eslint-config-turbo': ^2.7.5    # ✅ UPGRADE from ^1.9.9
```

---

## 🔧 Step 2: Update turbo.json (Best Practices + v2)

### **Current (v1.x):**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    }
  }
}
```

### **Recommended (v2 + Best Practices):**
```json
{
  "$schema": "https://turbo.build/schema.v2.json",
  "ui": "tui",  // ✅ NEW: Better terminal UI
  "globalEnv": ["NODE_ENV"],
  "tasks": {  // ✅ BREAKING: "pipeline" → "tasks"
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        ".next/**",
        "!.next/cache/**",  // ✅ BEST PRACTICE: Exclude cache
        "dist/**",
        "!dist/**/*.map"    // ✅ BEST PRACTICE: Exclude sourcemaps
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true  // ✅ NEW in v2: Long-running tasks
    },
    "lint": {
      "dependsOn": ["^build"],  // ✅ BEST PRACTICE: Lint after build
      "outputs": [],
      "cache": false  // ✅ Linting doesn't need caching
    },
    "lint:fix": {
      "cache": false,
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],  // ✅ BEST PRACTICE: Type check after build
      "outputs": []
    },
    "format:check": {
      "cache": false,
      "outputs": []
    },
    "format:write": {
      "outputs": [],
      "cache": false  // ✅ Formatting shouldn't cache
    },
    "test": {
      "dependsOn": ["^build"],  // ✅ BEST PRACTICE: Test after build
      "outputs": ["coverage/**"],
      "cache": false
    },
    "check": {
      "dependsOn": ["lint", "typecheck", "format:check"],  // ✅ Composite task
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 🎯 Key Best Practices Applied

### **1. Task Dependencies** ✅

**Best Practice:** Run linting/type-checking AFTER building

```json
{
  "lint": {
    "dependsOn": ["^build"]  // ✅ Ensures packages are built first
  },
  "typecheck": {
    "dependsOn": ["^build"]  // ✅ Type checking needs built packages
  }
}
```

**Why:** Internal packages need to be built before dependent packages can lint/type-check against them.

---

### **2. Cache Exclusions** ✅

**Best Practice:** Exclude cache directories and sourcemaps

```json
{
  "outputs": [
    ".next/**",
    "!.next/cache/**",  // ✅ Don't cache the cache
    "dist/**",
    "!dist/**/*.map"    // ✅ Don't cache sourcemaps
  ]
}
```

**Why:** Prevents caching unnecessary files, improves cache performance.

---

### **3. Persistent Tasks** 🆕

**New in Turbo 2.0:** Mark long-running tasks as persistent

```json
{
  "dev": {
    "persistent": true,  // ✅ Dev server runs indefinitely
    "cache": false
  }
}
```

**Benefits:**
- Better process management
- Cleaner shutdown handling
- Improved watch mode behavior

---

### **4. Framework Inference** ✅

**Automatic for Next.js:**
- `NEXT_PUBLIC_*` variables auto-included
- Next.js build outputs detected
- No manual configuration needed

**Already working!** No changes required.

---

### **5. UI Enhancement** 🆕

```json
{
  "ui": "tui"  // ✅ Better terminal interface
}
```

**Benefits:**
- Visual task progress
- Better error display
- Improved developer experience

---

## 📦 Package Configuration Best Practices

### **Internal Package Pattern** ✅ ALREADY FOLLOWED

Current packages follow best practices:

#### **shadcn package** ✅
```json
{
  "name": "@shadcn/shadcn",  // ✅ Scoped package name
  "exports": {
    ".": "./dist/index.js"   // ✅ Proper exports field
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest"
  }
}
```

#### **tailwindV4 package** ✅
```json
{
  "name": "v4",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "^16.1.4"  // ✅ Using catalog
  }
}
```

---

## 🚀 Environment Variables Best Practices

### **Current Setup** ✅ GOOD

```json
{
  "globalEnv": ["NODE_ENV"]  // ✅ Global env vars
}
```

### **For Task-Specific Env Vars:**

If you need task-specific environment variables:

```json
{
  "tasks": {
    "build": {
      "env": [
        "DATABASE_URL",    // Task-specific
        "API_ENDPOINT"     // Task-specific
      ],
      "outputs": [".next/**"]
    }
  }
}
```

**Currently:** Not needed (framework inference handles Next.js vars)

---

## 🔄 Migration Steps (Detailed)

### **Step 1: Update Catalog** 📦

**File:** `pnpm-workspace.yaml`

```yaml
catalog:
  turbo: ^2.7.5
  'eslint-config-turbo': ^2.7.5
```

---

### **Step 2: Update turbo.json** 🔧

**Replace entire file with recommended config above**

**Key Changes:**
1. Schema: `schema.json` → `schema.v2.json`
2. Top-level: Add `"ui": "tui"`
3. Breaking: `"pipeline"` → `"tasks"`
4. Enhancement: Add `"persistent": true` to `dev`
5. Optimization: Add cache exclusions to `outputs`
6. Dependencies: Add `dependsOn` to lint/typecheck/test

---

### **Step 3: Install Dependencies** 💿

```bash
cd C:\AI-BOS\NexusCanon-AXIS
pnpm install
```

---

### **Step 4: Test Tasks** 🧪

```bash
# Build all packages
turbo build

# Start dev servers (with new TUI)
turbo dev --parallel

# Run linting (should wait for build)
turbo lint

# Type checking (should wait for build)
turbo typecheck

# Run tests
turbo test

# Composite check
turbo check
```

---

### **Step 5: Test with Filters** 🎯

```bash
# Work on specific package
turbo dev --filter=shadcn

# Build only changed packages
turbo build --affected

# Build package and dependencies
turbo build --filter=...v4
```

---

## 📊 Performance Benefits

### **Before (Turbo 1.x):**
- Sequential task execution in some cases
- Suboptimal caching (included cache dirs)
- Manual process management for dev tasks

### **After (Turbo 2.0 + Best Practices):**
- ✅ Optimized task dependencies
- ✅ Better cache performance (exclusions)
- ✅ Persistent task management
- ✅ Improved terminal UI
- ✅ Faster builds overall

**Expected Improvement:** 10-20% faster builds

---

## ✅ Verification Checklist

After migration, verify:

### **Basic Functionality:**
- [ ] `pnpm install` completes successfully
- [ ] `turbo build` works
- [ ] `turbo dev` starts with TUI
- [ ] `turbo lint` runs after build
- [ ] `turbo typecheck` works
- [ ] `turbo test` runs

### **Performance:**
- [ ] Build completes in reasonable time
- [ ] Cache is working (`FULL TURBO` message)
- [ ] Dev servers start quickly
- [ ] No regression in build times

### **Best Practices Applied:**
- [ ] Using Turbo 2.0 (`^2.7.5`)
- [ ] `tasks` instead of `pipeline`
- [ ] `persistent: true` for dev tasks
- [ ] Cache exclusions in outputs
- [ ] Task dependencies configured
- [ ] TUI enabled

---

## 🚨 Breaking Changes Summary

| Change | v1.x | v2.0 | Migration |
|--------|------|------|-----------|
| **Config Key** | `pipeline` | `tasks` | Find & replace |
| **Schema** | `schema.json` | `schema.v2.json` | Update URL |
| **Dev Tasks** | Basic | `persistent: true` | Add property |
| **CLI** | Same | Same | No change needed |

---

## 📚 References

### **Official Documentation:**
- [Turbo 2.0 Release](https://turbo.build/blog/turbo-2-0)
- [Turbo Schema v2](https://turbo.build/repo/docs/reference/schema)
- [Best Practices Guide](https://turbo.build/repo/docs/crafting-your-repository)
- [Task Dependencies](https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks)

### **Best Practices Applied:**
- ✅ Proper task dependencies
- ✅ Cache optimizations
- ✅ Environment variable handling
- ✅ Framework inference usage
- ✅ Persistent task configuration

---

## 🎯 Success Criteria

Migration is successful when:

- [ ] All tasks run without errors
- [ ] Build times are same or better
- [ ] Cache is functioning optimally
- [ ] TUI displays correctly
- [ ] No technical debt introduced
- [ ] Documentation updated
- [ ] Team can use new features

---

**Last Updated:** 2026-01-21  
**Status:** 🔄 Ready for implementation  
**Next Step:** Update catalog, then turbo.json
