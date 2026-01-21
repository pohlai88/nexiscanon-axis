# Template Registry Architecture

**Purpose**: Copy/paste templates that use `@workspace/design-system` correctly.

---

## Quick Reference

### For Developers
```bash
# Browse templates
cd apps/_shared-ui/src/templates/

# Copy template
cp apps/_shared-ui/src/templates/marketing/landing-page-01.tsx \
   apps/web/app/page.tsx
```

### For AI (Cursor)
```
User: "Create landing page"
  ↓
AI reads: apps/_shared-ui/_template-registry/TEMPLATE_INDEX.md
  ↓
AI applies: Pattern with correct imports/tokens
  ↓
Result: A+ quality code
```

---

## Folder Structure

```
apps/_shared-ui/
├── src/
│   ├── blocks/                    # ✅ Existing (keep)
│   │   ├── hero-section-01.tsx
│   │   ├── navbar-component-01.tsx
│   │   └── ...
│   │
│   ├── templates/                 # 🎯 NEW: Full pages
│   │   ├── marketing/
│   │   │   ├── landing-page-01.tsx
│   │   │   ├── pricing-page-01.tsx
│   │   │   └── features-page-01.tsx
│   │   ├── dashboard/
│   │   │   ├── dashboard-home-01.tsx
│   │   │   ├── settings-page-01.tsx
│   │   │   └── users-table-01.tsx
│   │   └── auth/
│   │       ├── login-page-01.tsx
│   │       └── signup-page-01.tsx
│   │
│   └── patterns/                  # 🎯 NEW: Common patterns
│       ├── form-with-validation.tsx
│       ├── data-table-sortable.tsx
│       └── modal-with-form.tsx
│
└── _template-registry/            # ✅ Existing (AI training)
    ├── TEMPLATE_INDEX.md
    ├── DESIGN_SYSTEM_ENFORCEMENT_STRATEGY.md
    └── TEMPLATE_REGISTRY_ARCHITECTURE.md
```

---

## Template Types

### 1. Full Page Templates (`src/templates/`)

Complete pages ready to copy/paste.

**Example**: `landing-page-01.tsx`
```tsx
import {
  NavbarComponent01,
  HeroSection01,
  FeaturesSection01,
  FooterComponent01,
} from "@workspace/shared-ui/blocks";

export default function LandingPage01() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarComponent01 {...} />
      <HeroSection01 {...} />
      <FeaturesSection01 {...} />
      <FooterComponent01 {...} />
    </div>
  );
}
```

**Templates to create**:
- Marketing: landing-page-01, pricing-page-01, features-page-01
- Dashboard: dashboard-home-01, settings-page-01, users-table-01
- Auth: login-page-01, signup-page-01

---

### 2. Pattern Templates (`src/patterns/`)

Reusable UI patterns showing correct usage.

**Example**: `form-with-validation.tsx`
```tsx
import { Button, Input, Label } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export function FormWithValidationPattern() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>
    </form>
  );
}
```

**Patterns to create**:
- form-with-validation.tsx
- data-table-sortable.tsx
- modal-with-form.tsx
- loading-skeleton.tsx
- empty-state.tsx

---

### 3. AI Training Index (`_template-registry/TEMPLATE_INDEX.md`)

Central file AI reads during code generation.

**Contains**:
- Core rules (workspace imports, cn() usage, semantic tokens)
- Available blocks catalog
- Page templates with full code
- Common patterns with examples
- Anti-patterns (what NOT to do)
- Complete color token reference

---

## AI Training Workflow

### How It Works

```
1. User request: "Create a landing page"
   ↓
2. AI reads: apps/_shared-ui/_template-registry/TEMPLATE_INDEX.md
   ↓
3. AI finds: Landing page template section
   ↓
4. AI generates code using:
   ✅ @workspace/design-system imports
   ✅ cn() for conditional classes
   ✅ Semantic color tokens
   ✅ Proper transition durations
   ↓
5. Result: A+ quality code
```

### Training File Location

**Current**: `apps/_shared-ui/_template-registry/TEMPLATE_INDEX.md`

**Why this location**:
- Co-located with templates
- Easy to maintain
- Single source of truth
- AI can discover via glob patterns

**Referenced by**: `.cursor/rules/template-enforcement.always.mdc`

---

## Enforcement Layers

### Layer 1: AI Training (Cursor)
**File**: `_template-registry/TEMPLATE_INDEX.md`
**Rule**: `.cursor/rules/template-enforcement.always.mdc`
**Effect**: AI generates correct code by default

### Layer 2: TypeScript (Compile-time)
**Effect**: Type errors for incorrect imports
**Example**: Import paths enforce workspace packages

### Layer 3: ESLint (Development)
**Effect**: Linter errors for violations
**Rules**: No template literals, no hardcoded colors

### Layer 4: Pre-commit Hooks (Git)
**Effect**: Blocks commits with violations
**Check**: Template literals, hardcoded colors

### Layer 5: Dependency Cruiser (Architecture)
**File**: `.dependency-cruiser.js`
**Effect**: Blocks deep imports, enforces boundaries

---

## Creating New Templates

### Step 1: Create Template File

```bash
# Create in appropriate category
mkdir -p apps/_shared-ui/src/templates/marketing
touch apps/_shared-ui/src/templates/marketing/new-page-01.tsx
```

### Step 2: Write Template Using Best Practices

```tsx
import { /* components */ } from "@workspace/design-system";
import { /* blocks */ } from "@workspace/shared-ui/blocks";
import { cn } from "@workspace/design-system/lib/utils";

export default function NewPage01() {
  return (
    <div className="min-h-screen bg-background">
      {/* Template content */}
    </div>
  );
}
```

### Step 3: Add to TEMPLATE_INDEX.md

Update AI training index with new template pattern.

### Step 4: Test with AI

Ask Cursor to generate similar page and verify it follows pattern.

---

## Template Best Practices

### ✅ Do
- Import from workspace packages only
- Use cn() for all conditional classes
- Use semantic color tokens
- Specify transition durations
- Include prop types/interfaces
- Add inline comments for AI guidance

### ❌ Don't
- Create local components
- Use template literals in className
- Use hardcoded Tailwind colors
- Use inline styles
- Skip transition durations
- Mix patterns inconsistently

---

## Migration Path

### Phase 1: Infrastructure (Week 1)
- [x] Create TEMPLATE_INDEX.md
- [x] Create enforcement rules
- [ ] Create folder structure
- [ ] Add README files

### Phase 2: Templates (Week 2)
- [ ] Marketing templates (3)
- [ ] Dashboard templates (3)
- [ ] Auth templates (2)
- [ ] Pattern templates (5)

### Phase 3: Enforcement (Week 3)
- [ ] ESLint rules
- [ ] Pre-commit hooks
- [ ] VSCode snippets
- [ ] Test suite

### Phase 4: Adoption (Week 4)
- [ ] Documentation
- [ ] Team training
- [ ] Migrate existing pages
- [ ] Measure success metrics

---

## Success Metrics

### Target Improvements
| Metric              | Before      | After     |
| ------------------- | ----------- | --------- |
| Apps Grade          | B+ (83%)    | A (95%+)  |
| Template Literals   | 6+ per app  | 0         |
| Hardcoded Colors    | 12+ per app | 0         |
| Time to Create Page | 2-4 hours   | 15-30 min |
| Developer Questions | Frequent    | Rare      |

---

## References

- **AI Training**: `TEMPLATE_INDEX.md`
- **Strategy**: `DESIGN_SYSTEM_ENFORCEMENT_STRATEGY.md`
- **Design System**: `packages/design-system/README.md`
- **Enforcement Rule**: `.cursor/rules/template-enforcement.always.mdc`
- **Design System Lock**: `.cursor/rules/design-system.delta.mdc`
