> **Status: SUPPORTING (SUP)**  
> Context only. If anything conflicts with **CANONICAL (CAN)** docs, the CAN docs win.  
> Entry point: `A-canonical-can/CAN000-CANON-MAP.md`

---

Odoo-like "Addon Modules" in TypeScript (but lean)

1. Each module gets a manifest (Odoo-style)

Odoo modules are declared by a manifest and discovered via addons-path.
We replicate this in TS:

packages/domain/src/addons/
sales/
manifest.ts
services/
policies/
jobs/
inventory/
manifest.ts
core/
manifest.ts

manifest.ts (concept)

id, version, dependsOn

what it contributes:

service registrations

permission policies

job registrations

optional “extensions” (add behavior to existing services)

2. Extensions instead of “model inheritance”

Odoo supports modular extension of models (add fields/methods/constraints).
In TS, keep it lean by using extension points:

registerServices(container)

registerPolicies(authz)

registerJobs(worker)

extend(serviceId, pluginFn) ← this is your “inheritance mechanism” without ORM magic

This gives you Odoo’s modularity, but with deterministic code.

C) The “One Way” request flow (no drift, ever)
Route file (spec-only)

apps/**/app/api/**/route.ts must:

import kernel from @workspace/api-kernel

import schemas from @workspace/validation

call a domain service from @workspace/domain

No DB queries in routes. No auth logic in routes. No response building in routes.

Flow

kernel creates ALS context + traceId

kernel resolves tenant/auth

kernel validates input + output (Zod)

kernel calls domain service

domain service uses db adapter

kernel returns standardized envelope

That’s how you prevent “human drift” permanently.

D) Domain architecture: what goes inside @workspace/domain
Minimal structure
packages/domain/src/
index.ts
bootstrap.ts # load manifests, build container
container.ts # simple DI (no heavy framework)
addons/
core/
sales/
inventory/
services/
(optional shared services)
ports/
db.ts # interfaces for db access (ports)
files.ts # interface for file pipeline

The “ports/adapters” rule (keeps it scalable)

Domain defines interfaces (ports): DbPort, FilesPort, AuthzPort

Apps provide adapters: Drizzle/Neon, Cloudflare, etc.

So domain stays portable (like Odoo modules are portable units).

E) Implementation plan (phased, low risk)
Phase 1 — Foundation (1–2 days)

Create @workspace/api-kernel, @workspace/validation, @workspace/domain

Add manifests + loader (bootstrap.ts)

Create one "Core" addon with:

TenantPolicy, AuditService, IdService

Update your strict allowlist to include:

@workspace/api-kernel/\*

@workspace/validation/\*

@workspace/domain/\*

Phase 2 — First real module (Sales / Requests)

Add requests addon:

RequestService.createRequest()

ApprovalService.approve()

Add job module for async work (Graphile Worker)

Add audit events for all transitions

Phase 3 — Odoo-scale modularity (when needed)

Split modules like Odoo apps:

sales, purchase, inventory, accounting

Use dependsOn in manifest to control installation order

Add “extension points” instead of deep inheritance

F) What to do about “moving with Odoo”

Two sane interpretations:

Option 1 (most practical): Odoo as reference architecture

Use Odoo as the conceptual model for:

modular addons + manifests

models/modules/apps separation

extension mechanism

…but you implement in TS with your stack.

Option 2 (bigger move): Use Odoo as backend, Next.js as head

If you literally adopt Odoo server:

Next.js becomes UI + BFF

Odoo owns ERP domain and DB interactions

You integrate via Odoo APIs
This is a different architecture (and heavier), so I’d only do it if you truly want “Odoo ERP” rather than “Odoo-inspired modularity”.
