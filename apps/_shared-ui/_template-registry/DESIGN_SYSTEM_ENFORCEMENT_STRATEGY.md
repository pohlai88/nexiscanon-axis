# Design System Enforcement Strategy

**Problem**: A+ design system (`@workspace/design-system`) but apps at B+ due to inconsistent usage.

**Solution**: Template System + AI Training (shadcn/Tailwind approach).

---

## Strategy: Hybrid Template System ✅

```
@workspace/design-system  (Frozen A+)
         │
         ▼
@workspace/shared-ui      (Templates)
         │
    ┌────┴────┐
    ▼         ▼
apps/web   apps/docs     (Consumers)
```

---

## Architecture

### Current Structure

```
apps/_shared-ui/
├── src/
│   ├── blocks/                    # ✅ Exists (HeroSection01, etc.)
│   ├── templates/                 # 🎯 Add: Full page templates
│   └── patterns/                  # 🎯 Add: Common patterns
│
└── _template-registry/            # ✅ Exists
    ├── TEMPLATE_INDEX.md          # AI training data
    ├── DESIGN_SYSTEM_ENFORCEMENT_STRATEGY.md
    └── TEMPLATE_REGISTRY_ARCHITECTURE.md
```

### Template Types

**1. Full Page Templates** (`src/templates/`)
- Complete pages ready to copy/paste
- Marketing: landing-page-01.tsx, pricing-page-01.tsx
- Dashboard: dashboard-home-01.tsx, settings-page-01.tsx
- Auth: login-page-01.tsx, signup-page-01.tsx

**2. Pattern Templates** (`src/patterns/`)
- Reusable UI patterns
- form-with-validation.tsx
- data-table-sortable.tsx
- modal-with-form.tsx

**3. AI Training Index** (`_template-registry/TEMPLATE_INDEX.md`)
- Core rules for AI code generation
- Pattern examples with full code
- Anti-patterns (what NOT to do)

---

## Enforcement Layers

### 1. AI Training (Cursor)
**File**: `_template-registry/TEMPLATE_INDEX.md`
**Rule**: `.cursor/rules/template-enforcement.always.mdc`

```
User: "Create landing page"
  ↓
AI reads: TEMPLATE_INDEX.md
  ↓
AI applies: Workspace imports + cn() + semantic tokens
  ↓
Result: A+ quality code
```

### 2. ESLint Rules (Automated)

```js
{
  "rules": {
    // Prevent template literals in className
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='className'] TemplateLiteral",
        "message": "Use cn() instead of template literals"
      }
    ]
  }
}
```

### 3. Pre-commit Hooks (Git)

```bash
# .husky/pre-commit
grep -r "className={\`" apps/ && exit 1
grep -r "bg-\(red\|blue\|green\)-[0-9]" apps/ && exit 1
```

### 4. Dependency Cruiser (Architecture)

Already configured in `.dependency-cruiser.js`:
- Blocks deep imports to design-system internals
- Enforces package boundaries
- Prevents circular dependencies

---

## Success Metrics

| Metric              | Before      | Target    |
| ------------------- | ----------- | --------- |
| Apps Grade          | B+ (83%)    | A (95%+)  |
| Template Literals   | 6+ per app  | 0         |
| Hardcoded Colors    | 12+ per app | 0         |
| Time to Create Page | 2-4 hours   | 15-30 min |

---

## Implementation Status

### ✅ Completed
- AI training index (TEMPLATE_INDEX.md)
- Enforcement rule (template-enforcement.always.mdc)
- Architecture documentation
- Design system lock rule (design-system.delta.mdc)
- Dependency Cruiser configuration

### ⏳ Pending
- [ ] Create template files in `src/templates/`
- [ ] Create pattern files in `src/patterns/`
- [ ] Add ESLint custom rules
- [ ] Add pre-commit hooks
- [ ] Create VSCode snippets

---

## Quick Start

### Test Current Setup (5 min)

```bash
# In Cursor, ask:
"Create a landing page using the design system"

# Expected: AI reads TEMPLATE_INDEX.md and generates A+ code
```

### Create First Template (30 min)

```bash
mkdir -p apps/_shared-ui/src/templates/marketing
touch apps/_shared-ui/src/templates/marketing/landing-page-01.tsx

# Copy pattern from TEMPLATE_INDEX.md
# Test in apps/web or apps/docs
```

### Add Enforcement (1 hour)

```bash
# Add ESLint rule to root eslint.config.mjs
# Add pre-commit hook to .husky/
# Test with intentionally bad code
```

---

## Comparison: Before vs After

### Before
```tsx
// B+ quality
<div className={`bg-blue-500 ${isActive ? 'border-2' : ''}`}>
```

### After
```tsx
// A+ quality
import { cn } from "@workspace/design-system/lib/utils";

<div className={cn(
  "bg-primary",
  isActive && "border-2 border-primary"
)}>
```

---

## Key Differentiators

### vs Tailwind CDN
- Full components + templates (not just CSS)
- Workspace packages (not global)
- Automated enforcement

### vs shadcn/ui Registry
- Copy/paste + AI training (not CLI-only)
- Components + Pages + Patterns
- Multi-layer architecture

### vs Material-UI
- Flexible templates (not strict API)
- Full customization
- Tree-shakeable

---

## References

- **Architecture**: `TEMPLATE_REGISTRY_ARCHITECTURE.md`
- **AI Training**: `TEMPLATE_INDEX.md`
- **Enforcement Rule**: `.cursor/rules/template-enforcement.always.mdc`
- **Design System Lock**: `.cursor/rules/design-system.delta.mdc`
- **Dependency Rules**: `.dependency-cruiser.js`
