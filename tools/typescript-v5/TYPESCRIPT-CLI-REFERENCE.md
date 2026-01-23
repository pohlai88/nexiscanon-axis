# TypeScript CLI Reference & React 19 Integration

> **Official TypeScript CLI documentation, compiler options, and React 19 type patterns**

---

## 📦 **TypeScript CLI Installation**

### **Local Installation (Recommended)**
```bash
# Using pnpm (our monorepo setup)
pnpm add -D typescript

# Verify version
npx tsc --version

# Initialize tsconfig.json
npx tsc --init
```

### **Global Installation (Not Recommended for Production)**
```bash
npm install -g typescript
tsc --version
```

**Why Local?**
- Version consistency across team
- Reproducible builds
- Works with monorepo catalog
- CI/CD compatibility

---

## 🔧 **TypeScript CLI Commands**

### **Core Commands**

| Command                | Description                         | Use Case           |
| ---------------------- | ----------------------------------- | ------------------ |
| `tsc`                  | Compile project using tsconfig.json | Production builds  |
| `tsc --noEmit`         | Type-check only (no output)         | CI/CD validation   |
| `tsc --watch`          | Watch mode (recompile on change)    | Development        |
| `tsc --init`           | Generate tsconfig.json              | Project setup      |
| `tsc --project <path>` | Use specific tsconfig               | Monorepo packages  |
| `tsc --build`          | Build project references            | Incremental builds |
| `tsc <file.ts>`        | Compile single file                 | Quick tests        |

---

### **Common Flags**

| Flag                    | Description              | Example             |
| ----------------------- | ------------------------ | ------------------- |
| `--target <version>`    | JS output version        | `--target ES2022`   |
| `--module <system>`     | Module system            | `--module ESNext`   |
| `--outDir <dir>`        | Output directory         | `--outDir dist`     |
| `--rootDir <dir>`       | Source root              | `--rootDir src`     |
| `--declaration`         | Generate .d.ts files     | Library packages    |
| `--declarationMap`      | Source maps for .d.ts    | Debugging types     |
| `--sourceMap`           | Generate source maps     | Debugging           |
| `--strict`              | Enable all strict checks | Quality enforcement |
| `--skipLibCheck`        | Skip .d.ts checking      | Faster builds       |
| `--emitDeclarationOnly` | Only .d.ts (no .js)      | Type-only packages  |

---

## 📋 **tsconfig.json Compiler Options Reference**

### **1. JSX Options (React)**

```json
{
  "compilerOptions": {
    // React 17+ (automatic JSX transform)
    "jsx": "react-jsx",        // Production mode
    "jsx": "react-jsxdev",     // Development mode (better errors)

    // Next.js (Next.js handles transform)
    "jsx": "preserve",

    // Legacy React 16 (not recommended)
    "jsx": "react"
  }
}
```

**React 19 Best Practice:**
- Use `"react-jsx"` for libraries
- Use `"preserve"` for Next.js apps
- Use `"react-jsxdev"` for development builds

---

### **2. Module Resolution (TypeScript 5+)**

```json
{
  "compilerOptions": {
    // Modern bundlers (Vite, esbuild, tsup, Next.js 13+)
    "moduleResolution": "bundler",

    // Node.js ESM
    "moduleResolution": "node16",
    "moduleResolution": "nodenext",

    // Legacy (avoid)
    "moduleResolution": "node"
  }
}
```

**When to use:**
- `bundler` → Vite, tsup, Next.js, Webpack 5+
- `node16` / `nodenext` → Node.js ESM packages
- `node` → Legacy projects only

---

### **3. Strict Mode Options**

```json
{
  "compilerOptions": {
    // Enable all strict checks (recommended)
    "strict": true,

    // Individual strict options (enabled by strict: true)
    "strictNullChecks": true,        // null/undefined safety
    "strictFunctionTypes": true,     // Function param safety
    "strictBindCallApply": true,     // bind/call/apply safety
    "strictPropertyInitialization": true,  // Class property init
    "noImplicitAny": true,           // Require explicit types
    "noImplicitThis": true,          // Require this type
    "alwaysStrict": true,            // Emit "use strict"

    // Additional safety (not in strict)
    "noUnusedLocals": true,          // Catch unused variables
    "noUnusedParameters": true,      // Catch unused params
    "noFallthroughCasesInSwitch": true,  // Switch fallthrough
    "noUncheckedIndexedAccess": true,    // Array access safety
    "noImplicitReturns": true,       // All paths return
    "noUncheckedSideEffectImports": true  // TS 5.3+ side effects
  }
}
```

---

### **4. Module System**

```json
{
  "compilerOptions": {
    // Modern (recommended)
    "module": "ESNext",           // Latest ES modules
    "module": "ES2022",           // ES2022 modules

    // Node.js
    "module": "NodeNext",         // Node.js ESM
    "module": "Node16",           // Node.js 16+ ESM
    "module": "CommonJS",         // Legacy require()

    // For bundlers
    "module": "ESNext"            // Let bundler handle
  }
}
```

---

### **5. TypeScript 5+ Features**

```json
{
  "compilerOptions": {
    // Explicit import/export syntax
    "verbatimModuleSyntax": true,  // TS 5.0+

    // Allow importing .ts extensions
    "allowImportingTsExtensions": true,  // TS 5.0+ (with noEmit)

    // Module detection
    "moduleDetection": "force",    // Treat all as modules

    // Erasable syntax only
    "erasableSyntaxOnly": true     // TS 5.5+ (experimental)
  }
}
```

**Best Practices:**
- Use `verbatimModuleSyntax: true` for clarity
- Use `allowImportingTsExtensions` only with `noEmit: true`
- Use `moduleDetection: "force"` to avoid global scope issues

---

### **6. Emit Options**

```json
{
  "compilerOptions": {
    // Output control
    "noEmit": true,                // Type-check only (Next.js, Vite)
    "emitDeclarationOnly": true,   // Only .d.ts (with tsup)

    // Declaration files
    "declaration": true,           // Generate .d.ts
    "declarationMap": true,        // Source maps for .d.ts

    // Source maps
    "sourceMap": true,             // Generate .js.map
    "inlineSourceMap": false,      // Embed source map

    // Output directories
    "outDir": "./dist",            // Output directory
    "rootDir": "./src",            // Source root

    // Other emit options
    "removeComments": false,       // Keep comments in output
    "importHelpers": true,         // Use tslib for helpers
    "downlevelIteration": true     // Accurate iteration for older targets
  }
}
```

---

### **7. Target & Library**

```json
{
  "compilerOptions": {
    // Target JavaScript version
    "target": "ES2022",            // Modern browsers
    "target": "ES2020",            // Node.js 14+
    "target": "ESNext",            // Latest features

    // Library definitions
    "lib": ["ES2022", "DOM", "DOM.Iterable"],  // For web apps
    "lib": ["ES2022"],             // For Node.js packages

    // Types
    "types": ["vite/client"],      // For Vite
    "types": ["node"],             // For Node.js
    "types": []                    // Disable auto-inclusion
  }
}
```

---

### **8. Path Resolution**

```json
{
  "compilerOptions": {
    "baseUrl": ".",                // Base for path resolution
    "paths": {
      "@/*": ["./src/*"],          // @/components → ./src/components
      "@workspace/*": ["../../*"]   // Monorepo paths
    },
    "resolveJsonModule": true,     // Import JSON files
    "allowSyntheticDefaultImports": true,  // Allow default imports
    "esModuleInterop": true        // Better CommonJS interop
  }
}
```

---

### **9. Performance Options**

```json
{
  "compilerOptions": {
    "skipLibCheck": true,          // Skip .d.ts checking (faster)
    "incremental": true,           // Incremental compilation
    "tsBuildInfoFile": "./.tsbuildinfo",  // Incremental cache
    "composite": true              // For project references
  }
}
```

---

### **10. Special Options**

```json
{
  "compilerOptions": {
    // Misc
    "isolatedModules": true,       // Required for tsup/esbuild
    "allowJs": true,               // Allow .js files
    "checkJs": true,               // Type-check .js files
    "forceConsistentCasingInFileNames": true,  // Case sensitivity
    "preserveSymlinks": true       // Symlink handling (pnpm)
  }
}
```

---

## 🎯 **Recommended Configurations by Use Case**

### **1. Next.js App (React 19)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,

    "noEmit": true,
    "incremental": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    "plugins": [
      { "name": "next" }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

### **2. Library Package (tsup + React 19)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "emitDeclarationOnly": true,

    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

**Note:** Use `emitDeclarationOnly: true` because tsup handles .js output

---

### **3. Vite App (React 19)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client"],

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,

    "noEmit": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### **4. Node.js Package (ESM)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "nodenext",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🔥 **React 19 Type Patterns**

### **1. Function Components (No More forwardRef)**

```typescript
import type { ReactNode, Ref } from 'react'

// ✅ React 19 - ref as prop
interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  ref?: Ref<HTMLButtonElement>
}

function Button({ children, onClick, ref }: ButtonProps) {
  return (
    <button ref={ref} onClick={onClick}>
      {children}
    </button>
  )
}

// ❌ React 18 - forwardRef (still works but not needed)
import { forwardRef } from 'react'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick }, ref) => (
    <button ref={ref} onClick={onClick}>
      {children}
    </button>
  )
)
```

---

### **2. Extending HTML Element Props**

```typescript
import type { ComponentProps } from 'react'

// Extend native button props
interface CustomButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

function CustomButton({ variant = 'primary', loading, ...props }: CustomButtonProps) {
  return <button {...props} disabled={loading || props.disabled} />
}

// Extend native input props
interface CustomInputProps extends ComponentProps<'input'> {
  label: string
  error?: string
}

function CustomInput({ label, error, ...props }: CustomInputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  )
}
```

---

### **3. Event Handler Types**

```typescript
import type {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  FocusEvent
} from 'react'

function MyComponent() {
  // Button click
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.value)
  }

  // Input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }

  // Form submit
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // ...
  }

  // Keyboard
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // ...
    }
  }

  // Focus
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      />
      <button onClick={handleClick}>Submit</button>
    </form>
  )
}
```

---

### **4. Children Types**

```typescript
import type { ReactNode, ReactElement } from 'react'

// Any valid React child
interface Props1 {
  children: ReactNode
}

// Only React elements
interface Props2 {
  children: ReactElement
}

// Specific element type
interface Props3 {
  children: ReactElement<{ id: string }>
}

// Function as children (render prop)
interface Props4 {
  children: (data: string) => ReactNode
}

// Multiple children of specific type
interface Props5 {
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[]
}
```

---

### **5. Style Types**

```typescript
import type { CSSProperties } from 'react'

interface StyledProps {
  style?: CSSProperties
  className?: string
}

function StyledDiv({ style, className }: StyledProps) {
  return (
    <div
      style={style}
      className={className}
    />
  )
}

// Usage
<StyledDiv
  style={{ backgroundColor: 'red', padding: '1rem' }}
  className="container"
/>
```

---

### **6. React 19 Hooks**

```typescript
import { useActionState, useFormStatus, useOptimistic } from 'react'

// useActionState (replaces useFormState)
function MyForm() {
  const [state, formAction] = useActionState<
    { message: string },
    FormData
  >(
    async (previousState, formData) => {
      const name = formData.get('name')
      return { message: `Hello ${name}` }
    },
    { message: '' }
  )

  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit">Submit</button>
      <p>{state.message}</p>
    </form>
  )
}

// useFormStatus
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}

// useOptimistic
function TodoList({ todos }: { todos: string[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: string) => [...state, newTodo]
  )

  return (
    <ul>
      {optimisticTodos.map((todo, i) => (
        <li key={i}>{todo}</li>
      ))}
    </ul>
  )
}
```

---

### **7. Context Types**

```typescript
import { createContext, useContext, type ReactNode } from 'react'

// Define context type
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// Create context with default value
const ThemeContext = createContext<ThemeContextType | null>(null)

// Provider
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook with null check
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

---

## 🔗 **Official References**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [React TypeScript](https://react.dev/learn/typescript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react)

---

## 📦 **Monorepo Package Scripts**

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "build": "tsup",
    "build:types": "tsc --emitDeclarationOnly",
    "clean": "rimraf dist .tsbuildinfo"
  }
}
```

---

**End of TypeScript CLI Reference**
