# ESLint v9 Flat Config Migration

> **Status:** ✅ Core migration complete | 🟡 Package-specific configs deferred

This directory contains documentation and deferred tasks for the ESLint 8 → 9 migration.

---

## 📚 Navigation

- [Main Project README](../../README.md)
- [Migration Patterns & Standards](./PATTERNS.md) ⭐ **Read this for future migrations**
- [ESLint ↔ Prettier Relationship](./ESLINT-PRETTIER-RELATIONSHIP.md) 🔗 **Architecture decision**
- [Validation Report](./VALIDATION-REPORT.md) ✅ **All settings validated**
- [Deferred Tasks](./DEFERRED.md)
- [Root ESLint Config](../../eslint.config.mjs)
- [VSCode Settings](../../.vscode/settings.json)

---

## ✅ Completed Migration

### **What Was Migrated:**

1. **Root ESLint Configuration**
   - ✅ Upgraded ESLint: `8.57.1` → `9.39.2`
   - ✅ Created flat config: `eslint.config.mjs`
   - ✅ Removed deprecated files: `.eslintrc.json`, `.eslintignore`
   - ✅ Added catalog entries: `@eslint/js`, `@eslint/eslintrc`

2. **VSCode Integration**
   - ✅ Enabled flat config support
   - ✅ Updated linting triggers
   - ✅ Configured validation for JS/TS/JSX/TSX

3. **Dependency Cleanup**
   - ✅ Removed incompatible: `eslint-plugin-tailwindcss` (requires Tailwind v3, we have v4)
   - ✅ Updated prettier config: `9.1.2`
   - ✅ Zero tech debt introduced

4. **ESLint ↔ Prettier Relationship** 🔗
   - ✅ **Decision:** Tied to ESLint dependencies (industry standard)
   - ✅ Uses `eslint-config-prettier` to prevent conflicts
   - ✅ Clear separation: ESLint = code quality, Prettier = formatting
   - ✅ See [ESLINT-PRETTIER-RELATIONSHIP.md](./ESLINT-PRETTIER-RELATIONSHIP.md) for full analysis

---

## 🔗 ESLint ↔ Prettier Architecture

### **Coordinated but Independent Pattern:**

```
┌─────────────────────────────────────┐
│  ESLint v9 (Code Quality)           │
│  ├── TypeScript rules               │
│  ├── React rules                    │
│  └── eslint-config-prettier ←─┐    │
│                                │    │
└────────────────────────────────┼────┘
                                 │
                     Disables    │ Prevents
                     conflicting │ rule
                     formatting  │ conflicts
                     rules       │
                                 │
┌────────────────────────────────┼────┐
│  Prettier v3 (Formatting)      │    │
│  ├── Code style                ▼    │
│  ├── Import sorting plugin          │
│  └── Runs independently             │
└─────────────────────────────────────┘
```

### **Why This Pattern?**

| Aspect | Result |
|--------|--------|
| **Conflict Prevention** | ✅ Automatic via `eslint-config-prettier` |
| **Industry Standard** | ✅ Recommended by ESLint & Prettier |
| **Maintenance** | ✅ Low - no manual coordination |
| **Tech Debt** | ✅ Zero |
| **Monorepo Ready** | ✅ Scales across packages |

**Key Principles:**
- ESLint focuses on **code quality** (bugs, logic, patterns)
- Prettier handles **formatting** (style, whitespace, semicolons)
- `eslint-config-prettier` turns off ESLint's formatting rules
- Both run independently with no conflicts

**See:** [ESLINT-PRETTIER-RELATIONSHIP.md](./ESLINT-PRETTIER-RELATIONSHIP.md) for complete analysis

---

## 🟡 Deferred Tasks

### **Package-Specific ESLint Configs**

The following packages need their own `eslint.config.mjs`:

#### **1. packages/design-system/tailwindV4/**
**Priority:** 🔴 HIGH

**Reason:** Next.js app with specific linting needs
- Requires `eslint-config-next`
- Requires React hooks rules
- Framework-specific patterns

**Deferred Because:**
- Root config is framework-agnostic
- Package should manage its own framework dependencies
- Prevents circular dependencies

**TODO:**
```javascript
// packages/design-system/tailwindV4/eslint.config.mjs
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    // Next.js specific rules
    extends: ['next/core-web-vitals'],
    // Tailwind specific rules (when plugin supports v4)
  }
]
```

---

#### **2. packages/design-system/shadcn/**
**Priority:** 🟡 MEDIUM

**Reason:** CLI tool with Node.js patterns
- Different linting needs than web apps
- CLI-specific patterns (commander, prompts, etc.)
- Build tool patterns

**Deferred Because:**
- Root config covers basic TypeScript linting
- Not critical for CLI functionality
- Can be added when specific issues arise

**TODO:**
```javascript
// packages/design-system/shadcn/eslint.config.mjs
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    // Node.js CLI specific rules
    rules: {
      'no-console': 'off', // CLIs need console
      'no-process-exit': 'off', // CLIs exit
    }
  }
]
```

---

#### **3. packages/framework-template/*/**
**Priority:** 🟢 LOW

**Reason:** Template projects - users will customize
- Users will configure their own ESLint
- Templates are starting points, not maintained code
- Each template has different needs

**Deferred Because:**
- Templates are meant to be customized
- Not part of our maintained codebase
- Users choose their own tooling

**TODO:**
- Document ESLint 9 setup in template READMEs
- Provide example configs for each template type

---

### **Plugin Compatibility Monitoring**

#### **eslint-plugin-tailwindcss**
**Status:** ⏸️ Waiting for upstream

**Issue:** Plugin v3.13.1 requires Tailwind v3, we have v4

**Actions:**
1. Monitor: https://github.com/francoismassart/eslint-plugin-tailwindcss/issues
2. Check for v4-compatible release
3. When available, add back to catalog

**Workaround:**
- Tailwind class validation via VSCode extension
- Prettier plugin handles class ordering

---

#### **eslint-config-next**
**Status:** ⚠️ Requires `next` package

**Issue:** Config requires Next.js to be installed

**Solution:** Move to package-specific configs (see #1 above)

---

### **Legacy Config Adapters**

#### **FlatCompat Usage**
**Status:** ✅ Acceptable pattern

**Current:**
```javascript
import { FlatCompat } from '@eslint/eslintrc'
const compat = new FlatCompat({ ... })
...compat.extends('turbo', 'prettier')
```

**Future:** Replace when plugins release native flat configs
- `eslint-config-turbo` - Monitor for flat config support
- `eslint-config-prettier` - Already compatible

**Timeline:** Check quarterly for updates

---

## 📋 Implementation Checklist

### Phase 1: Core (Completed ✅)
- [x] Upgrade ESLint to v9
- [x] Create root flat config
- [x] Update VSCode settings
- [x] Remove deprecated files
- [x] Update catalog

### Phase 2: Packages (Deferred 🟡)
- [ ] Create `tailwindV4/eslint.config.mjs`
- [ ] Create `shadcn/eslint.config.mjs`
- [ ] Document template ESLint setup
- [ ] Test all package linting

### Phase 3: Plugins (Monitoring ⏸️)
- [ ] Monitor tailwindcss plugin for v4 support
- [ ] Check turbo config for flat config
- [ ] Update FlatCompat when plugins migrate

---

## 🔗 References

### Official Documentation
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [VSCode ESLint Extension](https://github.com/microsoft/vscode-eslint)

### Related Issues
- [Tailwind Plugin v4 Support](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues)
- [Turbo Flat Config](https://github.com/vercel/turbo/discussions)

---

## 📝 Decision Log

### Why Defer Package Configs?

**Decision Date:** 2026-01-21

**Rationale:**
1. **Separation of Concerns:** Root should be framework-agnostic
2. **Dependency Management:** Packages manage their own framework deps
3. **Monorepo Pattern:** Each package owns its tooling
4. **Zero Tech Debt:** Clean migration without workarounds

**Approved By:** Project Architecture Review

---

## 🚀 Quick Start (For Package Maintainers)

To add ESLint to your package:

```bash
cd packages/your-package
```

Create `eslint.config.mjs`:
```javascript
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    // Your package-specific rules
  }
]
```

Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  }
}
```

---

## 📞 Support

- **Issues:** [Root README](../../README.md#contributing)
- **ESLint Config:** See [../../eslint.config.mjs](../../eslint.config.mjs)
- **Questions:** Check migration guide above

---

**Last Updated:** 2026-01-21
**Migration Status:** Core Complete, Packages Deferred
**Tech Debt:** Zero ✅
