# Next.js Best Practices: Routing, API, E2E

This guide covers **routing**, **Route Handlers (API)**, **Server Actions**, **middleware**, and **end-to-end testing** with Next.js as the main framework. The `apps/web` app in this repo implements these patterns.

---

## 1. Routing (App Router)

### File conventions

| File            | Purpose                                                                 |
|-----------------|-------------------------------------------------------------------------|
| `page.tsx`      | UI for a route. Required for a URL to be reachable.                     |
| `layout.tsx`    | Shared UI; wraps `page` and nested layouts. Root layout needs `<html>`, `<body>`. |
| `loading.tsx`   | Suspense fallback while the segment loads (streaming).                  |
| `error.tsx`     | Error boundary for the segment. Must be a Client Component (`'use client'`). |
| `not-found.tsx` | Shown when `notFound()` is called or the URL does not match any route.  |
| `global-error.tsx` | Replaces the root layout when an error occurs. Must define its own `<html>`, `<body>`. |

### Params and searchParams (async in Next 15+)

- `params` and `searchParams` are **Promises** in pages and Route Handlers.

```ts
// app/blog/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

- Use `searchParams` when the **page** needs query params to **load data**; use `useSearchParams` when they only affect **client-side** behavior.

### Dynamic routes

- `[slug]` – single segment.
- `[...slug]` – catch-all.
- `[[...slug]]` – optional catch-all.

Call `notFound()` when the resource does not exist (e.g. after a DB lookup).

### Linking

- Prefer `<Link href="...">` for in-app navigation (prefetch, client-side transitions).
- Use `useRouter()` for programmatic navigation.

### Route groups (no URL segment)

- `(marketing)` / `(dashboard)` – group routes without changing the URL.

### Example structure in `apps/web`

```
app/
├── layout.tsx       # root
├── page.tsx         # /
├── loading.tsx
├── error.tsx
├── not-found.tsx
├── global-error.tsx
├── demo/
│   └── page.tsx     # /demo
├── blog/
│   └── [slug]/
│       └── page.tsx # /blog/:slug
└── api/
    └── ...
```

---

## 2. API: Route Handlers (`route.ts`)

Use **Route Handlers** for:

- REST-style endpoints
- Webhooks
- Non-UI responses (e.g. JSON, XML, file)

### HTTP methods

Export: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

### Patterns

- **`request`**: `NextRequest`; use `request.json()`, `request.formData()`, `request.nextUrl.searchParams`.
- **`params`**: `Promise<{ ... }>` in dynamic routes.
- **Response**: `Response.json()`, `NextResponse.json()`, or `new Response()`.
- **Errors**: return appropriate status (400, 401, 404, 500) and a consistent JSON shape.

### Examples in `apps/web`

| Route              | Method | Purpose                          |
|--------------------|--------|----------------------------------|
| `/api/health`      | GET    | Liveness/readiness, monitoring   |
| `/api/echo`        | POST   | JSON body, validation, 400       |
| `/api/users/[id]`  | GET    | Dynamic segment, `params` async  |

### When to use Route Handlers vs Server Actions

- **Route Handlers**: external clients, webhooks, third‑party callbacks, non‑form APIs.
- **Server Actions**: form `action`, mutations that need `revalidatePath` / `redirect`, or to be called from event handlers in Client Components.

---

## 3. Server Actions

- **Directive**: `'use server'` at top of file or at top of an async function.
- **Use for**: form submissions, mutations, then `revalidatePath`, `revalidateTag`, or `redirect`.

### Forms

```tsx
// Server Component
<form action={submitMessage}>
  <input name="message" />
  <button type="submit">Submit</button>
</form>
```

```ts
// app/actions.ts
'use server'
export async function submitMessage(formData: FormData) {
  const message = formData.get('message');
  // validate, persist…
  revalidatePath('/');
  return { success: true }; // or { error: '...' }
}
```

### From Client Components

- Import the Server Action from a `'use server'` file; use in `onClick`, `useEffect`, or pass as `action`/`formAction` to a form.

### After mutations

- `revalidatePath('/path')` or `revalidateTag('tag')` to refresh data.
- `redirect('/path')` to send the user elsewhere (it throws; nothing runs after).
- `refresh()` from `next/cache` to refresh the client router when you don’t need path/tag revalidation.

### Example in `apps/web`

- `app/actions.ts`: `submitMessage`, `goToBlog` (redirect).
- `app/demo/page.tsx`: form using `submitMessage`.

---

## 4. Proxy (formerly Middleware)

- **Role**: run logic **before** the request hits the route (auth, redirects, headers).
- **Next 16**: use **Proxy** (`proxy.ts`, `export function proxy`). The old `middleware.ts` convention is deprecated. Migrate with: `npx @next/codemod@canary middleware-to-proxy .`

### Matcher

- Restrict with `config.matcher` so it does **not** run on `_next/static`, `_next/image`, `api`, or static assets.

```ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### Typical uses

- Auth: redirect unauthenticated users to `/login`.
- Redirects/rewrites by path or header.
- Adding `x-request-id`, `x-pathname`, etc. to the response.

### Example in `apps/web`

- `proxy.ts`: sets `x-request-id`, uses a matcher to skip API and static files.

---

## 5. End-to-end testing (Playwright)

### Setup in `apps/web`

- **Config**: `playwright.config.ts` – `baseURL`, `webServer` (dev or `build`+`start` in CI), `projects` for Chromium/Firefox/WebKit.
- **Tests**: `e2e/*.spec.ts`.

### Commands

```bash
# from repo root
pnpm run test:e2e --filter=web

# or from apps/web
pnpm run test:e2e
pnpm run test:e2e:ui
```

### Practices

- **webServer**: use `pnpm run dev` locally; in CI use `pnpm run build && pnpm run start` against a production build.
- Use **role-, label-, or text-based** selectors; avoid fragile class-based ones.
- For **API**: use `request.get/post` from Playwright for `/api/health`, `/api/echo`, etc.
- For **Server Actions**: wait for navigation or for UI changes (e.g. `expect(...).toContainText`); avoid `page.waitForTimeout`.
- Reuse **storageState** for logged-in flows; clean state between tests when needed.

### Example tests in `apps/web`

- `e2e/smoke.spec.ts`: home page, not-found for unknown URL.
- `e2e/api.spec.ts`: `GET /api/health`, `POST /api/echo` (success and 400).

---

## 6. Checklist

- [ ] `loading.tsx` (and/or `<Suspense>`) for slow segments.
- [ ] `error.tsx` with `reset()`; `global-error.tsx` if you need a root-level fallback.
- [ ] `not-found.tsx` and `notFound()` where a resource is missing.
- [ ] Route Handlers: correct status codes, JSON error shape, `params` as `Promise` in dynamic routes.
- [ ] Server Actions for forms and mutations; `revalidatePath` / `redirect` where needed.
- [ ] Middleware/Proxy: narrow `matcher`, avoid running on `api` and static assets.
- [ ] E2E: Playwright with `webServer`, smoke + API tests; CI runs against a production build.

---

## Refactoring and upgrades

For project refactoring, version upgrades, and codemods, see [nextjs-refactoring-best-practices.md](nextjs-refactoring-best-practices.md).

---

## References

- [App Router – Layouts and Pages](https://nextjs.org/docs/app/building-your-application/routing)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Middleware / Proxy](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Error Handling](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Not Found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Playwright and Next.js](https://playwright.dev/docs/intro)
