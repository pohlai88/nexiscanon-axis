# Next.js Best Practices: Project Refactoring

Follow these when refactoring, upgrading, or reorganizing a Next.js project. They are based on the [upgrade guides](https://nextjs.org/docs/app/guides/upgrading), [codemods](https://nextjs.org/docs/app/guides/upgrading/codemods), and [project structure](https://nextjs.org/docs/app/getting-started/project-structure) docs.

---

## 1. Use Codemods First

Codemods apply many changes across the codebase in a consistent way. Prefer them over manual edits where available.

### Upgrade (versions + related codemods)

```bash
npx @next/codemod upgrade [revision]
```

- `revision`: `patch` | `minor` | `major` | `latest` | `canary` | e.g. `16.0.0`
- Updates Next.js, React, React DOM and can run version-specific codemods (e.g. async APIs, middleware→proxy, `next lint`→ESLint).

**Options:** `--dry` (no writes), `--print` (show diff), `--verbose`.

### Run a single codemod

```bash
npx @next/codemod <transform> <path>
```

Examples:

| Transform                                  | Purpose                                                    |
| ------------------------------------------ | ---------------------------------------------------------- |
| `next-async-request-api`                   | `cookies()`, `headers()`, `params`, `searchParams` → async |
| `middleware-to-proxy`                      | `middleware.ts` → `proxy.ts`, `middleware` → `proxy`       |
| `remove-unstable-prefix`                   | `unstable_cacheTag` → `cacheTag`, etc.                     |
| `remove-experimental-ppr`                  | Remove `experimental_ppr` route segment config             |
| `next-lint-to-eslint-cli`                  | `next lint` → ESLint CLI + `eslint.config.mjs`             |
| `app-dir-runtime-config-experimental-edge` | `runtime: 'experimental-edge'` → `'edge'`                  |
| `metadata-to-viewport-export`              | Move `viewport` from `metadata` to `viewport` export       |
| `new-link`                                 | Remove `<a>` inside `<Link>`                               |
| `built-in-next-font`                       | `@next/font` → `next/font`                                 |

**Always:** `--dry` or `--print` first, then run without for real edits.

---

## 2. Pre-Refactor Checklist

- **Clean git** – Commit or stash. Codemods (especially `upgrade`) expect a clean working tree.
- **Lockfile** – `pnpm install` / `npm ci` so deps match.
- **Tests** – E2E and critical unit tests passing before and after.
- **Types** – `next typegen` and `tsc --noEmit` (or `check-types`). Use `PageProps`, `LayoutProps`, `RouteContext` where applicable.
- **Backup / branch** – Refactors on a branch; easy to compare and revert.

---

## 3. Incremental Upgrade Strategy

1. **Dry-run codemod**
   ```bash
   npx @next/codemod upgrade minor --dry
   npx @next/codemod next-async-request-api . --dry
   ```
2. **Version bump** – Run `upgrade` (or manually bump `next`, `react`, `react-dom` and related `@types`).
3. **One concern at a time** – e.g. first `next-async-request-api`, then `middleware-to-proxy`, then `next-lint-to-eslint-cli`.
4. **Build after each step** – `pnpm run build` (or `next build`). Fix compile/type errors before the next codemod.
5. **Manual follow-up** – Codemods sometimes add `@next/codemod` comments or `UnsafeUnwrapped*` casts; replace with proper `await` or `React.use()` and remove those markers.

---

## 4. Project Structure Refactors

From [Project structure](https://nextjs.org/docs/app/getting-started/project-structure):

### Route groups `(name)` – no URL change

- Use to group by section: `(marketing)`, `(shop)`, `(dashboard)`.
- Lets you give a subset of routes its own `layout` or `loading` without changing paths.

### Private folders `_name` – not routable

- `_components`, `_lib`, `_utils` next to routes: colocate UI/helpers without making them routes.
- Sorts clearly in the editor and avoids future convention clashes.

### `src/` – optional

- Move `app`, `pages`, `components`, `lib` under `src/` to separate app code from config at the project root.
- Only a structural choice; no behavior change.

### Colocation in `app/`

- Only `page` and `route` make a segment public. You can put components, lib, and data in the same folder; they stay non-routable.
- Prefer colocation by feature when it helps; use `_` or a shared `components`/`lib` when you want it obvious.

### Example layout for a section

```
app/
  (marketing)/
    layout.tsx
    page.tsx
    about/page.tsx
  (shop)/
    layout.tsx
    cart/page.tsx
    products/[id]/page.tsx
  api/
    health/route.ts
```

---

## 5. API and Convention Migrations

### Async Request APIs (Next 15+)

- `cookies()`, `headers()`, `draftMode()`: use `await`.
- `params`, `searchParams` in `page`, `layout`, `route`, `generateMetadata`, etc.: treat as `Promise`, use `await` in async code or `React.use()` in sync Client Components.

Codemod: `next-async-request-api`. After: run `next typegen` and fix any `@next/codemod` / `UnsafeUnwrapped*` leftovers.

### Middleware → Proxy (Next 16)

- Rename `middleware.ts` → `proxy.ts`, export `proxy` instead of `middleware`.
- In `next.config`: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`, `experimental.middlewarePrefetch` → `experimental.proxyPrefetch`, etc.

Codemod: `middleware-to-proxy`.

### `next lint` → ESLint CLI (Next 16)

- `next lint` removed. Use `eslint .` (or your script) and an `eslint.config.mjs` (or `.js`) with Next.js rules.

Codemod: `next-lint-to-eslint-cli`.

### Runtime config (Next 16)

- `serverRuntimeConfig` / `publicRuntimeConfig` removed. Use env vars: `process.env` for server, `NEXT_PUBLIC_*` for client. For runtime-only reads, consider `connection()` before `process.env`.

---

## 6. Pages Router → App Router (Incremental)

App and Pages can coexist. Prefer gradual migration:

1. **Add `app/`** with a root `layout.tsx` and an `app/page.tsx` for `/`.
2. **Move routes one by one** – e.g. create `app/dashboard/page.tsx` and later remove `pages/dashboard.tsx`. Adjust `Link` and `redirect` to new paths if they change.
3. **API routes** – `pages/api/*` remains valid. New APIs can use `app/api/*/route.ts`. Migrate when convenient.
4. **Data fetching** – Replace `getServerSideProps` / `getStaticProps` with Server Components and `fetch` (or your data layer) in `page.tsx` / `layout.tsx`. Use `generateStaticParams` for static `[param]` routes.
5. **Client-only behavior** – Use `'use client'` in the components that need hooks or browser APIs.

There is no single “Pages to App” codemod; do it route by route and lean on codemods for `new-link`, `built-in-next-font`, etc., and on `next typegen` for `PageProps`/`LayoutProps`.

---

## 7. AI-Assisted Refactors (Next.js DevTools MCP)

If your editor/agent supports MCP and [next-devtools-mcp](https://github.com/vercel/next-devtools-mcp):

- **Upgrade:** e.g. “Upgrade my Next.js app to version 16”.
- **Cache Components:** e.g. “Migrate my app to Cache Components”.

Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

Start the dev server so the MCP can talk to the app.

---

## 8. Post-Refactor Checks

- [ ] `pnpm run build` (or `next build`) passes.
- [ ] `next typegen` and `tsc --noEmit` (or `check-types`) pass.
- [ ] `lint` and any custom checks pass.
- [ ] E2E / smoke tests pass.
- [ ] Manually test critical flows (auth, main pages, key API routes).
- [ ] Remove temporary `UnsafeUnwrapped*` casts and `@next/codemod` TODOs.
- [ ] Update `README`, runbooks, and CI if scripts or structure changed.

---

## 9. Quick Reference: Codemods by Goal

| Goal                                              | Codemod                                                        |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Upgrade Next.js (and run applicable codemods)     | `npx @next/codemod upgrade minor` (or `major`, `canary`, etc.) |
| Async `cookies`/`headers`/`params`/`searchParams` | `next-async-request-api`                                       |
| Migrate middleware to proxy                       | `middleware-to-proxy`                                          |
| Migrate from `next lint` to ESLint                | `next-lint-to-eslint-cli`                                      |
| Remove `unstable_` from cache APIs                | `remove-unstable-prefix`                                       |
| Remove `experimental_ppr`                         | `remove-experimental-ppr`                                      |
| `runtime: 'experimental-edge'` → `'edge'`         | `app-dir-runtime-config-experimental-edge`                     |
| `viewport` in metadata → `viewport` export        | `metadata-to-viewport-export`                                  |
| `<Link><a>…` → `<Link>…`                          | `new-link`                                                     |
| `@next/font` → `next/font`                        | `built-in-next-font`                                           |

---

## References

- [Upgrade guide](https://nextjs.org/docs/app/guides/upgrading)
- [Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [Upgrading to 16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Upgrading to 15](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js DevTools MCP](https://nextjs.org/docs/app/guides/mcp)
