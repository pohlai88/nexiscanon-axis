# App Components

> **Location:** `apps/web/src/components/`

This folder contains **app-specific components** for the web application.

---

## 3-Step Component Rules

### Step 1: Source from `@workspace/design-system` FIRST

Before creating any component, check if it exists in the design system:

```tsx
// ✅ CORRECT - Import from design system
import { Button, Card, Dialog } from "@workspace/design-system";
import { HeroSection01 } from "@workspace/design-system/blocks";
import { cn } from "@workspace/design-system/lib/utils";

// ❌ FORBIDDEN - Do not create local UI primitives
// components/button.tsx  ← NO
// components/card.tsx    ← NO
// components/dialog.tsx  ← NO
```

**Design system provides:**
- All shadcn/ui primitives (Button, Card, Dialog, etc.)
- Blocks (HeroSection, Dashboard layouts, etc.)
- Effects (animations, Magic UI components)
- Hooks (useMediaQuery, useDebounce, etc.)
- Utilities (`cn()`, formatters)

### Step 2: App-Level Components Stay Here

Components that are **specific to this app's domain** belong here:

| Allowed | Examples |
|---------|----------|
| Provider composition | `providers.tsx` - combines ThemeProvider + FeatureFlags + Notifications |
| Domain-specific UI | `workspace-switcher.tsx` - tenant switching logic |
| App navigation | `sidebar-nav.tsx` - app-specific nav structure |
| Feature components | `notification-bell.tsx`, `activity-feed.tsx` |

### Step 3: No UI/UX at App Root Level

The `apps/` folder structure must remain **infrastructure-focused**:

```
apps/web/
├── src/
│   ├── app/           # Routes (Next.js App Router)
│   ├── components/    # App-specific components (THIS FOLDER)
│   ├── hooks/         # App-specific hooks
│   └── lib/           # App-specific utilities
├── firewall/          # Deployment config (Vercel)
├── middleware.ts      # Edge middleware
├── next.config.ts     # Next.js config
└── package.json
```

**FORBIDDEN at app root:**
- `apps/web/components/ui/` ← Use design system
- `apps/web/db/` ← Use `packages/db`
- `apps/web/styles/` ← Use design system tokens

---

## Current Components

| Component | Purpose | Source |
|-----------|---------|--------|
| `providers.tsx` | Root provider composition | App-specific |
| `theme-provider.tsx` | Light/dark mode (wraps next-themes) | App-specific* |
| `notifications.tsx` | In-app notification system | App-specific |
| `notification-bell.tsx` | Notification UI trigger | App-specific |
| `sidebar-nav.tsx` | Navigation structure | App-specific |
| `mobile-sidebar.tsx` | Responsive sidebar | App-specific |
| `workspace-switcher.tsx` | Tenant/workspace switching | App-specific |
| `command-palette.tsx` | Cmd+K command palette | App-specific |
| `activity-feed.tsx` | Activity/audit display | App-specific |
| `bulk-actions.tsx` | Multi-select actions | App-specific |
| `hold-to-sign.tsx` | Signature confirmation | App-specific |
| `keyboard-shortcuts-help.tsx` | Shortcut reference | App-specific |
| `saved-views.tsx` | Saved filter/view management | App-specific |

*Note: `theme-provider.tsx` handles light/dark mode. The design system's `ThemeProvider` handles color palette themes (stone, zinc, etc.). These are complementary.

---

## Adding New Components

1. **Check design system first** - Does `@workspace/design-system` have it?
2. **Is it domain-specific?** - If yes, create here
3. **Is it reusable across apps?** - If yes, add to design system instead
4. **Use design system primitives** - Build on top of existing components

```tsx
// ✅ CORRECT - Compose from design system
import { Button, Dialog, DialogContent } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export function ConfirmDeleteDialog({ onConfirm }: Props) {
  return (
    <Dialog>
      <DialogContent>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## References

- `packages/design-system/README.md` - Component API
- `apps/_shared-ui/_template-registry/TEMPLATE_INDEX.md` - Template patterns
- `.cursor/rules/template-enforcement.always.mdc` - Enforcement rules
