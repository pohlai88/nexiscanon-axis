# TypeScript 5 + React 19 Quick Reference

> Quick reference for breaking changes and configuration

---

## 🔴 React 19 Breaking Changes

### **1. JSX Transform**
```json
// tsconfig.json
{ "jsx": "react-jsx" }  // ✅ No more React imports needed
```

```typescript
// ✅ Works in React 19
export function Component() {
  return <div>Hello</div>  // No React import needed!
}
```

---

### **2. Ref as Prop**
```typescript
// ❌ React 18
const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {})

// ✅ React 19
interface Props {
  ref?: React.Ref<HTMLButtonElement>
}
function Button({ ref, ...props }: Props) {}
```

---

### **3. New Hooks**
```typescript
import { useActionState, useFormStatus, useOptimistic } from 'react'

// ✅ All typed in @types/react@19.2.2
const [state, action] = useActionState(fn, initial)
const { pending } = useFormStatus()
const [optimistic, add] = useOptimistic(state, fn)
```

---

## 🔴 TypeScript 5 Breaking Changes

### **1. Module Resolution**
```json
{
  "moduleResolution": "bundler"  // ✅ For Next.js/Vite
}
```

---

### **2. Verbatim Module Syntax**
```json
{
  "verbatimModuleSyntax": true  // ✅ Explicit imports
}
```

```typescript
// ✅ Type-only imports must be explicit
import type { MyType } from './types'
import { MyValue, type MyOtherType } from './module'
```

---

### **3. Target & Lib**
```json
{
  "target": "ES2022",
  "lib": ["ES2023", "DOM", "DOM.Iterable"]
}
```

---

## ⚙️ Quick Config Templates

### **Root Config**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

### **Next.js Config**
```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2023"],
    "jsx": "preserve",  // Next.js handles transform
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}
```

---

### **Node.js CLI Config**
```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2023"],  // No DOM
    "outDir": "./dist",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

---

## 🧪 Testing Commands

```bash
# Root type check
tsc --noEmit

# All packages
turbo typecheck

# Specific package
turbo typecheck --filter=shadcn
```

---

## 🚨 Common Fixes

### **Type-only imports:**
```typescript
// ❌ Error with verbatimModuleSyntax
import { MyType } from './types'

// ✅ Fix
import type { MyType } from './types'
```

---

### **JSX without React import:**
```typescript
// ❌ React 18 - Required
import React from 'react'

// ✅ React 19 - Not needed
// (if jsx: "react-jsx" in tsconfig)
```

---

### **forwardRef pattern:**
```typescript
// ❌ Old pattern (still works)
const Comp = forwardRef((props, ref) => {})

// ✅ New pattern (simpler)
function Comp({ ref, ...props }) {}
```

---

## 📦 Current Versions

- TypeScript: `5.9.3` ✅
- React: `19.2.3` ✅
- @types/react: `19.2.2` ✅
- Next.js: `16.1.4` ✅

---

## 📚 Full Docs

See [README.md](./README.md) for complete documentation.
