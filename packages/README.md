---

**Package:** `@workspace/design-system`  
**Purpose:** Make the *right* usage path the easiest path (guardrails, not policing).  
**Primary Consumers:** `apps/web`, `apps/docs`  
**Status:** ✅ In Progress (this README is the canonical entry point)

---

## 0) What This README Is For (Tracking)

This document is the **single source of truth** for:
- What boundaries exist
- How they are enforced (tools + files)
- What’s implemented vs pending
- How to add/modify components **without drift**

If you only read one file, read this.

---

## 1) Architecture (Consumer → Source of Truth → Automation)

```mermaid
graph TB
  subgraph apps[Apps Layer - Consumers]
    web[apps/web]
    docs[apps/docs]
  end

  subgraph ds[Design System - Source of Truth]
    components[src/components]
    lib[src/lib]
    providers[src/providers]
    styles[src/styles/globals.css]
    tokens[src/tokens]
  end

  subgraph guardrails[Automation - Guardrails]
    depcruise[Dependency Cruiser]
    gen[Turbo Generators]
    css[CSS Layers]
    ci[CI Gates]
    cursor[Cursor Rules]
  end

  web --> ds
  docs --> ds

  depcruise --> apps
  depcruise --> ds
  gen --> ds
  css --> styles
  ci --> guardrails
  cursor --> apps
````

---

## 2) Allowed Imports (Public API Only)

### ✅ Allowed (Apps)

```ts
import { Button } from "@workspace/design-system/button";
import { cn } from "@workspace/design-system/utils";
import "@workspace/design-system/styles/globals.css";
```

### ❌ Forbidden (Apps)

```ts
import { Button } from "@workspace/design-system/src/components/button";
import "../../packages/design-system/src/components/button";
import { cn } from "tailwind-merge"; // use DS utils instead
```

---

## 3) CSS Rules (Layers)

### Design System defines theme variables

File: `src/styles/globals.css`

* Theme variables live in `@layer design-system`
* Apps can only add app-specific vars in `@layer app-overrides`

### Apps define ONLY app variables (prefix: `--app-*`)

Example: `apps/web/app/globals.css`

* ✅ `--app-sidebar-width`
* ❌ redefining `--background`, `--foreground`, etc.

---

## 4) Component Categories (Next.js Safe Boundaries)

We separate component intent to prevent accidental bundle drift:

* `src/components/client/**`
  Must include `'use client'`. May use hooks, browser APIs.

* `src/components/server/**`
  Must NOT include `'use client'`. May use server-only utilities (if approved).

* `src/components/**` (neutral/default)
  Must not import server-only modules (e.g., `next/headers`, `server-only`).

> If a component needs hooks, it belongs in `client/`.

---

## 5) How To Add a Component (Pit of Success)

### Canon path (required)

```bash
pnpm turbo gen component
```

The generator will:

1. Create the component file in `packages/design-system/src/components/...`
2. Register exports (subpath exports)
3. Update `src/index.ts` (if used)
4. Run architecture validation

### Do NOT manually create new components without generator

Manual changes risk export drift and will be blocked by CI.

---

## 6) Guardrails: Enforcement Map (Where Each Rule Lives)

| Guardrail                       | Enforced By                    | Source File                             |
| ------------------------------- | ------------------------------ | --------------------------------------- |
| Apps cannot import DS internals | Dependency Cruiser             | `.dependency-cruiser.js`                |
| No circular dependencies        | Dependency Cruiser             | `.dependency-cruiser.js`                |
| No themed usage in apps         | Dependency Cruiser             | `.dependency-cruiser.js`                |
| Exports must be complete        | Generator + CI diff            | `turbo/generators/*` + scripts          |
| Theme vars protected            | CSS Layers (+ optional script) | `src/styles/globals.css`                |
| Forbidden TS paths              | TypeScript                     | `apps/*/tsconfig.json`                  |
| Agent behavior                  | Cursor rules                   | `.cursor/rules/design-system.delta.mdc` |
| CI build fails on violations    | GitHub Actions / Turbo         | `turbo.json` + CI workflow              |

---

## 7) Commands (Daily Workflow)

### Validate architecture

```bash
pnpm validate:architecture
```

### Generate architecture diagram (optional)

```bash
pnpm graph:architecture
```

### Run all guardrail gates (CI local)

```bash
pnpm test:architecture
```

---

## 8) Tracking Checklist (Implementation Status)

### Phase 1 — Foundation

* [x] Wrap DS theme vars in `@layer design-system`
* [x] Apps use `@layer app-overrides` (remove theme var overrides)
* [x] Add `.dependency-cruiser.js` ruleset
* [x] Add `.cursor/rules/design-system.delta.mdc`
* [x] Add `.cursorignore` to hide themed showcase
* [x] Add `data-app` attributes to app layouts

### Phase 2 — Automation

* [x] Turbo generator scaffolding + templates
* [x] Subpath exports in `packages/design-system/package.json` (71 exports generated)
* [x] Scripts: `generate-exports.ts`, `validate-exports.ts`, `validate-directives.ts`
* [ ] CI: `validate:architecture` is required (add to `.github/workflows`)

### Phase 3 — No-Drift Upgrades (Canon Guardrails Pack)

* [x] **Generated exports map** (exports become generated artifact via `pnpm gen:exports`)
* [x] Server/client boundaries validated (depcruise rules + validate-directives script)
* [x] Relative import escape hatch blocked (depcruise + path restrictions)
* [x] Utility deduplication enforced (depcruise blocks direct clsx/tailwind-merge imports)
* [x] Themed showcase isolated (`.cursorignore` + depcruise rules)
* [x] CSS Layer protection (native browser enforcement)

### Next Steps

1. **Install dependency-cruiser**: Run `pnpm install` to add `dependency-cruiser` package
2. **Test validation**: Run `pnpm validate:architecture` to test rules
3. **Add CI workflow**: Integrate `pnpm test:architecture` into GitHub Actions
4. **Test generator**: Run `pnpm turbo gen component` to create a test component

> Update this checklist in every PR that touches guardrails.

---

## 9) Change Control (How to Modify the Design System)

When making design-system changes:

1. Prefer generator paths
2. Keep app-specific tokens as `--app-*` only
3. Never deep-import internals from apps
4. Run:

   * `pnpm validate:architecture`
   * `pnpm test:architecture` (if present)

---

## 10) Glossary

* **Guardrails:** Positive constraints that make correct behavior easy.
* **Public API:** Only what is exported via package `exports` subpaths.
* **Drift:** When actual usage diverges from intended architecture.
* **Pit of Success:** Default workflows that naturally lead to correct outcomes.

```
