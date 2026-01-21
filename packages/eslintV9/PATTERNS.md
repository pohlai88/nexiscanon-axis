# Migration Patterns & Standards

> **Purpose:** Establish consistent patterns for all breaking change migrations to prevent pattern sprawl

**Version:** 1.0.0
**Last Updated:** 2026-01-21
**Applies To:** All future breaking changes and major version upgrades

---

## 🎯 Core Principles

1. **Documentation First** - Document before implementing
2. **Zero Tech Debt** - No workarounds or hacks
3. **Deferred is OK** - Better to defer than rush
4. **Catalog-Driven** - All versions in pnpm catalog
5. **Package Autonomy** - Packages manage their own configs

---

## 📋 Standard Migration Process

### **Phase 1: Planning** 📝

```
1. Identify breaking changes
2. Create TODO list with priorities
3. Assess root vs package-level changes
4. Document decisions
```

**Deliverable:** TODO list with status tracking

---

### **Phase 2: Root-Level Migration** 🔧

```
1. Update pnpm catalog with new versions
2. Update root package.json to use catalog:
3. Create/update root config files
4. Remove deprecated files
5. Test root-level functionality
```

**Deliverable:** Working root configuration

---

### **Phase 3: Documentation Package** 📦

```
packages/{technology}V{version}/
├── README.md           # Full migration guide
├── DEFERRED.md         # Actionable tasks
├── PATTERNS.md         # This file (if applicable)
└── package.json        # Package metadata
```

**Deliverable:** Self-contained documentation package

---

### **Phase 4: Defer Package Configs** 🎯

```
1. Document why deferred
2. Provide code templates
3. Set priority levels
4. Establish review schedule
```

**Deliverable:** Clear deferred tasks with templates

---

### **Phase 5: Update Root README** 🔗

```
1. Add to package list
2. Update tech stack versions
3. Update project structure
4. Link to migration docs
```

**Deliverable:** Updated project overview

---

## 📁 Directory Structure Pattern

### **For Major Version Upgrades:**

```
packages/{technology}V{majorVersion}/
├── README.md
├── DEFERRED.md
├── PATTERNS.md (optional)
├── package.json
└── examples/ (optional)
```

**Examples:**
- `packages/eslintV9/` - ESLint 8 → 9
- `packages/turboV2/` - Turbo 1 → 2 (future)
- `packages/reactV19/` - React 18 → 19 (future)

---

## 📄 File Templates

### **README.md Structure:**

```markdown
# {Technology} v{Version} Migration

> Status: [Complete/In Progress/Deferred]

## Navigation
- Link to root README
- Link to config files

## Completed Migration
- What was done
- Config changes
- Dependency updates

## Deferred Tasks
- Package-specific configs
- Plugin compatibility
- Documentation updates

## Decision Log
- Why certain choices were made
- Date and rationale

## References
- Official docs
- Related issues
```

---

### **DEFERRED.md Structure:**

```markdown
# Deferred Tasks

## 🔴 HIGH PRIORITY
Task 1: {Description}
- Package: {path}
- Effort: {time}
- Code template included

## 🟡 MEDIUM PRIORITY
Task 2: {Description}

## 🟢 LOW PRIORITY
Task 3: {Description}

## ⏸️ WAITING FOR UPSTREAM
Task 4: {Description}

## 📅 Review Schedule
Quarterly checks

## ✅ Completion Criteria
Clear checklist
```

---

### **package.json Pattern:**

```json
{
  "name": "@nexuscanon-axis/{technology}-v{version}-migration",
  "version": "1.0.0",
  "private": true,
  "description": "{Technology} v{version} migration documentation",
  "type": "module",
  "keywords": [
    "{technology}",
    "migration",
    "documentation"
  ]
}
```

---

## 🔄 pnpm Catalog Pattern

### **All Dependencies in Catalog:**

```yaml
# pnpm-workspace.yaml
catalog:
  # Core frameworks
  react: ^19.2.3                    # ✅ Specify exact version

  # Build tools
  typescript: ^5.5.3                 # ✅ Pin to tested version

  # Code quality
  eslint: ^9.17.0                    # ✅ Major version in catalog
  '@eslint/js': ^9.17.0              # ✅ Related packages together
```

### **Root package.json Pattern:**

```json
{
  "dependencies": {
    "eslint": "catalog:",            // ✅ Use catalog protocol
    "@eslint/js": "catalog:",        // ✅ All from catalog
    "some-local-only": "^1.0.0"      // ⚠️ Exception: not in catalog
  }
}
```

**Rules:**
- ✅ Use `catalog:` for shared dependencies
- ✅ Keep versions in sync via catalog
- ⚠️ Only use explicit versions for local-only packages

---

## 🎯 Config File Patterns

### **Root Config Pattern:**

```
✅ Framework-agnostic
✅ Minimal dependencies
✅ Extensible by packages
✅ Well-documented
```

**Example (ESLint):**
```javascript
// eslint.config.mjs - ROOT
export default [
  { ignores: [...] },           // ✅ Common ignores
  ...baseConfigs,               // ✅ Minimal shared config
  // ❌ NO framework-specific rules here
]
```

---

### **Package Config Pattern:**

```
✅ Extends root config
✅ Framework-specific rules
✅ Package dependencies
```

**Example (ESLint):**
```javascript
// packages/some-package/eslint.config.mjs
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,                 // ✅ Reuse root
  {
    // ✅ Package-specific overrides
  }
]
```

---

## 🔗 ESLint ↔ Prettier Relationship Pattern

### **Decision: Coordinated but Independent**

**Pattern Type:** Tied to ESLint Dependencies
**Established:** 2026-01-21
**Status:** ✅ Industry Standard

---

### **Architecture:**

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
                     Disables    │ Prevents
                     conflicting │ rule
                     formatting  │ conflicts
                     rules       │
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

---

### **Core Principles:**

1. **ESLint** = Code Quality
   - Bug detection
   - Code patterns
   - Logic issues
   - TypeScript rules

2. **Prettier** = Code Formatting
   - Style consistency
   - Whitespace
   - Semicolons
   - Import ordering

3. **Integration Layer** = `eslint-config-prettier`
   - Disables ESLint's formatting rules
   - Prevents conflicts
   - Allows both tools to coexist

---

### **Implementation Pattern:**

#### **1. ESLint Config (Root):**
```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc'

export default [
  ...compat.extends(
    'turbo',
    'prettier'  // ✅ This is eslint-config-prettier
  ),
  // ... other configs
]
```

#### **2. Prettier Config (Standalone):**
```javascript
// prettier.config.cjs
module.exports = {
  // ✅ Independent formatting rules
  semi: false,
  singleQuote: false,
  trailingComma: "es5",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
}
```

#### **3. Catalog (Both Managed):**
```yaml
catalog:
  # Code Quality
  eslint: ^9.17.0
  eslint-config-prettier: ^9.1.0    # ✅ Integration layer

  # Formatting
  prettier: ^3.4.2
  '@ianvs/prettier-plugin-sort-imports': ^4.4.1
```

#### **4. Scripts (Separate Concerns):**
```json
{
  "scripts": {
    "lint": "eslint .",                   // Code quality
    "lint:fix": "eslint --fix .",         // Fix quality issues
    "format:check": "prettier --check .", // Check formatting
    "format:write": "prettier --write ."  // Fix formatting
  }
}
```

---

### **Why This Pattern?**

✅ **Industry Standard**
- Recommended by ESLint official docs
- Recommended by Prettier official docs
- Used by major projects (React, Next.js, Vue, etc.)

✅ **Automatic Conflict Prevention**
- `eslint-config-prettier` turns off conflicting rules
- No manual coordination needed
- No surprises or debugging conflicts

✅ **Clear Separation of Concerns**
- ESLint doesn't try to format
- Prettier doesn't try to lint
- Each tool does what it's best at

✅ **Monorepo Friendly**
- Root config prevents conflicts globally
- Packages inherit conflict-free setup
- Consistent across all packages

✅ **Zero Tech Debt**
- No workarounds
- No custom scripts
- Standard tooling

---

### **Anti-Patterns (DO NOT DO):**

❌ **Don't: Run Prettier through ESLint**
```javascript
// ❌ BAD - Using eslint-plugin-prettier (deprecated)
plugins: ['prettier'],
rules: {
  'prettier/prettier': 'error'
}
```
**Why:** Slower, outdated pattern, unnecessary overhead

---

❌ **Don't: Make Them Completely Standalone**
```javascript
// ❌ BAD - No integration layer
export default [
  js.configs.recommended,
  // Missing 'prettier' config
]
```
**Why:** ESLint and Prettier will fight over formatting rules

---

❌ **Don't: Mix Formatting Concerns**
```javascript
// ❌ BAD - ESLint doing formatting
rules: {
  'semi': ['error', 'never'],  // Let Prettier handle this
  'quotes': ['error', 'single'] // Let Prettier handle this
}
```
**Why:** Conflicts with Prettier's formatting

---

### **Decision Matrix:**

| Question                            | Answer                             |
| ----------------------------------- | ---------------------------------- |
| Should ESLint format code?          | ❌ No - Prettier does this          |
| Should Prettier check code quality? | ❌ No - ESLint does this            |
| Should they know about each other?  | ✅ Yes - via eslint-config-prettier |
| Should they run together?           | ❌ No - separate commands           |
| Should versions be in catalog?      | ✅ Yes - centralized management     |

---

### **For Future Migrations:**

When upgrading ESLint or Prettier:

1. **Check Compatibility**
   ```bash
   # Verify eslint-config-prettier supports new ESLint version
   pnpm info eslint-config-prettier peerDependencies
   ```

2. **Update Catalog First**
   ```yaml
   catalog:
     eslint: ^X.Y.Z           # New version
     eslint-config-prettier: ^X.Y.Z  # Compatible version
     prettier: ^X.Y.Z         # New version
   ```

3. **Test Integration**
   ```bash
   pnpm lint        # Should not report formatting issues
   pnpm format:check # Should work independently
   ```

4. **Verify No Conflicts**
   ```bash
   # Run both - no conflicts should exist
   pnpm lint && pnpm format:check
   ```

---

### **References:**

- [Prettier + Linters](https://prettier.io/docs/en/integrating-with-linters.html)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [ESLint Formatters](https://eslint.org/docs/latest/use/formatters/)
- [Full Analysis: ESLINT-PRETTIER-RELATIONSHIP.md](./ESLINT-PRETTIER-RELATIONSHIP.md)

---

## 🚫 Anti-Patterns (DO NOT DO)

### **❌ Don't: Downgrade Versions**
```yaml
# ❌ BAD
catalog:
  eslint: ^8.57.1  # Downgrade to avoid migration
```

**✅ Instead:** Complete migration or document why deferred

---

### **❌ Don't: Use Workarounds**
```javascript
// ❌ BAD
const hackConfig = require('some-workaround')
```

**✅ Instead:** Use official migration patterns or defer properly

---

### **❌ Don't: Mix Patterns**
```json
// ❌ BAD - Mixing catalog and explicit versions
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "^19.2.3"  // Should also be catalog:
  }
}
```

**✅ Instead:** Consistent use of catalog for related packages

---

### **❌ Don't: Leave TODOs in Code**
```javascript
// ❌ BAD
// TODO: Fix this later
const tempFix = ...
```

**✅ Instead:** Move TODOs to DEFERRED.md with context

---

### **❌ Don't: Skip Documentation**
```
❌ Migrate → Close ticket → Move on
```

**✅ Instead:** Migrate → Document → Defer remaining → Update README

---

## ✅ Decision-Making Framework

### **Should This Be in Root or Package?**

| Aspect                  | Root ✅ | Package ✅ |
| ----------------------- | ------ | --------- |
| Framework-agnostic      | Yes    | No        |
| All packages use it     | Yes    | No        |
| Framework-specific      | No     | Yes       |
| Package-only dependency | No     | Yes       |

**Example:**
- TypeScript compiler → Root ✅
- Next.js ESLint config → Package ✅

---

### **Should This Be Deferred?**

```
Ask:
1. Does it block other work? → No = Can defer
2. Is it package-specific? → Yes = Should defer
3. Do we need upstream fixes? → Yes = Must defer
4. Can it be done properly now? → No = Better defer
```

**Rule:** Better to defer properly than implement poorly

---

## 📊 Priority Levels

| Level       | Icon | When to Use         | Timeline   |
| ----------- | ---- | ------------------- | ---------- |
| **HIGH**    | 🔴    | Blocks development  | Immediate  |
| **MEDIUM**  | 🟡    | Improves workflow   | 1-2 weeks  |
| **LOW**     | 🟢    | Nice to have        | 1-3 months |
| **WAITING** | ⏸️    | Blocked by upstream | Unknown    |

---

## 🔄 Review Schedule Pattern

### **Quarterly Reviews:**

```markdown
## 📅 Review Schedule

**Q1 2026** (Jan-Mar)
- [ ] Check plugin updates
- [ ] Review deferred tasks
- [ ] Update compatibility notes

**Q2 2026** (Apr-Jun)
- [ ] Re-evaluate patterns
- [ ] Complete HIGH priority tasks
- [ ] Check for upstream updates

**Q3 2026** (Jul-Sep)
- [ ] Address MEDIUM priority
- [ ] Update documentation

**Q4 2026** (Oct-Dec)
- [ ] Final cleanup
- [ ] Archive completed migrations
```

---

## 📝 Commit Message Pattern

### **For Migrations:**

```
type(scope): description

Examples:
✅ chore(eslint): upgrade to v9 with flat config
✅ docs(eslint): create migration documentation package
✅ refactor(catalog): add eslint v9 dependencies
✅ feat(eslint): configure root flat config

❌ fix: eslint stuff
❌ update eslint
```

**Format:**
- `chore`: Dependency upgrades
- `docs`: Documentation changes
- `refactor`: Config restructuring
- `feat`: New capabilities

---

## 🎓 Learning from ESLint v9 Migration

### **What Worked Well:**

✅ **Catalog-First Approach**
- Single source of truth for versions
- Easy to update across monorepo

✅ **Documentation Package**
- Self-contained reference
- Clear deferred tasks
- Code templates included

✅ **Root Config Simplicity**
- Framework-agnostic
- Minimal dependencies
- Packages handle specifics

✅ **Proper Deferral**
- Not rushed
- Well-documented
- Clear priorities

✅ **Zero Tech Debt**
- No workarounds
- Official patterns used
- Clean migration

---

### **What to Replicate:**

1. Create `packages/{tech}V{version}/` directory
2. Write comprehensive README.md
3. Document deferred tasks in DEFERRED.md
4. Update catalog first
5. Test root config
6. Update root README
7. Provide code templates
8. Set review schedule

---

## 🔮 Future Migrations Checklist

When starting a new breaking change migration:

### **Pre-Migration:**
- [ ] Read this PATTERNS.md
- [ ] Create TODO list
- [ ] Identify root vs package changes
- [ ] Check official migration guides

### **During Migration:**
- [ ] Update pnpm catalog
- [ ] Update root configs
- [ ] Test functionality
- [ ] Remove deprecated files

### **Post-Migration:**
- [ ] Create documentation package
- [ ] Write README.md
- [ ] Write DEFERRED.md
- [ ] Update root README
- [ ] Mark TODOs complete

### **Quality Check:**
- [ ] Zero tech debt introduced?
- [ ] All deferred tasks documented?
- [ ] Code templates provided?
- [ ] Review schedule set?
- [ ] Links working?

---

## 📚 Reference Pattern Library

### **File References:**

```markdown
✅ Relative links in same directory:
[DEFERRED.md](./DEFERRED.md)

✅ Links to root:
[Root README](../../README.md)

✅ Links to config:
[Root ESLint Config](../../eslint.config.mjs)

✅ Links to packages:
[tailwindV4](../design-system/tailwindV4/)
```

---

## 🎯 Success Metrics

A successful migration has:

- [ ] Zero tech debt
- [ ] All tasks documented
- [ ] Clear priorities
- [ ] Code templates
- [ ] Review schedule
- [ ] Updated root README
- [ ] Working root config
- [ ] Proper deferred tasks
- [ ] Linked documentation

---

## 🤝 Contribution Guidelines

When updating this pattern:

1. **Discuss First** - Propose changes in team review
2. **Document Rationale** - Explain why pattern changed
3. **Update Examples** - Keep examples current
4. **Version Increment** - Bump version number
5. **Announce** - Team notification

---

## 📞 Questions?

If this pattern doesn't cover your use case:

1. Check existing migration docs (eslintV9, etc.)
2. Consult team lead
3. Document your decision
4. Update this PATTERNS.md

---

**Pattern Version:** 1.0.0
**Established:** 2026-01-21
**Next Review:** 2026-04-21
**Maintained By:** DevOps Team

---

## Appendix: Complete Example

See `packages/eslintV9/` for a complete implementation of this pattern.
