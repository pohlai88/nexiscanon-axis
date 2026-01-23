# Design System Consistency Implementation

> **Status:** ✅ Fully Implemented
>
> **Documentation:** [E04-CONSISTENCY-STRATEGY.md](.cursor/ERP/E04-CONSISTENCY-STRATEGY.md)

## Overview

This repository implements automated design system consistency enforcement through multiple layers of validation. Every commit, build, and deployment is validated against the AXIS design system contract.

## Quick Start

### Daily Development

```bash
# Run all validations
pnpm validate:all

# Generate design system health report
pnpm report:design-system

# Development with CSS watch
pnpm css:dev
```

### Pre-Commit Validation (Automatic)

When you commit code, Husky automatically runs:
1. ✅ TypeScript type checking
2. ✅ ESLint validation (including custom design system rules)
3. ✅ Prettier formatting

```bash
# Commits are automatically validated
git add .
git commit -m "Add feature"
# → Husky runs lint-staged
# → All validations must pass
```

## Validation Layers

### Layer 1: Design Tokens
- **What:** Tailwind v4 semantic tokens (`--primary`, `--background`, etc.)
- **When:** Compile-time
- **Tool:** Tailwind CSS v4

### Layer 2: Utility Classes
- **What:** Valid Tailwind class names only
- **When:** Build-time
- **Tool:** `@tailwindcss/cli`
- **Commands:**
  - `pnpm css:dev` - Watch mode
  - `pnpm css:build` - Production build

### Layer 3: Component Imports
- **What:** All UI components from `@workspace/design-system`
- **When:** Pre-commit, CI/CD
- **Tool:** Custom validation script
- **Command:** `pnpm validate:imports`

**Enforces:**
- ✅ `import { Button } from "@workspace/design-system"`
- ❌ `import { Button } from "./components/ui/button"`

### Layer 4: Semantic Tokens
- **What:** No hardcoded Tailwind colors
- **When:** Pre-commit, CI/CD
- **Tool:** Custom validation script
- **Command:** `pnpm validate:tokens`

**Enforces:**
- ✅ `className="bg-primary text-primary-foreground"`
- ❌ `className="bg-blue-500 text-white"`

### Layer 5: Local UI Components
- **What:** No local `components/ui` directories in apps
- **When:** Pre-commit, CI/CD
- **Tool:** Bash script
- **Command:** `pnpm validate:no-local-ui`

**Enforces:**
- ✅ All UI in `packages/design-system/src/components/`
- ❌ No `apps/*/components/ui/` directories

### Layer 6: AXIS Registry
- **What:** Canonical block registry with Shadcn schema
- **When:** Development, build-time
- **Tool:** Shadcn MCP + custom build script
- **Location:** `packages/design-system/registry.json`

**Registry Structure:**
- 23 canonical blocks across 5 domains
- Quorum (5), Cobalt (4), Audit (4), ERP (5), AFANDA (5)
- `registryDependencies` enforce approved base components
- `categories` provide domain organization

**Commands:**
- `pnpm registry:build` - Build registry JSON files
- `pnpm registry:validate` - Validate registry.json

**Enforces:**
- ✅ Blocks use only registered base components
- ✅ Each block has proper metadata (title, description, categories)
- ✅ Dependencies are explicitly declared

### Layer 7: ESLint Rules
- **What:** Custom design system compliance rules
- **When:** Pre-commit, CI/CD
- **Tool:** Custom ESLint plugin
- **Location:** `packages/eslint-plugin-design-system/`

**Rules:**
1. `design-system/no-hardcoded-colors` - Enforce semantic tokens
2. `design-system/no-template-literals-in-classname` - Enforce `cn()` utility
3. `no-restricted-imports` - Enforce workspace imports

### Layer 8: TypeScript
- **What:** Strict type checking
- **When:** Pre-commit, CI/CD
- **Tool:** TypeScript compiler
- **Command:** `pnpm check-types`

**Enforces:**
- No `any` types
- Complete prop type definitions
- Correct import types

## Validation Commands

```bash
# Individual validations
pnpm validate:imports          # Check workspace imports
pnpm validate:tokens          # Check semantic token usage
pnpm validate:no-local-ui     # Check for local UI directories

# Combined validation
pnpm validate:all             # Run all validations

# Design system health
pnpm report:design-system     # Generate metrics report

# Tailwind CSS
pnpm css:dev                  # Watch mode (development)
pnpm css:build                # Minified build (production)

# AXIS Registry
pnpm --filter @workspace/design-system registry:build      # Build registry JSON files
pnpm --filter @workspace/design-system registry:validate   # Validate registry.json
```

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/design-system-validation.yml`

**Triggers:**
- Pull requests to `main` or `develop`
- Direct pushes to `main` or `develop`
- Changes to design-system or app source files

**Steps:**
1. TypeScript validation
2. ESLint validation
3. Prettier check
4. Custom validations (imports, tokens, no local UI)
5. Build validation
6. Design system health report

**Status:** All checks must pass before merge

## Health Metrics

### Target Metrics

| Metric | Target | Command |
|--------|--------|---------|
| **Component Reuse** | ≥90% | `pnpm report:design-system` |
| **Import Compliance** | 100% | `pnpm validate:imports` |
| **Semantic Token Usage** | 100% | `pnpm validate:tokens` |
| **TypeScript Errors** | 0 | `pnpm check-types` |
| **ESLint Violations** | 0 | `pnpm lint` |
| **Bundle Size** | <500KB | Check `dist/output.css` |
| **Build Time** | <30s | Measured in report |

### Generate Report

```bash
pnpm report:design-system
```

**Output:**
```
📊 DESIGN SYSTEM HEALTH REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Generated: 1/23/2026, 4:30:15 PM
📁 Files Checked: 156

🎯 METRICS:
   Component Reuse:      92%      ✅ (target: ≥90%)
   Import Compliance:    100%     ✅ (target: 100%)
   Semantic Token Usage: 100%     ✅ (target: 100%)
   TypeScript Errors:    0        ✅ (target: ≤0)
   ESLint Violations:    0        ✅ (target: ≤0)
   Bundle Size:          387KB    ✅ (target: <500KB)
   Build Time:           18s      ✅ (target: <30s)

✅ ALL DESIGN SYSTEM TARGETS MET!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Common Issues & Fixes

### Issue: "Hardcoded color detected"

**ESLint Error:**
```
error  Use semantic tokens instead of 'bg-blue-500'  design-system/no-hardcoded-colors
```

**Fix:**
```tsx
// ❌ Before
<div className="bg-blue-500 text-white">

// ✅ After
<div className="bg-primary text-primary-foreground">
```

### Issue: "Use cn() utility"

**ESLint Error:**
```
error  Use cn() utility for className merging  design-system/no-template-literals-in-classname
```

**Fix:**
```tsx
// ❌ Before
className={`base ${active ? 'active' : ''}`}

// ✅ After
className={cn("base", active && "active")}
```

### Issue: "Import from @workspace/design-system"

**ESLint Error:**
```
error  Import from @workspace/design-system instead of local ui components
```

**Fix:**
```tsx
// ❌ Before
import { Button } from "./components/ui/button"

// ✅ After
import { Button } from "@workspace/design-system"
```

### Issue: Pre-commit hook fails

**Fix:**
```bash
# See what failed
git commit -m "message"
# → Shows validation errors

# Fix the errors shown
# Then commit again
git add .
git commit -m "message"
```

### Issue: Bypass pre-commit (emergency only)

```bash
# NOT RECOMMENDED - Only for emergencies
git commit --no-verify -m "message"

# Better: Fix the issues
pnpm validate:all  # See all issues
# Fix them
git commit -m "message"  # Now passes
```

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── design-system-validation.yml    # CI/CD pipeline
├── .husky/
│   └── pre-commit                          # Pre-commit hook
├── packages/eslint-plugin-design-system/   # Custom ESLint rules
│   ├── index.js
│   ├── package.json
│   ├── README.md
│   └── rules/
│       ├── no-hardcoded-colors.js
│       └── no-template-literals-in-classname.js
├── packages/design-system/
│   ├── registry.json                       # AXIS Registry (23 blocks)
│   ├── public/r/                           # Built registry JSON files
│   │   ├── index.json                      # Registry index
│   │   ├── summit-button.json              # Individual block files
│   │   └── ...                             # (23 total blocks)
│   └── scripts/
│       └── build-registry.mjs              # Registry build script
├── scripts/
│   ├── check-no-local-ui-components.sh     # Bash validation
│   ├── generate-design-system-report.ts    # Metrics generator
│   ├── validate-imports.ts                 # Import validator
│   └── validate-semantic-tokens.ts         # Token validator
├── .eslintrc.json                          # ESLint configuration
└── package.json                            # Scripts + lint-staged config
```

## Development Workflow

### 1. Start Development

```bash
# Terminal 1: Run dev server
pnpm dev

# Terminal 2: Watch CSS (if needed)
pnpm css:dev
```

### 2. Write Code

- Import components: `import { Button } from "@workspace/design-system"`
- Use semantic tokens: `className="bg-primary text-foreground"`
- Use cn() utility: `className={cn("base", conditional)}`
- TypeScript autocomplete guides you

### 3. Commit Code

```bash
git add .
git commit -m "Add feature"
# → Pre-commit hooks run automatically
# → Validation passes or shows errors
```

### 4. Push & PR

```bash
git push origin feature-branch
# → Create PR on GitHub
# → CI/CD pipeline runs all validations
# → All checks must pass before merge
```

## Bypassing Validation (Not Recommended)

### Local Pre-commit

```bash
# Skip pre-commit hooks (use only in emergencies)
git commit --no-verify -m "message"
```

### CI/CD

- Cannot be bypassed
- All PR checks must pass
- Admin override available for emergencies only

## Support & Documentation

- **Strategy Document:** [E04-CONSISTENCY-STRATEGY.md](.cursor/ERP/E04-CONSISTENCY-STRATEGY.md)
- **Design System Docs:** [E01-DESIGN-SYSTEM.md](.cursor/ERP/E01-DESIGN-SYSTEM.md)
- **Implementation Guide:** [E03-IMPLEMENTATION.md](.cursor/ERP/E03-IMPLEMENTATION.md)

## Maintenance

### Weekly Tasks

```bash
# Generate health report
pnpm report:design-system

# Review metrics
# Address any failing targets
```

### Monthly Tasks

- Review ESLint rules effectiveness
- Update validation thresholds if needed
- Check bundle size trends

---

> **Remember:** Consistency is not a suggestion. It's a contract. Every commit is validated. Every build is checked. Every deployment is guaranteed to comply with the design system.
