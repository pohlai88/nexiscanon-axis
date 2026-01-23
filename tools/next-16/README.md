# Next.js 15 → 16 Migration Guide

> **Status:** 🔄 In Progress
> **Package:** `packages/design-system/tailwindV4` (already on Next.js 16.1.4)
> **Breaking Changes:** Async Request APIs, Turbopack default, Cache Components

---

## 📋 **Current Status**

### **✅ Already Completed:**
- Next.js upgraded to `16.1.4` in tailwindV4 package
- React 19.2.3 compatible
- TypeScript 5.9.3 with `verbatimModuleSyntax: true`
- Turbopack enabled in dev mode (`--turbopack` flag)

### **🔄 Needs Migration:**
- Async Request APIs (`cookies`, `headers`, `params`, `searchParams`)
- Cache Components configuration
- Image configuration updates
- Middleware → Proxy rename (if applicable)

---

## 🚨 **Breaking Changes from Official Docs**

Source: [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

### **1. Async Request APIs** (CRITICAL)

**What Changed:**
- `cookies()`, `headers()`, `draftMode()` are now async
- `params` and `searchParams` in layouts/pages are now async
- Synchronous access removed

**Before (Next.js 15):**
```tsx
// ❌ Synchronous (no longer works in Next.js 16)
export default function Page({ params, searchParams }: PageProps) {
  const id = params.id
  const query = searchParams.q
  
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  
  return <div>ID: {id}</div>
}
```

**After (Next.js 16):**
```tsx
// ✅ Async (required in Next.js 16)
export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const id = params.id
  const query = searchParams.q
  
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  
  return <div>ID: {id}</div>
}
```

---

### **2. Turbopack is Default**

**What Changed:**
- Turbopack is now stable and default for `next dev` and `next build`
- Webpack-specific configs may break

**Current Status:**
```json
// tailwindV4/package.json
{
  "scripts": {
    "dev": "pnpm icons:dev & next dev --turbopack --port 4000"
  }
}
```

✅ **Already using Turbopack** - No action needed

---

### **3. Cache Components (replaces PPR)**

**What Changed:**
- `experimental.ppr` removed
- New `cacheComponents` flag
- Explicit `"use cache"` directive

**Configuration:**
```typescript
// next.config.mjs
export default {
  // ❌ Old (removed)
  experimental: {
    ppr: true
  },
  
  // ✅ New
  experimental: {
    cacheComponents: true
  }
}
```

**Usage:**
```tsx
// Mark component for caching
"use cache"

export async function UserProfile({ userId }: { userId: string }) {
  const user = await fetchUser(userId)
  return <div>{user.name}</div>
}
```

---

### **4. Image Configuration Updates**

**What Changed:**
- `minimumCacheTTL` default: 60s → 4 hours (14400s)
- `imageSizes` removes default `16`
- Local images with query strings require `localPatterns.search`

**Configuration:**
```typescript
// next.config.mjs
export default {
  images: {
    minimumCacheTTL: 60, // Restore old behavior if needed
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    localPatterns: [
      {
        pathname: '/assets/images/**',
        search: '' // Allow query strings
      }
    ]
  }
}
```

---

### **5. Minimum Versions**

| Requirement | Minimum Version |
|-------------|----------------|
| **Node.js** | 20.9.0+ |
| **TypeScript** | 5.1.0+ |
| **React** | 19.2.0+ |

**Current Status:**
```json
// pnpm-workspace.yaml catalog
{
  "node": "^20.x",  // ✅ Compatible
  "typescript": "^5.9.3",  // ✅ Compatible
  "react": "^19.2.3"  // ✅ Compatible
}
```

---

## 🔧 **Migration Steps**

### **Step 1: Find Synchronous API Usage**

Run codebase search for patterns:
```bash
# Find synchronous params/searchParams
grep -r "({ params" packages/design-system/tailwindV4/app

# Find synchronous cookies/headers
grep -r "cookies()" packages/design-system/tailwindV4/app
grep -r "headers()" packages/design-system/tailwindV4/app
```

---

### **Step 2: Update Async Request APIs**

**Pattern 1: Page Components**
```tsx
// Before
export default function Page({ params, searchParams }: PageProps) {
  // ...
}

// After
export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  // ...
}
```

**Pattern 2: Layout Components**
```tsx
// Before
export default function Layout({ params, children }: LayoutProps) {
  // ...
}

// After
export default async function Layout(props: LayoutProps) {
  const params = await props.params
  // ...
}
```

**Pattern 3: generateMetadata**
```tsx
// Before
export function generateMetadata({ params }: Props): Metadata {
  return { title: params.slug }
}

// After
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  return { title: params.slug }
}
```

**Pattern 4: Route Handlers**
```tsx
// Before
export async function GET(request: Request) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  // ...
}

// After
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  // ...
}
```

---

### **Step 3: Run Official Codemod**

Next.js provides an automatic codemod:

```bash
npx @next/codemod@canary upgrade latest
```

**What it does:**
- Converts synchronous params → async
- Updates cookies/headers calls
- Updates metadata functions
- Adds `await` where needed

---

### **Step 4: Update next.config.mjs**

Check if using experimental features:
```typescript
// packages/design-system/tailwindV4/next.config.mjs
import { createMDX } from 'fumadocs-mdx/config'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Add if using cache components
  experimental: {
    cacheComponents: true
  },
  
  // Image config (if needed)
  images: {
    minimumCacheTTL: 60, // Restore old behavior
  }
}

export default withMDX(nextConfig)
```

---

### **Step 5: Test**

```bash
# Type check
pnpm --filter=v4 typecheck

# Build
pnpm --filter=v4 build

# Dev mode
pnpm --filter=v4 dev
```

---

## 📚 **Documentation Files**

- **`README.md`** (this file) - Migration guide
- **`ASYNC-APIS.md`** - Detailed async API patterns
- **`DEFERRED.md`** - Known issues and deferred tasks

---

## 🔗 **Official References**

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Async Request APIs](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Cache Components](https://nextjs.org/docs/app/api-reference/next-config-js/cacheComponents)
- [Turbopack](https://nextjs.org/docs/architecture/turbopack)

---

**Next Steps:**
1. Search for synchronous API usage
2. Run codemod
3. Manual fixes for edge cases
4. Test build and dev mode
5. Document any issues in DEFERRED.md
