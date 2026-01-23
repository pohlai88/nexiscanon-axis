# NexusCanon AXIS

> **Multi-tenant ERP Platform** built on Next.js 16, Neon PostgreSQL, and Drizzle ORM

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.7-EF4444?logo=turborepo)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-F69220?logo=pnpm)](https://pnpm.io/)

**Production URL:** https://nexuscanon-axis.vercel.app

---

## Document Map

> **"One engine, two faces. Quorum for simplicity. Cobalt for power. Same truth, different experiences."**

### Quick Navigation

| Category | Document | Purpose |
| -------- | -------- | ------- |
| **Start Here** | [Getting Started](./docs/tutorials/getting-started.md) | First-time setup |
| **Handoff** | [HANDOFF.md](./docs/HANDOFF.md) | Developer onboarding |
| **Architecture** | [Architecture](./docs/explanation/architecture.md) | System design |
| **Production** | [Production Setup](./docs/tutorials/production-setup.md) | Deploy to production |

---

## AXIS Document Series

### A-Series: Philosophy & Architecture

| Doc | Name | Description |
| --- | ---- | ----------- |
| [A01](./.cursor/ERP/A01-CANONICAL.md) | **CANONICAL** | AXIS Philosophy — Three Pillars, Dual-Kernel, Nexus Doctrine |
| [A01-01](./.cursor/ERP/A01-01-LYNX.md) | LYNX | AI-First Assistant Architecture |
| [A01-07](./.cursor/ERP/A01-07-THE-INVISIBLE-MACHINE.md) | The Invisible Machine | System Design Philosophy |
| [A02](./.cursor/ERP/A02-AXIS-MAP.md) | **AXIS Map** | Roadmap & Phase Definitions |

### B-Series: Domain Modules

| Doc | Name | Description |
| --- | ---- | ----------- |
| [B01](./.cursor/ERP/B01-DOCUMENTATION.md) | **Posting Spine** | Immutable Event Ledger & Posting Architecture |
| [B02](./.cursor/ERP/B02-DOMAINS.md) | Domains | Domain Boundary Definitions |
| [B03](./.cursor/ERP/B03-MDM.md) | MDM | Master Data Management |
| [B04](./.cursor/ERP/B04-SALES.md) | Sales | Sales Domain (Quotes → Invoices) |
| [B05](./.cursor/ERP/B05-PURCHASE.md) | Purchase | Purchase Domain (Requisitions → Bills) |
| [B06](./.cursor/ERP/B06-INVENTORY.md) | Inventory | Inventory Domain (Stock, Movements) |
| [B07](./.cursor/ERP/B07-ACCOUNTING.md) | Accounting | General Ledger & Financial Reporting |
| [B08](./.cursor/ERP/B08-CONTROLS.md) | Controls | RBAC, Segregation of Duties |
| [B08-01](./.cursor/ERP/B08-01-WORKFLOW.md) | Workflow | Approval Workflows & State Machines |
| [B09](./.cursor/ERP/B09-RECONCILIATION.md) | Reconciliation | Bank & Inter-system Reconciliation |
| [B10](./.cursor/ERP/B10-UX.md) | **UX** | Quorum & Cobalt Personas, UI Components |
| [B11](./.cursor/ERP/B11-AFANDA.md) | AFANDA | Dashboard & Analytics Framework |
| [B12](./.cursor/ERP/B12-INTELLIGENCE.md) | Intelligence | AI/ML Integration |

### E-Series: Design System

| Doc | Name | Description |
| --- | ---- | ----------- |
| [E01](./.cursor/ERP/E01-DESIGN-SYSTEM.md) | **Constitution** | Design System Philosophy & Component Inventory |
| [E02](./.cursor/ERP/E02-BLOCKS.md) | Block Library | Pre-Built UI Patterns & Compositions |
| [E03](./.cursor/ERP/E03-IMPLEMENTATION.md) | Implementation | Forms, Tables, Themes, Best Practices |
| [E04](./.cursor/ERP/E04-CONSISTENCY-STRATEGY.md) | **Consistency** | Automated Enforcement & Quality Assurance |

### C-Series: Migration & Integration

| Doc | Name | Description |
| --- | ---- | ----------- |
| [C01](./.cursor/ERP/C01-MIGRATION-PHILOSOPHY.md) | **Migration Philosophy** | Legacy System Migration Strategy |
| [C02](./.cursor/ERP/C02-COLUMN-ADAPTER.md) | Column Adapter | Field Mapping & Transformation |
| [C03](./.cursor/ERP/C03-MAPPING-STUDIO.md) | Mapping Studio | Visual Mapping Interface |
| [C04](./.cursor/ERP/C04-DUAL-LEDGER.md) | Dual Ledger | Parallel Run & Reconciliation |
| [C05](./.cursor/ERP/C05-CUTOVER.md) | Cutover | Go-Live Strategy |

---

## Package Documentation

| Package | Description | Status | Docs |
| ------- | ----------- | ------ | ---- |
| **@axis/web** | Next.js 16 web application | ✅ | [apps/web/](./apps/web/) |
| **@axis/db** | Drizzle ORM + Zod v4 + Query layer | ✅ | [packages/db/](./packages/db/) |
| **@axis/registry** | Schema definitions (SSOT) | ✅ | [packages/axis-registry/](./packages/axis-registry/) |
| **@axis/kernel** | Auth, tenant, config utilities | ✅ | [packages/kernel/](./packages/kernel/) |
| **@workspace/design-system** | Tailwind v4 + shadcn/ui components | ✅ | [packages/design-system/](./packages/design-system/) |

### Migration Packages

| Package | Description | Status | Docs |
| ------- | ----------- | ------ | ---- |
| ESLint v9 | Flat config migration | ✅ | [README](./packages/eslintV9/README.md) |
| Turbo v2 | Build system config | ✅ | [README](./packages/turboV2/README.md) |
| Next.js 16 | Framework migration | ✅ | [README](./packages/nextjs16/README.md) |
| TS5/React19 | Type system config | ✅ | [README](./packages/typescriptV5-reactV19/README.md) |

---

## Documentation Structure

```
docs/                           # Diátaxis framework
├── tutorials/                  # Learning-oriented
│   ├── getting-started.md
│   ├── deploy-to-vercel.md
│   └── production-setup.md
├── reference/                  # Information-oriented
│   ├── api/
│   └── environment-variables.md
└── explanation/                # Understanding-oriented
    └── architecture.md

.cursor/
├── ERP/                        # AXIS ERP Specifications (A/B/C Series)
│   ├── A01-A02                 # Philosophy & Architecture
│   ├── B01-B12                 # Domain Modules
│   └── C01-C05                 # Migration & Integration
├── plans/                      # Implementation Plans
│   └── README.md               # Entry point
└── rules/                      # Cursor Rules
    ├── 00-global.always.mdc    # Global constitution
    └── *.delta.mdc             # Domain-specific rules

packages/
├── axis-registry/              # Schema SSOT
│   ├── src/schemas/            # Zod schemas by domain
│   └── README.md
├── db/                         # Database layer
│   ├── src/schema/             # Drizzle tables
│   └── README.md
├── kernel/                     # Core utilities
│   └── README.md
└── design-system/              # UI components
    └── README.md
```

---

## Executive Summary

NexusCanon AXIS is a **production-ready multi-tenant ERP platform** with:

| Feature | Status | Technology |
| ------- | ------ | ---------- |
| **Multi-tenancy** | ✅ Live | Path + subdomain routing |
| **Authentication** | ✅ Live | Neon Auth (Better Auth compatible) |
| **Database** | ✅ Live | Neon PostgreSQL + Drizzle ORM |
| **Schema Registry** | ✅ Live | @axis/registry (Zod SSOT) |
| **UI Components** | ✅ Live | @workspace/design-system (shadcn/ui) |
| **Billing** | ✅ Integrated | Stripe subscriptions |
| **File Storage** | ✅ Integrated | Cloudflare R2 |
| **Email** | ✅ Integrated | Resend |
| **Observability** | ✅ Live | OpenTelemetry → Grafana Cloud |
| **Error Tracking** | ✅ Live | GlitchTip (Sentry-compatible) |
| **Security** | ✅ Live | CSP, rate limiting, firewall rules |

---

## Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+

# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .envsamplelocal .env.local
# Edit .env.local with your credentials

# 3. Initialize database
# Run apps/web/db/schema.sql against your Neon database

# 4. Start development
pnpm dev

# Opens at http://localhost:3000
```

---

## Design System Consistency

> **Status:** ✅ Fully Automated | **Documentation:** [E04-CONSISTENCY-STRATEGY.md](./.cursor/ERP/E04-CONSISTENCY-STRATEGY.md)

AXIS enforces design system consistency through **7 automated validation layers**:

```
┌─────────────────────────────────────────────────────────────┐
│            AUTOMATED CONSISTENCY ENFORCEMENT                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Design Tokens    → Tailwind v4 semantic variables      │
│  2. Utility Classes  → Tailwind CLI validation             │
│  3. Component Imports → @workspace/design-system only      │
│  4. Semantic Tokens  → No hardcoded colors (bg-blue-500)  │
│  5. No Local UI      → Centralized components only         │
│  6. ESLint Rules     → Custom design system plugin         │
│  7. TypeScript       → Strict mode (no any types)          │
│                                                             │
│  Every commit validated. Every build checked.              │
│  If it compiles, it's consistent.                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Health Metrics

```bash
# Generate comprehensive health report
pnpm report:design-system
```

| Metric | Target | Enforced By |
|--------|--------|-------------|
| Component Reuse | ≥90% | Validation scripts |
| Import Compliance | 100% | ESLint + pre-commit hooks |
| Semantic Token Usage | 100% | Custom ESLint rule |
| TypeScript Errors | 0 | TypeScript compiler |
| ESLint Violations | 0 | Pre-commit hooks + CI/CD |
| Bundle Size | <500KB | Monitored in reports |
| Build Time | <30s | Monitored in reports |

### Pre-Commit Validation

```bash
# Automatic on every commit
git commit -m "Add feature"
# → Validates TypeScript types
# → Validates ESLint rules
# → Formats with Prettier
# → Blocks commit if violations found
```

### CI/CD Pipeline

**GitHub Actions:** `.github/workflows/design-system-validation.yml`

- ✅ TypeScript validation
- ✅ ESLint validation (including custom design system rules)
- ✅ Import compliance check
- ✅ Semantic token enforcement
- ✅ Build validation
- ✅ Health metrics report

**All checks must pass before merge.**

### Custom ESLint Rules

Located in `packages/eslint-plugin-design-system/`:

1. **`no-hardcoded-colors`** - Blocks `bg-blue-500`, enforces semantic tokens
2. **`no-template-literals-in-classname`** - Enforces `cn()` utility
3. **`no-restricted-imports`** - Blocks local UI component imports

```typescript
// ✅ CORRECT
import { Button } from "@workspace/design-system"
className={cn("base", condition && "conditional")}
className="bg-primary text-primary-foreground"

// ❌ BLOCKED BY ESLINT
import { Button } from "./components/ui/button"
className={`base ${condition ? 'active' : ''}`}
className="bg-blue-500 text-white"
```

---

## Key Patterns

### Pattern 1: Single Source of Truth

```
@axis/registry/schemas  →  TypeScript Types  →  Zod Validation  →  Drizzle Schema
        ↓                        ↓                    ↓                  ↓
   Define ONCE           z.infer<typeof>         .safeParse()      $inferSelect
```

**Usage:**
```typescript
// Types from registry
import type { Document, EconomicEvent } from "@axis/registry/types";

// Validation from registry
import { documentRegistrySchema } from "@axis/registry/schemas";

// UI from design-system
import { Button, Card } from "@workspace/design-system";

// Database from @axis/db
import { findTenantBySlug, createTenant } from "@axis/db/queries";
```

### Pattern 2: Workspace Imports

```typescript
// ✅ CORRECT - Workspace imports
import { Button } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

// ❌ WRONG - Local imports
import { Button } from "./components/ui/button";
```

### Pattern 3: Server Action Structure

```typescript
"use server";

export async function myAction(formData: FormData): Promise<ActionResult> {
  // 1. Auth check
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 2. Validate with Zod schema
  const parsed = schema.safeParse({ ... });
  if (!parsed.success) return { success: false, fieldErrors: ... };

  // 3. Business logic
  // 4. Audit log
  // 5. Return result
}
```

---

## Architecture Overview

```
NexusCanon-AXIS/
├── apps/
│   └── web/                    # Next.js 16 application (Turbopack)
│       ├── src/app/            # App Router pages
│       │   ├── (auth)/         # Auth pages (login, register, etc.)
│       │   ├── [tenant]/       # Multi-tenant routes
│       │   └── api/            # API routes
│       └── src/lib/            # Shared utilities
│
├── packages/
│   ├── axis-registry/          # @axis/registry - Schema SSOT
│   │   └── src/schemas/        # Zod schemas by domain
│   │       ├── common.ts       # 6W1H, MetadataLite
│   │       ├── document.ts     # Document registry
│   │       ├── ux/             # UI component registry
│   │       └── ...
│   │
│   ├── db/                     # @axis/db - Database layer
│   │   ├── src/schema/         # Drizzle ORM tables
│   │   ├── src/validation/     # Zod v4 schemas
│   │   └── src/queries/        # Query functions
│   │
│   ├── kernel/                 # @axis/kernel - Core utilities
│   │
│   └── design-system/          # @workspace/design-system
│       ├── src/components/     # shadcn/ui components
│       ├── src/theme.css       # Tailwind v4 theme (oklch)
│       └── src/lib/utils.ts    # cn() utility
│
├── .cursor/
│   ├── ERP/                    # AXIS specifications
│   └── rules/                  # Cursor rules
│
├── docs/                       # Diátaxis documentation
│
├── pnpm-workspace.yaml         # Workspace + dependency catalog
├── turbo.json                  # Turborepo configuration
└── eslint.config.mjs           # ESLint v9 flat config
```

---

## Available Scripts

```bash
# Development
pnpm dev                    # All packages in dev mode
pnpm --filter @axis/web dev # Web app only

# Build & Check
pnpm build                  # Build all packages
pnpm typecheck              # TypeScript check
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix lint issues

# Design System Validation
pnpm validate:imports       # Check workspace imports
pnpm validate:tokens        # Check semantic token usage
pnpm validate:no-local-ui   # Check for local UI components
pnpm validate:all           # Run all validations
pnpm report:design-system   # Generate health metrics

# Tailwind CSS
pnpm css:dev                # Watch mode (development)
pnpm css:build              # Minified build (production)

# Database (from packages/db)
pnpm db:generate            # Generate Drizzle migrations
pnpm db:push                # Push schema to database
pnpm db:studio              # Open Drizzle Studio

# Registry codegen (from packages/axis-registry)
pnpm --filter @axis/registry codegen
```

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16.1.4 (Turbopack) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM 0.38.4 |
| Validation | Zod 4.x + drizzle-zod |
| Auth | Neon Auth (better-auth compatible) |
| Styling | Tailwind CSS 4.x (oklch colors) |
| UI Components | shadcn/ui (@workspace/design-system) |
| Build | Turborepo 2.7 |
| Hosting | Vercel (Edge Network) |
| Email | Resend |
| Payments | Stripe |
| Storage | Cloudflare R2 |

---

## Related Resources

### Internal

| Resource | Description |
| -------- | ----------- |
| [Cursor Rules](.cursor/rules/) | IDE automation rules |
| [Plans](.cursor/plans/README.md) | Implementation plans |
| [Scripts](./scripts/README.md) | Utility scripts |
| [E2E Testing](./docs/E2E-TESTING.md) | Testing strategy |
| [Design System Consistency](./docs/DESIGN-SYSTEM-CONSISTENCY.md) | Automated enforcement guide |

### External

| Resource | Description |
| -------- | ----------- |
| [Next.js 16 Docs](https://nextjs.org/docs) | Framework documentation |
| [Drizzle ORM Docs](https://orm.drizzle.team/docs) | ORM documentation |
| [Neon Docs](https://neon.tech/docs) | Database documentation |
| [Zod v4 Docs](https://zod.dev/v4) | Validation documentation |
| [Tailwind v4 Docs](https://tailwindcss.com/docs) | Styling documentation |
| [shadcn/ui](https://ui.shadcn.com/) | Component library |
| [Turborepo Docs](https://turbo.build/repo/docs) | Build system documentation |

---

## License

MIT License - See [LICENSE.md](./LICENSE.md)

---

## Governance

| Field | Value |
| ----- | ----- |
| **Status** | Production |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-01-23 |
| **Maintainer** | AXIS Architecture Team |
| **Design System** | ✅ 100% Compliance Enforced |

---

> *"PROTECT. DETECT. REACT. — The Machine never forgets."*
