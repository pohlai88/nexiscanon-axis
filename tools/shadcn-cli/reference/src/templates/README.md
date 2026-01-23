# Template Registry

Pre-built page templates using `@workspace/design-system` correctly.

**Copy/paste into your app - guaranteed to work!**

---

## Available Templates

### Marketing (`marketing/`)

- **landing-page-01.tsx** - Hero + Features + CTA + Footer
- **pricing-page-01.tsx** - Pricing tiers with feature comparison
- **features-page-01.tsx** - Feature showcase with icons

### Dashboard (`dashboard/`)

- **dashboard-home-01.tsx** - Stats cards + charts + activity
- **dashboard-02.tsx** - Shadcn dashboard-01 inspired (sidebar, charts, data table)
- **settings-page-01.tsx** - Tabbed settings interface
- **users-table-01.tsx** - Data table with sorting/filtering

### Tasks (`tasks/`)

- **tasks-page-01.tsx** - Task management with filters, status, and assignees

### Auth (`auth/`)

- **login-page-01.tsx** - Login form with social auth
- **login-page-03.tsx** - Shadcn login-03 inspired (muted background, centered card)
- **login-page-04.tsx** - Shadcn login-04 inspired (split layout with image)
- **signup-page-01.tsx** - Multi-step signup flow

---

## Usage

### Copy Template Directly

```bash
cp apps/_shared-ui/src/templates/marketing/landing-page-01.tsx \
   apps/web/app/page.tsx
```

### Or Ask AI

```
"Create a landing page using the template system"
```

AI will automatically read the template patterns and generate correct code.

---

## Template Rules

All templates follow these rules:

1. **Import from workspace packages only**

   ```tsx
   import { Button } from '@workspace/design-system';
   import { HeroSection01 } from '@workspace/design-system/blocks';
   ```

2. **Use cn() for conditional classes**

   ```tsx
   className={cn("base", condition && "conditional")}
   ```

3. **Use semantic color tokens**

   ```tsx
   'bg-primary text-primary-foreground';
   ```

4. **Specify transition durations**
   ```tsx
   'transition-all duration-300';
   ```

---

## Customization

Templates are starting points. Customize by:

1. Changing props on blocks
2. Adding/removing sections
3. Adjusting layout spacing
4. Modifying color schemes (using semantic tokens)

All customizations must follow the same rules.

---

## References

- **AI Training**: `../_template-registry/TEMPLATE_INDEX.md`
- **Architecture**: `../_template-registry/TEMPLATE_REGISTRY_ARCHITECTURE.md`
- **Design System**: `../../../packages/design-system/README.md`
