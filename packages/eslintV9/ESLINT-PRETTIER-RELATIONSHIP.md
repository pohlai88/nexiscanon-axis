# ESLint ↔ Prettier Relationship Analysis

> **Decision Required:** Should Prettier be tied to ESLint or standalone?

**Date:** 2026-01-21  
**Status:** Decision Pending

---

## 🔍 Current State Analysis

### **Current Setup:**

1. **ESLint Config** (`eslint.config.mjs`)
   ```javascript
   ...compat.extends('turbo', 'prettier')  // ← Prettier config imported
   ```

2. **Prettier Config** (`prettier.config.cjs`)
   - Standalone config file
   - Uses `@ianvs/prettier-plugin-sort-imports`
   - Has its own import ordering rules

3. **Dependencies:**
   ```yaml
   eslint: ^9.17.0
   eslint-config-prettier: ^9.1.0        # ← Integration layer
   prettier: ^3.4.2
   '@ianvs/prettier-plugin-sort-imports': ^4.4.1
   ```

### **Current Integration:**
```
ESLint → eslint-config-prettier → Turns off ESLint formatting rules
                                  (Prevents conflicts with Prettier)
```

---

## 📊 Option Comparison

### **Option 1: Tied to ESLint Dependencies** 🔗

**Structure:**
```
eslint.config.mjs
├── extends: 'prettier'  ✅ Keep this
└── Uses eslint-config-prettier

prettier.config.cjs
└── Standalone, but coordinated
```

**Pros:**
- ✅ Prevents rule conflicts automatically
- ✅ Single command: `pnpm lint` (ESLint doesn't run formatting rules)
- ✅ Industry standard pattern (ESLint delegates to Prettier)
- ✅ `eslint-config-prettier` turns off conflicting rules
- ✅ Clear separation of concerns: ESLint = code quality, Prettier = formatting

**Cons:**
- ⚠️ Need to keep `eslint-config-prettier` updated
- ⚠️ Slight coupling (but intentional)

---

### **Option 2: Standalone** 🔓

**Structure:**
```
eslint.config.mjs
└── Remove extends: 'prettier'

prettier.config.cjs
└── Completely independent
```

**Pros:**
- ✅ Complete independence
- ✅ No integration dependencies

**Cons:**
- ❌ **Risk of rule conflicts** (ESLint and Prettier fighting)
- ❌ Need to manually maintain compatibility
- ❌ Harder to debug when rules conflict
- ❌ Not industry standard pattern
- ❌ More maintenance burden

---

## 🎯 Recommended Decision

### **✅ RECOMMENDED: Option 1 - Tied to ESLint (Current Pattern)**

**Rationale:**

1. **Industry Standard** 🏆
   - Official Prettier docs recommend this pattern
   - ESLint official docs recommend this pattern
   - Used by major projects (React, Next.js, etc.)

2. **Prevents Tech Debt** 🚫
   - `eslint-config-prettier` automatically disables conflicting rules
   - No manual conflict resolution needed
   - Less maintenance overhead

3. **Clear Separation of Concerns** 🎯
   ```
   ESLint   → Code quality (bugs, patterns, logic)
   Prettier → Code formatting (style, whitespace, semicolons)
   ```

4. **Developer Experience** 💡
   - Single workflow: `pnpm lint` checks quality
   - Separate workflow: `pnpm format:write` handles formatting
   - No surprises or conflicts

5. **Monorepo Benefits** 📦
   - Root config prevents conflicts globally
   - Packages inherit conflict-free setup
   - Consistent across all packages

---

## 🏗️ Architecture Decision

### **Relationship Diagram:**

```
┌─────────────────────────────────────────────┐
│           Code Quality Layer                │
│                                             │
│  ESLint v9                                  │
│  ├── Code quality rules (bugs, patterns)   │
│  ├── TypeScript rules                       │
│  └── eslint-config-prettier ←─┐            │
│                                │            │
└────────────────────────────────┼────────────┘
                                 │
                     Disables     │
                     conflicting  │
                     rules        │
                                 │
┌────────────────────────────────┼────────────┐
│           Formatting Layer     │            │
│                                ▼            │
│  Prettier v3                                │
│  ├── Code formatting (style)               │
│  ├── Import sorting plugin                 │
│  └── Runs independently                    │
│                                             │
└─────────────────────────────────────────────┘
```

### **Integration Points:**

1. **ESLint Config** - Includes `eslint-config-prettier`
2. **Prettier Config** - Standalone, no ESLint dependency
3. **Catalog** - Both versions centrally managed
4. **Scripts** - Separate commands for each concern

---

## 📋 Implementation Details

### **Current Setup (Keep This):**

#### **1. ESLint Config:**
```javascript
// eslint.config.mjs
export default [
  ...compat.extends('turbo', 'prettier'),  // ✅ Keep 'prettier'
  // ... rest of config
]
```

**Purpose:** Disables ESLint formatting rules that conflict with Prettier

---

#### **2. Prettier Config:**
```javascript
// prettier.config.cjs
module.exports = {
  // ✅ Standalone formatting rules
  semi: false,
  singleQuote: false,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
}
```

**Purpose:** Independent formatting configuration

---

#### **3. Package Scripts:**
```json
{
  "scripts": {
    "lint": "eslint .",              // Code quality only
    "format:check": "prettier --check .", // Formatting check
    "format:write": "prettier --write ."  // Formatting fix
  }
}
```

**Purpose:** Separate concerns, clear commands

---

#### **4. Catalog Dependencies:**
```yaml
catalog:
  # Code Quality
  eslint: ^9.17.0
  eslint-config-prettier: ^9.1.0    # ✅ Integration layer
  
  # Formatting
  prettier: ^3.4.2
  '@ianvs/prettier-plugin-sort-imports': ^4.4.1
```

**Purpose:** Centralized version management

---

## ✅ Decision Matrix

| Aspect | Tied to ESLint | Standalone |
|--------|----------------|------------|
| **Conflict Prevention** | ✅ Automatic | ❌ Manual |
| **Maintenance** | ✅ Low | ❌ High |
| **Industry Standard** | ✅ Yes | ❌ No |
| **Monorepo Friendly** | ✅ Yes | ⚠️ Complex |
| **Separation of Concerns** | ✅ Clear | ✅ Clear |
| **Tech Debt Risk** | ✅ Low | ❌ High |
| **Developer Experience** | ✅ Good | ⚠️ Confusing |

---

## 🎯 Final Decision

### **✅ DECISION: Tied to ESLint Dependencies**

**Implementation:**
- ✅ Keep `eslint-config-prettier` in catalog
- ✅ Keep `extends: 'prettier'` in ESLint config
- ✅ Keep Prettier config standalone (no ESLint deps)
- ✅ Maintain separate scripts for lint vs format
- ✅ Document the relationship in patterns

**Justification:**
1. **Zero Tech Debt** - No manual conflict resolution
2. **Industry Standard** - Proven pattern
3. **Monorepo Ready** - Scales well
4. **Clear Ownership** - ESLint knows to defer to Prettier

---

## 📝 Documentation Update

### **Add to PATTERNS.md:**

```markdown
## ESLint ↔ Prettier Relationship

**Pattern:** Coordinated but Independent

**ESLint:**
- Code quality (bugs, logic, patterns)
- Includes eslint-config-prettier
- Disables own formatting rules

**Prettier:**
- Code formatting (style, whitespace)
- Standalone config
- Runs independently

**Integration:**
- ESLint delegates formatting to Prettier
- No conflicts due to eslint-config-prettier
- Separate commands: lint vs format
```

---

## 🔄 Migration Impact

**No migration needed!** ✅

Current setup already follows the recommended pattern:
- [x] `eslint-config-prettier` installed
- [x] Extended in ESLint config
- [x] Prettier config standalone
- [x] Separate scripts
- [x] Catalog managed

---

## 📚 References

### **Official Documentation:**
- [Prettier + ESLint Integration](https://prettier.io/docs/en/integrating-with-linters.html)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [ESLint Formatters](https://eslint.org/docs/latest/use/formatters/)

### **Best Practices:**
- [Airbnb Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Standard JS](https://standardjs.com/)

---

## ✅ Conclusion

**Keep the current pattern:**
- ESLint focuses on code quality
- Prettier handles formatting
- `eslint-config-prettier` prevents conflicts
- Both managed in catalog
- Clear separation of concerns

**This is the correct, industry-standard approach with zero tech debt.**

---

**Decision Made By:** Architecture Review  
**Decision Date:** 2026-01-21  
**Status:** ✅ APPROVED - No changes needed
