# Why `verbatimModuleSyntax` is Critical for tsup

> **Source:** [TypeScript Official Documentation - verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)

---

## 🎯 **The Problem `verbatimModuleSyntax` Solves**

### **Background: TypeScript's Import Elision**

TypeScript has historically performed **import elision** - automatically removing imports that appear to only be used for types:

```typescript
// Before compilation
import { Car } from './car'
export function drive(car: Car) {
  return car
}

// After TypeScript compilation (import removed!)
export function drive(car) {
  return car
}
```

**This causes issues when:**
1. The import has side effects (e.g., registers a global, polyfills)
2. You're using a bundler that expects explicit `import type`
3. You're building libraries where import consistency matters

---

## 🔥 **Why This is CRITICAL for tsup**

### **1. tsup Uses esbuild for Bundling**

**Key Insight from [TypeScript Docs](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax):**

> "With `verbatimModuleSyntax`, what you write is what you get. When you write `import type`, it stays as `import type`. When you write `import`, it stays as `import`."

**tsup (via esbuild) does NOT understand TypeScript's type system:**
- esbuild is a JavaScript bundler that strips types via regex
- esbuild cannot determine if an import is type-only or value
- esbuild relies on explicit `import type` syntax

**Without `verbatimModuleSyntax`:**
```typescript
// Your code
import { Component } from 'react'  // Used only as type

// TypeScript compiles to (import removed!)
// (empty)

// esbuild bundles (sees nothing!)
// Result: Missing import in bundle! 💥
```

**With `verbatimModuleSyntax`:**
```typescript
// Your code (explicit)
import type { Component } from 'react'  // Type-only
import { useState } from 'react'        // Value

// TypeScript preserves exactly as written
import type { Component } from 'react'
import { useState } from 'react'

// esbuild can now correctly:
// - Strip `import type` (safe)
// - Bundle `import` (needed at runtime)
```

---

### **2. Prevents Runtime Errors in Built Packages**

**From [TypeScript Documentation](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax):**

> "`verbatimModuleSyntax` provides a more consistent and reliable way to handle imports and exports across different module systems and bundlers."

**Real-World Scenario:**

```typescript
// shadcn package code
import { ComponentProps } from 'react'  // Used only for type

interface ButtonProps extends ComponentProps<'button'> {
  variant: 'primary' | 'secondary'
}

export function Button(props: ButtonProps) {
  return <button {...props} />
}
```

**Without `verbatimModuleSyntax`:**
1. TypeScript removes `import { ComponentProps }` (type-only)
2. tsup/esbuild bundles the output
3. `.d.ts` still references `ComponentProps` but it's not in the bundle
4. **Runtime error when consumers use the library! 💥**

**With `verbatimModuleSyntax`:**
1. You MUST write `import type { ComponentProps }`
2. TypeScript keeps it as `import type`
3. tsup/esbuild correctly strips it
4. `.d.ts` is correctly generated
5. **No runtime errors! ✅**

---

### **3. Enforces Best Practices**

**From [TypeScript Docs](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax):**

> "This option enforces you to use explicit `import type` and `export type`, making your intent clear to both the compiler and bundlers."

**Benefits for tsup:**

| Scenario | Without `verbatimModuleSyntax` | With `verbatimModuleSyntax` |
|----------|-------------------------------|----------------------------|
| **Type-only import** | `import { Type } from 'pkg'` (implicit, removed by TS) | `import type { Type } from 'pkg'` (explicit, stripped by esbuild) |
| **Value import** | `import { fn } from 'pkg'` (kept by TS) | `import { fn } from 'pkg'` (kept by esbuild) |
| **Mixed import** | `import { Type, fn } from 'pkg'` (confusing!) | `import { fn, type Type } from 'pkg'` (clear!) |
| **Bundle size** | Unpredictable (TS guesses) | Optimized (explicit control) |
| **Runtime errors** | Possible (import elision bugs) | Prevented (explicit intent) |

---

## 📋 **Official TypeScript Documentation on `verbatimModuleSyntax`**

### **What It Does:**

According to [TypeScript's official tsconfig reference](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax):

1. **Replaces both `importsNotUsedAsValues` and `preserveValueImports`**
   - Simpler mental model
   - More predictable behavior

2. **Enforces explicit `import type` syntax**
   - You must write `import type` for type-only imports
   - You cannot rely on TypeScript to guess

3. **Verbatim output** (what you write is what you get)
   - `import type { X }` → stays as `import type { X }`
   - `import { X }` → stays as `import { X }`
   - `export type { X }` → stays as `export type { X }`

4. **Prevents side-effect confusion**
   - All imports are preserved unless explicitly marked with `type`
   - Bundlers can safely remove `import type`

---

## 🔧 **Correct Configuration for tsup**

### **tsconfig.json (for tsup packages)**

```json
{
  "compilerOptions": {
    // ✅ CRITICAL for tsup/esbuild
    "verbatimModuleSyntax": true,
    
    // ✅ Required for bundlers
    "isolatedModules": true,
    
    // ✅ Module resolution
    "moduleResolution": "bundler",
    
    // ✅ Modern module system
    "module": "ESNext",
    
    // ✅ Generate .d.ts (tsup handles .js)
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationMap": true,
    
    // ✅ No emit (tsup/esbuild handles transpilation)
    "noEmit": false
  }
}
```

---

### **tsup.config.ts (shadcn package)**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  // Use esbuild for bundling
  format: ['esm'],
  target: 'esnext',
  
  // TypeScript generates .d.ts separately
  dts: true,
  
  // esbuild handles JSX transform (not TypeScript)
  esbuildOptions(options) {
    // React 19 automatic JSX runtime
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
})
```

---

## 🎯 **Why This Matters for Your Monorepo**

### **Your Current Setup:**

```typescript
// packages/design-system/shadcn/tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": ???,  // ⚠️ Need to check
    "isolatedModules": true,
    "moduleResolution": "bundler"
  }
}
```

### **What You Need:**

1. **Add `verbatimModuleSyntax: true` to shadcn tsconfig**
   - Ensures explicit `import type` syntax
   - Prevents import elision bugs
   - Makes tsup/esbuild bundling predictable

2. **Update code to use explicit `import type`**
   ```typescript
   // ❌ Before (ambiguous)
   import { ComponentProps } from 'react'
   
   // ✅ After (explicit)
   import type { ComponentProps } from 'react'
   import { useState } from 'react'  // Value import
   ```

3. **Verify tsup.config.ts uses esbuild for JSX**
   - Don't rely on TypeScript for JSX transform
   - Use esbuild's `jsx: 'automatic'`

---

## 📊 **Summary Table**

| Configuration | Purpose | Why Critical for tsup |
|--------------|---------|----------------------|
| `verbatimModuleSyntax: true` | Explicit import/export syntax | Prevents esbuild from bundling removed imports |
| `isolatedModules: true` | Each file is a module | Required for esbuild's file-by-file transpilation |
| `moduleResolution: "bundler"` | Modern module resolution | Matches esbuild's resolution strategy |
| `emitDeclarationOnly: true` | Only emit .d.ts | Let tsup/esbuild handle .js output |
| `jsx: "react-jsx"` in tsconfig | React 19 types | For type checking only |
| `jsx: "automatic"` in tsup | JSX transform | For actual bundling |

---

## 🔗 **Official References**

- [TypeScript: verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)
- [TypeScript: isolatedModules](https://www.typescriptlang.org/tsconfig/#isolatedModules)
- [TypeScript: moduleResolution](https://www.typescriptlang.org/tsconfig/#moduleResolution)
- [tsup Documentation](https://tsup.egoist.dev/)
- [esbuild: Transform API](https://esbuild.github.io/api/#transform)

---

## ✅ **Action Items**

1. **Verify `verbatimModuleSyntax: true` in all tsup packages**
2. **Update import statements to use `import type` where appropriate**
3. **Ensure tsup.config.ts uses esbuild for JSX (not TypeScript)**
4. **Test built packages to ensure no missing imports**

---

**End of Analysis**
