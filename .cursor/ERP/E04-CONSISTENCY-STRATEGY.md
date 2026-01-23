# E04 — UI/UX Consistency Strategy
## Automated Enforcement & Quality Assurance for AXIS Design System

<!-- AXIS ERP Document Series -->
|  A-Series  |                          |                     |                           |                            |                          |
| :--------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
| Philosophy |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|    E-Series (Design System)    |                                |                                    |                                    |
| :----------------------------: | :----------------------------: | :--------------------------------: | :--------------------------------: |
| [E01](./E01-DESIGN-SYSTEM.md)  | [E02](./E02-BLOCKS.md)         | [E03](./E03-IMPLEMENTATION.md)     |           **[E04]**                |
|         Constitution           |         Block Library          |         Implementation Guide       |         Consistency Strategy       |

---

> **Derived From:** [E01-DESIGN-SYSTEM.md](./E01-DESIGN-SYSTEM.md), [E03-IMPLEMENTATION.md](./E03-IMPLEMENTATION.md)
>
> **Tag:** `CONSISTENCY` | `AUTOMATION` | `QUALITY` | `ENFORCEMENT`

---

## The Consistency Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATED CONSISTENCY ENFORCEMENT                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ╔═══════════════════════════════════════════════════════════════════╗    │
│   ║                                                                   ║    │
│   ║   Consistency is not a suggestion. It's a contract.               ║    │
│   ║                                                                   ║    │
│   ║   • Tailwind CLI scans and validates all utility classes          ║    │
│   ║   • Shadcn MCP audits component compliance                        ║    │
│   ║   • TypeScript enforces type contracts                            ║    │
│   ║   • ESLint catches anti-patterns                                  ║    │
│   ║   • Pre-commit hooks prevent violations                           ║    │
│   ║                                                                   ║    │
│   ║   If it compiles, it's consistent. If it's inconsistent, it fails.║    │
│   ║                                                                   ║    │
│   ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part I: The Consistency Stack

### 1.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONSISTENCY ENFORCEMENT LAYERS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Layer 1: DESIGN TOKENS (Source of Truth)                                  │
│   ├── Tailwind v4 @theme inline syntax                                      │
│   ├── Semantic color tokens (--primary, --background, etc.)                 │
│   ├── 5 theme variants (stone, zinc, neutral, gray, slate)                  │
│   └── CSS variables for runtime theming                                     │
│                                                                              │
│   Layer 2: UTILITY CLASSES (Tailwind CLI)                                   │
│   ├── Scans all source files for class names                                │
│   ├── Generates only used utilities (zero bloat)                            │
│   ├── Validates class name correctness                                      │
│   └── Detects unused/invalid classes                                        │
│                                                                              │
│   Layer 3: COMPONENT PRIMITIVES (Shadcn MCP)                                │
│   ├── 54 base components from @workspace/design-system                      │
│   ├── Audit checklist for component compliance                              │
│   ├── Registry validation (no local duplicates)                             │
│   └── Variant enforcement (cva patterns)                                    │
│                                                                              │
│   Layer 4: TYPE SAFETY (TypeScript)                                         │
│   ├── Strict mode enabled (no implicit any)                                 │
│   ├── Component prop validation                                             │
│   ├── Theme token autocomplete                                              │
│   └── Build-time type checking                                              │
│                                                                              │
│   Layer 5: CODE QUALITY (ESLint + Prettier)                                 │
│   ├── Import order enforcement                                              │
│   ├── cn() usage validation                                                 │
│   ├── Accessibility rules (jsx-a11y)                                        │
│   └── React hooks rules                                                     │
│                                                                              │
│   Layer 6: PRE-COMMIT VALIDATION (Husky + lint-staged)                      │
│   ├── Run type check before commit                                          │
│   ├── Run lint on staged files                                              │
│   ├── Format code with Prettier                                             │
│   └── Block commit if violations found                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part II: Tailwind CLI Integration

### 2.1 What Tailwind CLI Provides

Based on [Tailwind CSS CLI documentation](https://tailwindcss.com/docs/installation/tailwind-cli), the CLI offers:

| Feature | Benefit | AXIS Usage |
|---------|---------|------------|
| **Class Scanning** | Scans all source files for utility classes | Validates all components use valid Tailwind classes |
| **On-Demand Generation** | Only generates CSS for classes actually used | Zero bloat, optimal bundle size |
| **Watch Mode** | Rebuilds CSS when files change | Development workflow |
| **Build Optimization** | Minifies and optimizes production CSS | Production deployment |
| **Source Detection** | Automatically detects class usage patterns | Catches invalid/typo classes |

### 2.2 Tailwind CLI Commands

```bash
# Development: Watch mode with live rebuild
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch

# Production: Optimized build
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --minify

# Validation: Check for unused classes (via build output)
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css

# Integration: Add to package.json scripts
{
  "scripts": {
    "dev:css": "@tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch",
    "build:css": "@tailwindcss/cli -i ./src/input.css -o ./src/output.css --minify"
  }
}
```

### 2.3 Class Validation Strategy

```tsx
// ✅ VALID - Tailwind CLI will generate these classes
<div className="bg-primary text-primary-foreground rounded-lg p-4">
  <Button variant="default" size="sm">Action</Button>
</div>

// ❌ INVALID - Tailwind CLI will NOT generate (typo detected)
<div className="bg-primry text-forground rounded-lg p-4">
  {/* CLI build will show these classes are not generated */}
</div>

// ❌ INVALID - Hardcoded colors (violates semantic token rule)
<div className="bg-blue-500 text-white">
  {/* This WILL generate, but violates our design system rules */}
  {/* Caught by ESLint rule (see Part IV) */}
</div>
```

---

## Part III: Shadcn MCP Integration

### 3.1 Available MCP Tools

#### Shadcn MCP (`user-shadcn`)

| Tool | Purpose | AXIS Usage |
|------|---------|------------|
| `get_audit_checklist` | Post-generation validation checklist | Run after adding components to verify setup |
| `list_items_in_registries` | List available components from registries | Discover what's available before creating local versions |
| `search_items_in_registries` | Search for specific components | Find components by name/category |
| `view_items_in_registries` | View component details | Inspect component before adding |
| `get_add_command_for_items` | Get CLI command to add component | Generate correct shadcn add command |
| `get_item_examples_from_registries` | Get usage examples | Learn component patterns |
| `get_project_registries` | List configured registries | Verify project setup |

#### Shadcn Studio MCP (`user-ShadcnStudio`)

| Tool | Purpose | AXIS Usage |
|------|---------|------------|
| `get-blocks-metadata` | Get available block templates | Discover pre-built patterns |
| `get-component-content` | Get component source code | Inspect implementation |
| `install-theme` | Install theme from Shadcn Studio | Add theme variants |
| `get-ftc-instructions` | Figma to Code workflow | Convert designs to components |
| `collect_selected_blocks` | Collect multiple blocks | Batch operations |
| `get-create-instructions` | Create UI workflow instructions | Guided component creation |
| `get-refine-instructions` | Refine existing UI | Improve components |

### 3.2 Audit Checklist Workflow

```bash
# Step 1: Add a new component
npx shadcn@latest add button

# Step 2: Run audit checklist via MCP
# This validates:
# - Component was added to correct location
# - Imports are correct
# - TypeScript types are valid
# - No duplicate components exist
# - Component exports are correct
```

**Audit Checklist Items:**

1. ✅ Component added to `packages/design-system/src/components/`
2. ✅ Component exported from `packages/design-system/src/index.ts`
3. ✅ TypeScript types are defined
4. ✅ Component uses `cn()` utility
5. ✅ Component uses semantic tokens (no hardcoded colors)
6. ✅ Component has variants defined (if applicable)
7. ✅ No duplicate component in `apps/` directories
8. ✅ Component builds without errors

### 3.3 Registry Validation

```tsx
// ✅ CORRECT - Import from design-system registry
import { Button, Card, Input } from "@workspace/design-system"

// ❌ FORBIDDEN - Local component (detected by MCP audit)
import { Button } from "./components/ui/button"

// ❌ FORBIDDEN - Direct package import (bypasses registry)
import { Button } from "../../../packages/design-system/src/components/button"
```

**MCP Validation:**
- `list_items_in_registries` - Verify component exists in registry
- `search_items_in_registries` - Find component before creating local version
- `get_audit_checklist` - Post-creation validation

---

## Part IV: ESLint Rules for Design System Compliance

### 4.1 Custom ESLint Rules

```javascript
// .eslintrc.js - Design System Enforcement Rules

module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  plugins: ["@typescript-eslint", "jsx-a11y"],
  rules: {
    // ============================================================================
    // DESIGN SYSTEM COMPLIANCE RULES
    // ============================================================================

    // Rule 1: Enforce workspace imports
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/components/ui/*"],
            message: "Import from @workspace/design-system instead of local ui components",
          },
          {
            group: ["../../../packages/design-system/*"],
            message: "Use workspace import @workspace/design-system instead of relative paths",
          },
        ],
      },
    ],

    // Rule 2: Enforce cn() usage (custom rule - requires plugin)
    // Detects template literals in className props
    "no-template-literals-in-classname": "error",

    // Rule 3: Accessibility enforcement
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",

    // Rule 4: React best practices
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Rule 5: TypeScript strict mode
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
  },
}
```

### 4.2 Custom ESLint Plugin for Hardcoded Colors

```javascript
// eslint-plugin-design-system/rules/no-hardcoded-colors.js

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded color classes (use semantic tokens)",
      category: "Design System",
      recommended: true,
    },
    messages: {
      hardcodedColor: "Use semantic tokens instead of '{{className}}'. Use 'bg-primary', 'text-foreground', etc.",
    },
  },
  create(context) {
    const hardcodedColorPattern = /\b(bg|text|border)-(red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone)-\d{2,3}\b/

    return {
      JSXAttribute(node) {
        if (node.name.name === "className" && node.value) {
          const classNameValue = node.value.value || ""
          
          if (hardcodedColorPattern.test(classNameValue)) {
            const match = classNameValue.match(hardcodedColorPattern)
            context.report({
              node,
              messageId: "hardcodedColor",
              data: {
                className: match[0],
              },
            })
          }
        }
      },
    }
  },
}
```

**Usage:**
```tsx
// ❌ ESLint Error: Use semantic tokens instead of 'bg-blue-500'
<div className="bg-blue-500 text-white">Content</div>

// ✅ ESLint Pass: Semantic tokens used
<div className="bg-primary text-primary-foreground">Content</div>
```

---

## Part V: Pre-Commit Hooks

### 5.1 Husky + lint-staged Setup

```bash
# Install dependencies
pnpm add -D husky lint-staged

# Initialize Husky
npx husky init

# Create pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

### 5.2 lint-staged Configuration

```json
// package.json

{
  "lint-staged": {
    // TypeScript files: Type check + lint + format
    "**/*.{ts,tsx}": [
      "pnpm check-types",
      "eslint --fix",
      "prettier --write"
    ],
    
    // CSS files: Format
    "**/*.css": [
      "prettier --write"
    ],
    
    // JSON files: Format
    "**/*.json": [
      "prettier --write"
    ],
    
    // Design system components: Extra validation
    "packages/design-system/src/components/**/*.{ts,tsx}": [
      "pnpm --filter @workspace/design-system check-types",
      "pnpm --filter @workspace/design-system lint",
      "prettier --write"
    ]
  }
}
```

### 5.3 Pre-Commit Validation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRE-COMMIT VALIDATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Developer runs: git commit -m "Add feature"                               │
│                                                                              │
│   ▼                                                                          │
│   Husky triggers pre-commit hook                                            │
│                                                                              │
│   ▼                                                                          │
│   lint-staged runs on staged files only                                     │
│                                                                              │
│   ▼                                                                          │
│   Step 1: TypeScript Type Check                                             │
│   ├── pnpm check-types                                                      │
│   ├── ✅ Pass → Continue                                                    │
│   └── ❌ Fail → BLOCK COMMIT (show errors)                                 │
│                                                                              │
│   ▼                                                                          │
│   Step 2: ESLint Validation                                                 │
│   ├── eslint --fix (auto-fix if possible)                                   │
│   ├── ✅ Pass → Continue                                                    │
│   └── ❌ Fail → BLOCK COMMIT (show errors)                                 │
│                                                                              │
│   ▼                                                                          │
│   Step 3: Prettier Formatting                                               │
│   ├── prettier --write (auto-format)                                        │
│   └── ✅ Always succeeds                                                    │
│                                                                              │
│   ▼                                                                          │
│   Commit succeeds ✅                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part VI: CI/CD Validation Pipeline

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/design-system-validation.yml

name: Design System Validation

on:
  pull_request:
    paths:
      - 'packages/design-system/**'
      - 'apps/*/src/**'
  push:
    branches:
      - main
      - develop

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      # Step 1: TypeScript validation
      - name: Type check design-system
        run: pnpm --filter @workspace/design-system check-types
      
      - name: Type check all apps
        run: pnpm check-types
      
      # Step 2: ESLint validation
      - name: Lint design-system
        run: pnpm --filter @workspace/design-system lint
      
      - name: Lint all apps
        run: pnpm lint
      
      # Step 3: Build validation
      - name: Build design-system
        run: pnpm --filter @workspace/design-system build
      
      - name: Build all apps
        run: pnpm build
      
      # Step 4: Tailwind CSS validation
      - name: Build Tailwind CSS
        run: pnpm build:css
      
      # Step 5: Test suite (if exists)
      - name: Run tests
        run: pnpm test
        if: always()
```

### 6.2 Validation Checklist

| Check | Tool | Failure Action |
|-------|------|----------------|
| TypeScript types | `tsc --noEmit` | Block merge |
| ESLint rules | `eslint` | Block merge |
| Prettier format | `prettier --check` | Block merge |
| Tailwind build | `@tailwindcss/cli` | Block merge |
| Component exports | Custom script | Block merge |
| No local UI components | Custom script | Block merge |
| Bundle size | `size-limit` | Warn only |

---

## Part VII: Automated Enforcement Scripts

### 7.1 Detect Local UI Components

```bash
#!/bin/bash
# scripts/check-no-local-ui-components.sh

# Check for forbidden local UI component directories
FORBIDDEN_PATHS=(
  "apps/*/src/components/ui"
  "apps/*/components/ui"
)

VIOLATIONS=0

for pattern in "${FORBIDDEN_PATHS[@]}"; do
  if find . -path "*/$pattern" -type d | grep -q .; then
    echo "❌ ERROR: Local UI components detected at: $pattern"
    echo "   Use @workspace/design-system instead"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "Fix: Remove local UI components and import from @workspace/design-system"
  exit 1
fi

echo "✅ No local UI components detected"
exit 0
```

### 7.2 Validate Workspace Imports

```typescript
// scripts/validate-imports.ts

import { readFileSync, readdirSync } from "fs"
import { join } from "path"

const FORBIDDEN_IMPORTS = [
  /from ['"]\.\.\/\.\.\/\.\.\/packages\/design-system/,
  /from ['"].*\/components\/ui\//,
]

const REQUIRED_IMPORT = /@workspace\/design-system/

function validateFile(filePath: string): string[] {
  const content = readFileSync(filePath, "utf-8")
  const errors: string[] = []

  // Check for forbidden imports
  FORBIDDEN_IMPORTS.forEach((pattern) => {
    if (pattern.test(content)) {
      errors.push(`Forbidden import pattern detected: ${pattern}`)
    }
  })

  // Check if file imports UI components but not from workspace
  if (content.includes("import {") && content.includes("Button")) {
    if (!REQUIRED_IMPORT.test(content)) {
      errors.push("UI components imported but not from @workspace/design-system")
    }
  }

  return errors
}

// Run validation
const appsDir = join(process.cwd(), "apps")
let totalErrors = 0

// Validate all .tsx files in apps/
// ... (implementation)

if (totalErrors > 0) {
  console.error(`❌ ${totalErrors} import violations found`)
  process.exit(1)
}

console.log("✅ All imports are valid")
```

### 7.3 Validate Semantic Tokens

```typescript
// scripts/validate-semantic-tokens.ts

import { readFileSync } from "fs"
import { glob } from "glob"

const HARDCODED_COLOR_PATTERN = /className=["'].*\b(bg|text|border)-(red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone)-\d{2,3}\b/g

async function validateSemanticTokens() {
  const files = await glob("apps/**/*.{tsx,jsx}", { ignore: "node_modules/**" })
  
  let violations = 0

  for (const file of files) {
    const content = readFileSync(file, "utf-8")
    const matches = content.match(HARDCODED_COLOR_PATTERN)

    if (matches) {
      console.error(`❌ ${file}:`)
      matches.forEach((match) => {
        console.error(`   Hardcoded color: ${match}`)
        violations++
      })
    }
  }

  if (violations > 0) {
    console.error(`\n❌ ${violations} hardcoded color violations found`)
    console.error("Use semantic tokens: bg-primary, text-foreground, etc.")
    process.exit(1)
  }

  console.log("✅ All colors use semantic tokens")
}

validateSemanticTokens()
```

---

## Part VIII: Monitoring & Metrics

### 8.1 Design System Health Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Component Reuse** | >90% | % of UI using design-system components |
| **Import Compliance** | 100% | % of imports from @workspace/design-system |
| **Semantic Token Usage** | 100% | % of colors using semantic tokens |
| **TypeScript Errors** | 0 | Count of type errors |
| **ESLint Violations** | 0 | Count of lint errors |
| **Bundle Size** | <500KB | Total design-system bundle size |
| **Build Time** | <30s | Time to build design-system |

### 8.2 Automated Reporting

```typescript
// scripts/generate-design-system-report.ts

interface DesignSystemMetrics {
  componentReuse: number
  importCompliance: number
  semanticTokenUsage: number
  typeScriptErrors: number
  eslintViolations: number
  bundleSize: number
  buildTime: number
}

async function generateReport(): Promise<DesignSystemMetrics> {
  // Collect metrics
  const metrics: DesignSystemMetrics = {
    componentReuse: await calculateComponentReuse(),
    importCompliance: await calculateImportCompliance(),
    semanticTokenUsage: await calculateSemanticTokenUsage(),
    typeScriptErrors: await countTypeScriptErrors(),
    eslintViolations: await countEslintViolations(),
    bundleSize: await measureBundleSize(),
    buildTime: await measureBuildTime(),
  }

  // Generate report
  console.log("\n📊 Design System Health Report")
  console.log("================================")
  console.log(`Component Reuse: ${metrics.componentReuse}%`)
  console.log(`Import Compliance: ${metrics.importCompliance}%`)
  console.log(`Semantic Token Usage: ${metrics.semanticTokenUsage}%`)
  console.log(`TypeScript Errors: ${metrics.typeScriptErrors}`)
  console.log(`ESLint Violations: ${metrics.eslintViolations}`)
  console.log(`Bundle Size: ${metrics.bundleSize}KB`)
  console.log(`Build Time: ${metrics.buildTime}s`)

  // Check if all targets met
  const allTargetsMet =
    metrics.componentReuse >= 90 &&
    metrics.importCompliance === 100 &&
    metrics.semanticTokenUsage === 100 &&
    metrics.typeScriptErrors === 0 &&
    metrics.eslintViolations === 0 &&
    metrics.bundleSize < 500 &&
    metrics.buildTime < 30

  if (allTargetsMet) {
    console.log("\n✅ All design system targets met!")
  } else {
    console.log("\n⚠️ Some targets not met. Review above metrics.")
  }

  return metrics
}

generateReport()
```

---

## Part IX: Developer Workflow

### 9.1 Daily Development Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPER DAILY WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Morning: Pull latest changes                                              │
│   ├── git pull origin develop                                               │
│   ├── pnpm install (update dependencies)                                    │
│   └── pnpm dev (start dev server)                                           │
│                                                                              │
│   Development: Build feature                                                │
│   ├── Import components from @workspace/design-system                       │
│   ├── Use semantic tokens (bg-primary, text-foreground)                     │
│   ├── Use cn() for className merging                                        │
│   ├── TypeScript autocomplete guides correct usage                          │
│   └── Tailwind CLI rebuilds CSS on save                                     │
│                                                                              │
│   Pre-Commit: Automatic validation                                          │
│   ├── git add .                                                             │
│   ├── git commit -m "Add feature"                                           │
│   ├── Husky runs pre-commit hook                                            │
│   ├── lint-staged validates:                                                │
│   │   ├── TypeScript types ✅                                               │
│   │   ├── ESLint rules ✅                                                   │
│   │   └── Prettier format ✅                                                │
│   └── Commit succeeds or fails with clear errors                            │
│                                                                              │
│   Push: CI/CD validation                                                    │
│   ├── git push origin feature-branch                                        │
│   ├── GitHub Actions runs full validation                                   │
│   ├── All checks must pass before merge                                     │
│   └── PR review includes design system compliance                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Adding a New Component

```bash
# Step 1: Check if component exists in registry
# Use Shadcn MCP: search_items_in_registries
# Query: "button"

# Step 2: If exists, add from registry
npx shadcn@latest add button

# Step 3: Run audit checklist
# Use Shadcn MCP: get_audit_checklist
# Validates component was added correctly

# Step 4: Verify in code
# Import and use: import { Button } from "@workspace/design-system"

# Step 5: Commit (pre-commit hooks validate automatically)
git add .
git commit -m "Add Button component"
```

---

## Part X: Troubleshooting Guide

### 10.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **"Cannot find module '@workspace/design-system'"** | Missing workspace link | Run `pnpm install` |
| **TypeScript errors in className** | Invalid Tailwind class | Check Tailwind docs or use autocomplete |
| **ESLint error: hardcoded color** | Using `bg-blue-500` instead of semantic token | Replace with `bg-primary` |
| **Pre-commit hook fails** | Type errors or lint violations | Fix errors shown in output |
| **Tailwind classes not applying** | CSS not rebuilt | Run `pnpm dev:css` or restart dev server |
| **Component not found** | Not exported from design-system | Check `packages/design-system/src/index.ts` |

### 10.2 Debug Commands

```bash
# Check TypeScript types
pnpm check-types

# Check ESLint
pnpm lint

# Check Prettier formatting
pnpm format:check

# Rebuild Tailwind CSS
pnpm build:css

# Validate imports
pnpm validate:imports

# Check for local UI components
pnpm validate:no-local-ui

# Generate health report
pnpm report:design-system
```

---

## Part XI: Implementation Checklist

### 11.1 Setup Checklist

- [ ] **Tailwind CLI**
  - [ ] Install `@tailwindcss/cli`
  - [ ] Configure input/output CSS files
  - [ ] Add dev and build scripts
  - [ ] Test watch mode

- [ ] **Shadcn MCP**
  - [ ] Verify MCP servers are connected
  - [ ] Test `get_audit_checklist` tool
  - [ ] Test `list_items_in_registries` tool
  - [ ] Document MCP workflows

- [ ] **ESLint Rules**
  - [ ] Add custom design system rules
  - [ ] Configure no-restricted-imports
  - [ ] Add hardcoded color detection
  - [ ] Test with sample violations

- [ ] **Pre-Commit Hooks**
  - [ ] Install Husky
  - [ ] Configure lint-staged
  - [ ] Test pre-commit validation
  - [ ] Document bypass procedure (if needed)

- [ ] **CI/CD Pipeline**
  - [ ] Create GitHub Actions workflow
  - [ ] Add all validation steps
  - [ ] Configure branch protection
  - [ ] Test with sample PR

- [ ] **Monitoring**
  - [ ] Create metrics collection script
  - [ ] Set up automated reporting
  - [ ] Define alert thresholds
  - [ ] Schedule weekly reports

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | ✅ Strategy Defined (Implementation Pending) |
| **Version** | 0.1.0 |
| **Owner** | Team 1 (Infrastructure) |
| **Dependencies** | [E01](./E01-DESIGN-SYSTEM.md), [E03](./E03-IMPLEMENTATION.md) |
| **Tools** | Tailwind CLI, Shadcn MCP, ESLint, Husky, GitHub Actions |
| **Last Updated** | 2026-01-23 |

---

> *"Consistency is not achieved through documentation. It's enforced through automation. Every commit, every build, every deployment—validated against the design system contract."*
