# Deferred Tasks - ESLint v9 Migration

> Quick reference for tasks deferred to future iterations

## 🔴 HIGH PRIORITY

### Task 1: tailwindV4 ESLint Config
**Package:** `packages/design-system/tailwindV4`  
**Blocked By:** Next.js dependency at root  
**Estimated Effort:** 30 minutes

**Steps:**
1. Create `eslint.config.mjs` in tailwindV4
2. Extend root config
3. Add `eslint-config-next` integration
4. Test with `pnpm lint`

**File Location:**
```
packages/design-system/tailwindV4/eslint.config.mjs
```

**Code Template:**
```javascript
import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: ['next/core-web-vitals'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]
```

---

## 🟡 MEDIUM PRIORITY

### Task 2: shadcn ESLint Config
**Package:** `packages/design-system/shadcn`  
**Reason:** CLI-specific linting patterns  
**Estimated Effort:** 20 minutes

**Steps:**
1. Create `eslint.config.mjs` in shadcn
2. Add Node.js/CLI specific rules
3. Allow console.log and process.exit
4. Test with `pnpm lint`

**File Location:**
```
packages/design-system/shadcn/eslint.config.mjs
```

**Code Template:**
```javascript
import baseConfig from '../../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-console': 'off', // CLIs need console
      'no-process-exit': 'off', // CLIs exit processes
    },
  },
]
```

---

## 🟢 LOW PRIORITY

### Task 3: Template Documentation
**Packages:** `packages/framework-template/*`  
**Reason:** User customization  
**Estimated Effort:** 1 hour

**Action Items:**
- [ ] Update `monorepo-next/README.md` with ESLint 9 setup
- [ ] Update `start-app/README.md` with ESLint 9 setup
- [ ] Update `vite-app/README.md` with ESLint 9 setup
- [ ] Provide example flat configs for each

---

## ⏸️ WAITING FOR UPSTREAM

### Task 4: Tailwind ESLint Plugin
**Plugin:** `eslint-plugin-tailwindcss`  
**Issue:** Requires Tailwind v3, we have v4  
**GitHub:** https://github.com/francoismassart/eslint-plugin-tailwindcss

**Monitor For:**
- v4-compatible release
- Flat config support
- Alternative plugins

**When Available:**
1. Add to catalog
2. Update root config
3. Test with Tailwind 4 projects

---

### Task 5: Turbo Flat Config
**Config:** `eslint-config-turbo`  
**Status:** Using FlatCompat  
**Issue:** https://github.com/vercel/turbo/discussions

**Current Workaround:**
```javascript
import { FlatCompat } from '@eslint/eslintrc'
...compat.extends('turbo')
```

**When Native Support Available:**
```javascript
import turbo from 'eslint-config-turbo'
export default [...turbo]
```

---

## 📅 Review Schedule

**Quarterly Checks:**
- [ ] Q1 2026 - Check plugin updates
- [ ] Q2 2026 - Re-evaluate FlatCompat usage
- [ ] Q3 2026 - Complete package configs
- [ ] Q4 2026 - Final cleanup

---

## ✅ Completion Criteria

### For Each Package Config:
- [ ] `eslint.config.mjs` created
- [ ] Extends root config
- [ ] Package-specific rules added
- [ ] `pnpm lint` passes
- [ ] VSCode linting works
- [ ] CI/CD passes

### For Plugin Updates:
- [ ] Compatible version released
- [ ] Added to catalog
- [ ] Tested with packages
- [ ] Documentation updated
- [ ] No peer dependency warnings

---

## 🚨 Blockers

| Task | Blocker | ETA | Workaround |
|------|---------|-----|------------|
| tailwindV4 config | Next.js at root | Immediate | Can proceed anytime |
| Tailwind plugin | Upstream release | Unknown | VSCode extension |
| Turbo flat config | Upstream release | Unknown | FlatCompat |

---

**Next Review Date:** 2026-04-21  
**Responsible:** DevOps Team  
**Priority Order:** Task 1 → Task 2 → Monitor Tasks 4 & 5 → Task 3
