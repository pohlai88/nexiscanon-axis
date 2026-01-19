# @workspace/app-runtime

**Composition-only package** — wires domain with infrastructure (DB, env, etc.)

## Purpose

This package is the **composition root** where:
- Domain addons are bootstrapped (pure)
- Infrastructure dependencies are wired (DB, cache, etc.) based on env
- App-layer singletons are managed

## Rules (STRICT)

✅ **Allowed:**
- Container creation and wiring
- Token binding (domain ports → concrete implementations)
- Env-based decisions (e.g., "if DATABASE_URL → wire Drizzle")
- Exporting helpers: `getDomainContainer()`, `getRuntime()`

❌ **Forbidden:**
- Business logic
- Query helpers
- Route helpers
- Validation schemas
- Domain types (use `@workspace/domain` exports)
- DB schema (use `@workspace/db` exports)

## Drift Prevention

If this package starts growing beyond 1-2 small files, **stop and refactor**.
Composition logic should be boring and thin.

## Usage

Routes import from this package to get the wired domain container:

```ts
import { getDomainContainer } from "@workspace/app-runtime";

const container = await getDomainContainer();
const service = container.get(SOME_TOKEN);
```

## Dependency Rules

- ✅ May depend on: `@workspace/domain`, `@workspace/db`, `@workspace/observability`
- ❌ Must NOT depend on: apps, other infra packages, third-party ORMs (except via db package)

---

**If you're adding business logic here, you're violating the composition boundary. Move it to `@workspace/domain`.**
