# TypeScript 5 + React 19 Configuration with Babel & tsup

> **Status:** 🔄 Ready for Implementation
> **Tools:** TypeScript 5.9 + React 19 + Babel 7 + tsup 8
> **Based on:** Official React 19, TypeScript 5, and Babel documentation

---

## 📚 Navigation

- [Main Project README](../../README.md)
- [Migration Patterns](../eslintV9/PATTERNS.md)
- [Current tsconfig.json](../../tsconfig.json)
- [shadcn tsup.config.ts](../../packages/design-system/shadcn/tsup.config.ts)

---

## 🎯 Configuration Stack

### **Current Versions:**
- **TypeScript:** `5.9.3` ✅
- **React:** `19.2.3` ✅
- **@types/react:** `19.2.2` ✅
- **@babel/core:** `7.28.6` ✅
- **tsup:** `8.5.0` ✅

### **What We're Configuring:**

1. **tsup** - For building TypeScript packages (shadcn CLI)
2. **Babel** - For JSX transformation with React 19
3. **TypeScript** - For type checking with React 19 types
4. **Next.js** - For app compilation (tailwindV4)

---

## 🔴 React 19 Breaking Changes for Build Tools

### **1. Automatic JSX Runtime (Default)**

**React 19 Change:**
> "React 19 uses the automatic JSX runtime by default. You no longer need to import React."

**Impact on Babel:**
```javascript
// ❌ React 18 Babel config
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "classic"  // Requires React import
    }]
  ]
}

// ✅ React 19 Babel config
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "automatic"  // No React import needed
    }]
  ]
}
```

---

### **2. New JSX Transform**

**Babel Configuration for React 19:**
```javascript
// babel.config.js or .babelrc
{
  "presets": [
    ["@babel/preset-typescript", {
      "isTSX": true,
      "allExtensions": true
    }],
    ["@babel/preset-react", {
      "runtime": "automatic",  // ✅ React 19 automatic JSX
      "development": process.env.NODE_ENV === "development"
    }]
  ]
}
```

---

## ⚙️ Package Build Configurations

### **1. tsup Configuration (for shadcn CLI)**

**Current:** `packages/design-system/shadcn/tsup.config.ts`

```typescript
import { copyFileSync } from "fs"
import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,  // Generate .d.ts files
  entry: [
    "src/index.ts",
    "src/registry/index.ts",
    "src/schema/index.ts",
    "src/mcp/index.ts",
    "src/utils/index.ts",
    "src/icons/index.ts",
  ],
  format: ["esm"],  // ESM only
  sourcemap: true,
  minify: true,
  target: "esnext",  // ✅ Modern target for Node.js 18+
  outDir: "dist",
  treeshake: true,
  onSuccess: async () => {
    copyFileSync("src/tailwind.css", "dist/tailwind.css")
  },

  // ✅ ADD for React 19 JSX (if package uses JSX)
  esbuildOptions(options) {
    options.jsx = "automatic"  // React 19 automatic JSX
    options.jsxDev = process.env.NODE_ENV === "development"
  },
})
```

**Key Settings:**
- `format: ["esm"]` - ESM output for modern Node.js
- `target: "esnext"` - Modern JavaScript features
- `jsx: "automatic"` - React 19 JSX transform (if needed)
- `dts: true` - Generate TypeScript declarations

---

### **2. Babel Configuration (if needed)**

**Create:** `packages/design-system/shadcn/.babelrc` or `babel.config.js`

```json
{
  "presets": [
    ["@babel/preset-typescript", {
      "isTSX": true,
      "allExtensions": true,
      "onlyRemoveTypeImports": true
    }],
    ["@babel/preset-react", {
      "runtime": "automatic",
      "development": false,
      "importSource": "react"
    }]
  ],
  "env": {
    "development": {
      "presets": [
        ["@babel/preset-react", {
          "runtime": "automatic",
          "development": true
        }]
      ]
    }
  }
}
```

**Required Packages (already in catalog):**
- `@babel/core`: `^7.28.6` ✅
- `@babel/parser`: `^7.28.0` ✅
- `@babel/preset-react`: Need to add
- `@babel/preset-typescript`: Need to add

---

### **3. TypeScript Configuration**

#### **Root tsconfig.json:**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "NexusCanon AXIS - Base",
  "compilerOptions": {
    // Language & Environment
    "target": "ES2022",
    "lib": ["ES2023"],
    "jsx": "react-jsx",  // ✅ React 19 automatic JSX

    // Modules
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false,  // Allow emit for package building

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,  // ✅ Required for tsup/esbuild

    // Type Checking
    "strict": true,
    "skipLibCheck": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,

    // Paths (for workspace packages)
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "exclude": ["node_modules", "dist", ".next", "out", "build", "coverage"]
}
```

---

#### **shadcn Package tsconfig.json:**

**File:** `packages/design-system/shadcn/tsconfig.json`

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],  // No DOM for CLI
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,  // For project references
    "declaration": true,
    "declarationMap": true,
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "test"]
}
```

---

#### **tailwindV4 Package tsconfig.json:**

**File:** `packages/design-system/tailwindV4/tsconfig.json`

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2023"],
    "jsx": "preserve",  // ✅ Next.js handles JSX
    "moduleResolution": "bundler",
    "incremental": true,
    "noEmit": true,  // Next.js handles compilation
    "plugins": [
      {
        "name": "next"  // ✅ Next.js 16 TypeScript plugin
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

## 📦 Required Catalog Updates

### **Add to pnpm-workspace.yaml:**

```yaml
catalog:
  # Babel (for JSX transformation)
  '@babel/core': ^7.28.0
  '@babel/parser': ^7.28.0
  '@babel/preset-react': ^7.28.0      # ✅ ADD
  '@babel/preset-typescript': ^7.27.1  # ✅ ADD
  '@babel/plugin-transform-typescript': ^7.28.0  # ✅ ADD

  # Build tools
  tsup: ^8.5.0
```

---

## 🔧 Build Scripts

### **shadcn package.json scripts:**

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  }
}
```

---

### **tailwindV4 package.json scripts:**

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 🎯 Configuration Decision Tree

### **When to Use What:**

```
┌─────────────────────────────────────┐
│   What are you building?            │
└──────────┬──────────────────────────┘
           │
           ├─ Node.js CLI/Library
           │  └─ Use: tsup + TypeScript
           │     ├─ No JSX: tsup alone
           │     └─ With JSX: tsup + esbuild jsx: "automatic"
           │
           ├─ Next.js App
           │  └─ Use: Next.js built-in compiler
           │     ├─ TypeScript: built-in
           │     └─ JSX: handled by Next.js (SWC)
           │
           └─ React Library (publishable)
              └─ Use: tsup + Babel (optional)
                 └─ JSX: esbuild jsx: "automatic"
```

---

## ✅ Recommended Configuration

### **For shadcn (CLI package with JSX utilities):**

**1. Update tsup.config.ts:**
```typescript
export default defineConfig({
  // ... existing config
  esbuildOptions(options) {
    options.jsx = "automatic"  // ✅ React 19
    options.jsxImportSource = "react"
  },
})
```

**2. TypeScript config:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",  // ✅ For type checking
    "target": "ES2022",
    "moduleResolution": "bundler"
  }
}
```

**3. No Babel needed** - tsup/esbuild handles everything

---

### **For tailwindV4 (Next.js app):**

**1. TypeScript config:**
```json
{
  "compilerOptions": {
    "jsx": "preserve",  // ✅ Next.js compiles
    "plugins": [{ "name": "next" }]
  }
}
```

**2. No tsup needed** - Next.js has built-in compiler

**3. No Babel needed** - Next.js 16 uses SWC

---

## 🚨 Migration Steps

### **Step 1: Update Babel Packages in Catalog**

```yaml
# pnpm-workspace.yaml
catalog:
  '@babel/preset-react': ^7.28.0
  '@babel/preset-typescript': ^7.27.1
```

---

### **Step 2: Update tsup Config (if package uses JSX)**

```typescript
// packages/design-system/shadcn/tsup.config.ts
export default defineConfig({
  // ... existing
  esbuildOptions(options) {
    options.jsx = "automatic"  // React 19
  },
})
```

---

### **Step 3: Update TypeScript Configs**

**Root:**
```json
{
  "jsx": "react-jsx",
  "moduleResolution": "bundler",
  "isolatedModules": true
}
```

**Packages:** Extend root with specific needs

---

### **Step 4: Test Builds**

```bash
# Test shadcn build
turbo run build --filter=shadcn

# Test tailwindV4 build
turbo run build --filter=v4

# Test all
turbo run build
```

---

## 📚 References

- [tsup Documentation](https://tsup.egoist.dev/)
- [React 19 JSX Transform](https://react.dev/blog/2024/04/25/react-19#new-jsx-transform)
- [Babel preset-react](https://babeljs.io/docs/babel-preset-react)
- [TypeScript 5 Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [esbuild JSX](https://esbuild.github.io/content-types/#jsx)

---

## ✅ Success Criteria

- [ ] tsup builds shadcn package successfully
- [ ] JSX transformation works without React imports
- [ ] Type checking passes (`turbo typecheck`)
- [ ] Next.js app builds successfully
- [ ] No build errors or warnings

---

**Last Updated:** 2026-01-21
**Status:** 🔄 Ready for implementation
**Next Step:** Update Babel catalog + tsup config
