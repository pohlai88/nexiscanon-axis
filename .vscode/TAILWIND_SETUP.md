# Tailwind CSS IntelliSense Setup

## ✅ Configuration Complete

Your workspace is configured for **Tailwind CSS v4** with full IntelliSense support across the monorepo.

---

## 🎯 What's Configured

### 1. **Extension** (Already Installed)
- `bradlc.vscode-tailwindcss` - Tailwind CSS IntelliSense

### 2. **Workspace Settings** (`.vscode/settings.json`)

```jsonc
{
  // Tailwind CSS v4 Configuration
  "tailwindCSS.experimental.configFile": {
    "apps/docs/**/*": "packages/design-system/src/styles/globals.css",
    "apps/web/**/*": "packages/design-system/src/styles/globals.css",
    "apps/_shared-ui/**/*": "packages/design-system/src/styles/globals.css",
    "packages/design-system/**/*": "packages/design-system/src/styles/globals.css"
  },
  
  // Support for class-variance-authority (cva) and cn()
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  
  // TypeScript/React support
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  
  // Recognize className and class
  "tailwindCSS.classAttributes": [
    "class",
    "className",
    "classList",
    "ngClass"
  ]
}
```

---

## 🚀 Features Enabled

### ✅ **Autocomplete**
Type `className="` and get Tailwind class suggestions with color previews.

```tsx
<div className="bg-primary text-foreground p-4 rounded-lg">
  {/* IntelliSense works here ↑ */}
</div>
```

### ✅ **Class Variance Authority (CVA) Support**
IntelliSense inside `cva()` functions:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center", // ← IntelliSense works
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground", // ← IntelliSense works
      }
    }
  }
)
```

### ✅ **cn() Utility Support**
IntelliSense inside `cn()` calls:

```typescript
className={cn("flex items-center gap-2", className)}
// IntelliSense works for both arguments ↑
```

### ✅ **Color Previews**
Hover over color classes to see the actual color:
- `bg-primary` → Shows color swatch
- `text-destructive` → Shows color swatch
- Custom theme colors from `globals.css`

### ✅ **CSS Variable Support**
Your custom CSS variables are recognized:

```css
/* From globals.css */
--color-primary: var(--primary);
--color-foreground: var(--foreground);
```

```tsx
<div className="bg-primary text-foreground">
  {/* IntelliSense knows these colors exist */}
</div>
```

---

## 📂 Monorepo Structure

```
NexusCanon-AXIS/
├── packages/
│   ├── design-system/
│   │   └── src/
│   │       └── styles/
│   │           └── globals.css         ← Main Tailwind config
│   └── tailwind-config/
│       └── shared-styles.css           ← Base import
└── apps/
    ├── docs/                           ← IntelliSense enabled
    ├── web/                            ← IntelliSense enabled
    └── _shared-ui/                     ← IntelliSense enabled
```

---

## 🎨 Theme Support

Your setup includes custom themes with full IntelliSense support:

### **Available Themes**
- `neutral` (default)
- `gray`
- `stone`
- `zinc`
- `slate`
- `midnight`
- `opulence`
- `heirloom`
- `zenith`

### **Theme Colors (All Autocomplete)**
```tsx
// Background colors
bg-background, bg-foreground, bg-card, bg-popover

// Semantic colors
bg-primary, bg-secondary, bg-muted, bg-accent, bg-destructive

// Text colors
text-foreground, text-muted-foreground, text-primary-foreground

// Border colors
border-border, border-input, border-ring

// Sidebar colors
bg-sidebar, text-sidebar-foreground, bg-sidebar-primary
```

---

## 🔧 Troubleshooting

### IntelliSense Not Working?

**1. Restart Tailwind IntelliSense**
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type: `Tailwind CSS: Restart IntelliSense`
- Press Enter

**2. Check Extension Installed**
- Press `Ctrl+Shift+X` (Windows) or `Cmd+Shift+X` (Mac)
- Search: `Tailwind CSS IntelliSense`
- Verify it's installed and enabled

**3. Reload Window**
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type: `Developer: Reload Window`
- Press Enter

**4. Check Output Panel**
- Press `Ctrl+Shift+U` (Windows) or `Cmd+Shift+U` (Mac)
- Select "Tailwind CSS IntelliSense" from dropdown
- Look for errors

### Common Issues

#### ❌ "Cannot find Tailwind CSS configuration"
**Solution:** Ensure `globals.css` exists at:
```
packages/design-system/src/styles/globals.css
```

#### ❌ "IntelliSense not working in `cva()`"
**Solution:** Already configured! Verify settings in `.vscode/settings.json`

#### ❌ "Custom colors not showing"
**Solution:** Custom CSS variables in `@theme inline` block are supported. Check `globals.css` line 785+.

---

## 📝 Usage Examples

### **Server Component (Button)**
```tsx
// packages/design-system/src/components/button.tsx
import { cn } from "../lib/utils"

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-md border border-transparent",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/80",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}
```

### **Client Component (Theme Switcher)**
```tsx
// packages/design-system/src/components/theme-switcher.tsx
'use client'

export function ThemeSwitcher() {
  return (
    <div className="flex items-center gap-3">
      <select className="h-9 rounded-md border border-input bg-background px-3">
        {/* IntelliSense works for all classes above ↑ */}
      </select>
    </div>
  )
}
```

### **Using CVA (Variants)**
```tsx
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-lg border shadow-sm", // ← IntelliSense
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground", // ← IntelliSense
        outlined: "border-border bg-background", // ← IntelliSense
      }
    }
  }
)
```

---

## 🎯 Best Practices

### ✅ **Use Design Tokens**
```tsx
// ✅ GOOD: Use semantic colors
<div className="bg-primary text-primary-foreground">

// ❌ AVOID: Hardcoded colors
<div className="bg-blue-500 text-white">
```

### ✅ **Use cn() for Conditional Classes**
```tsx
import { cn } from "@workspace/design-system/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

### ✅ **Group Related Classes**
```tsx
<button className={cn(
  // Layout
  "inline-flex items-center justify-center",
  // Spacing
  "px-4 py-2 gap-2",
  // Borders & Radius
  "rounded-md border",
  // Colors
  "bg-primary text-primary-foreground",
  // States
  "hover:bg-primary/80 focus-visible:ring-2",
  // Transitions
  "transition-all duration-200"
)} />
```

---

## 📚 Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Tailwind IntelliSense Extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Class Variance Authority](https://cva.style/docs)
- [Tailwind Merge (cn utility)](https://github.com/dcastil/tailwind-merge)

---

## ✅ Verification Checklist

- [x] Tailwind CSS IntelliSense extension installed
- [x] Workspace settings configured
- [x] `globals.css` exists with Tailwind v4 config
- [x] CVA support enabled
- [x] cn() utility support enabled
- [x] Custom theme colors defined
- [x] TypeScript/React support enabled

**Status:** ✅ **FULLY CONFIGURED**

---

## 🔄 Quick Reference

| Feature | Keyboard Shortcut |
|---------|------------------|
| Restart IntelliSense | `Ctrl+Shift+P` → "Tailwind CSS: Restart" |
| Show Tailwind Output | `Ctrl+Shift+U` → Select "Tailwind CSS" |
| Reload Window | `Ctrl+Shift+P` → "Reload Window" |
| Command Palette | `Ctrl+Shift+P` (Win) / `Cmd+Shift+P` (Mac) |

---

**Last Updated:** 2026-01-21  
**Tailwind Version:** v4.1.5  
**Next.js Version:** 16.1.0  
**React Version:** 19.2.0
