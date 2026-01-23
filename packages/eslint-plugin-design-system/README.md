# eslint-plugin-design-system

Custom ESLint plugin for AXIS Design System enforcement.

## Overview

This plugin enforces design system consistency rules across the NexusCanon AXIS monorepo:

- **`no-hardcoded-colors`** - Use semantic tokens instead of hardcoded Tailwind colors
- **`no-template-literals-in-classname`** - Use `cn()` utility for className merging

## Installation

This package is part of the NexusCanon AXIS monorepo and uses workspace protocol:

```json
{
  "devDependencies": {
    "eslint-plugin-design-system": "workspace:*"
  }
}
```

## Configuration

Add to your `.eslintrc.json`:

```json
{
  "plugins": ["design-system"],
  "rules": {
    "design-system/no-hardcoded-colors": "error",
    "design-system/no-template-literals-in-classname": "error"
  }
}
```

Or use the recommended config:

```json
{
  "extends": ["plugin:design-system/recommended"]
}
```

## Rules

### `no-hardcoded-colors`

Disallow hardcoded Tailwind color classes. Use semantic tokens instead.

```tsx
// ❌ Bad
<div className="bg-blue-500 text-white" />
<div className="border-gray-200" />

// ✅ Good
<div className="bg-primary text-primary-foreground" />
<div className="border" />
```

**Semantic tokens available:**
- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `border`, `input`, `ring`
- `card` / `card-foreground`
- `popover` / `popover-foreground`

### `no-template-literals-in-classname`

Enforce `cn()` utility for className merging instead of template literals.

```tsx
// ❌ Bad
<div className={`base ${active ? 'active' : ''}`} />
<div className={"base " + (active ? "active" : "")} />

// ✅ Good
<div className={cn("base", active && "active")} />
<div className={cn("base", { active })} />
```

**Why `cn()`?**
- Proper conflict resolution (last class wins)
- Cleaner conditional logic
- Works with `tailwind-merge` for intelligent class deduplication

## Integration with AXIS Design System

This plugin is part of the [E04-CONSISTENCY-STRATEGY](../../.cursor/ERP/E04-CONSISTENCY-STRATEGY.md) enforcement stack:

1. **Layer 1:** Design Tokens (Tailwind v4)
2. **Layer 2:** Utility Classes (Tailwind CLI)
3. **Layer 3:** Component Primitives (Shadcn MCP)
4. **Layer 4:** Type Safety (TypeScript)
5. **Layer 5:** Code Quality (ESLint + Prettier) ← **This plugin**
6. **Layer 6:** Pre-commit Validation (Husky)
7. **Layer 7:** AXIS Registry

## License

MIT
