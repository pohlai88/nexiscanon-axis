> **Status: SUPPORTING (SUP)**  
> Context only. If anything conflicts with **CANONICAL (CAN)** docs, the CAN docs win.  
> Entry point: `A-canonical-can/CAN000-CANON-MAP.md`

---

Below are **paste-ready domain foundation files** (lean, Odoo-inspired "addons + manifest + dependsOn + extension points"), designed to plug into your **kernel(spec)** routes with **zero drift**.

I’m giving you a minimal but strong base:

- `container.ts` → tiny DI + extension system (no heavy framework)
- `bootstrap.ts` → loads addons, topological sort by `dependsOn`, registers everything
- `addons/core/manifest.ts` → first addon (core services + audit/event pattern)
- plus small supporting files (`types.ts`, `index.ts`) so it compiles cleanly

---

## 1) `packages/domain/src/types.ts`

```ts
// packages/domain/src/types.ts

export type AddonId = string;

export type DomainEnv = {
  envName: string; // "dev" | "staging" | "prod" (string to stay lean)
  release?: string;
};

export type RequestContext = {
  traceId: string;
  requestId: string;
  tenantId?: string;
  actorId?: string;
  roles?: string[];
};

export type DomainDeps = {
  env: DomainEnv;

  // Ports (adapters provided by app / worker)
  db?: DbPort;
  files?: FilesPort;

  // Optional authz/policy engine hook (keep lean)
  authz?: AuthzPort;
};

export interface DbPort {
  // Keep this interface minimal; expand as you implement db adapters.
  // Example shape only:
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
}

export interface FilesPort {
  // Example: issue signed upload, mark status, etc.
  createUploadUrl(input: {
    tenantId: string;
    key: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<{ uploadUrl: string; key: string }>;
}

export interface AuthzPort {
  // Minimal authorization hook; you can expand later to ABAC.
  hasRole(ctx: RequestContext, required: string[]): boolean;
}

// ---- Addon / Manifest types ----

export type RegisterFn = (api: AddonAPI) => void | Promise<void>;

export type AddonManifest = {
  id: AddonId;
  version: string; // keep simple; semver recommended
  dependsOn?: AddonId[];

  // Odoo-like: module declares what it contributes
  register?: RegisterFn;
};

export type AddonAPI = {
  container: Container;
  deps: DomainDeps;

  // Allow addons to register services and extensions
  provide<T>(token: Token<T>, factory: Factory<T>): void;
  provideValue<T>(token: Token<T>, value: T): void;
  extend<T>(token: Token<T>, extender: Extender<T>): void;

  // Optional registry hooks (jobs/events)
  jobs: JobRegistry;
  events: EventBus;
};

export type Token<T> = string & { __type?: T };

export type Factory<T> = (c: Container) => T;
export type Extender<T> = (cur: T, c: Container) => T;

export interface Container {
  provide<T>(token: Token<T>, factory: Factory<T>): void;
  provideValue<T>(token: Token<T>, value: T): void;
  extend<T>(token: Token<T>, extender: Extender<T>): void;

  get<T>(token: Token<T>): T;

  // for debugging / governance
  listTokens(): string[];
}

export type JobHandler = (input: {
  ctx: RequestContext;
  payload: unknown;
}) => Promise<void>;

export interface JobRegistry {
  register(jobName: string, handler: JobHandler): void;
  get(jobName: string): JobHandler | undefined;
  list(): string[];
}

export type DomainEvent = {
  name: string;
  at: string; // ISO timestamp
  traceId?: string;
  tenantId?: string;
  actorId?: string;
  data?: unknown;
};

export interface EventBus {
  emit(evt: DomainEvent): void;
  on(name: string, handler: (evt: DomainEvent) => void): void;
}
```

---

## 2) `packages/domain/src/container.ts`

```ts
// packages/domain/src/container.ts
import type { Container, Token, Factory, Extender } from "./types";

type Provider<T> = {
  factory: Factory<T>;
  instance?: T;
  extenders: Extender<T>[];
};

export function createContainer(): Container {
  const providers = new Map<string, Provider<any>>();

  function ensure<T>(token: Token<T>): Provider<T> {
    const key = token as unknown as string;
    let p = providers.get(key);
    if (!p) {
      p = { factory: () => undefined as any, extenders: [] };
      providers.set(key, p);
    }
    return p as Provider<T>;
  }

  const container: Container = {
    provide<T>(token: Token<T>, factory: Factory<T>) {
      const p = ensure(token);
      p.factory = factory;
      // reset instance so changes apply deterministically
      delete p.instance;
    },

    provideValue<T>(token: Token<T>, value: T) {
      const p = ensure(token);
      p.factory = () => value;
      p.instance = value;
    },

    extend<T>(token: Token<T>, extender: Extender<T>) {
      const p = ensure(token);
      p.extenders.push(extender);
      // reset instance so extenders apply deterministically
      delete p.instance;
    },

    get<T>(token: Token<T>): T {
      const key = token as unknown as string;
      const p = providers.get(key);
      if (!p) {
        throw new Error(
          `Domain Container: missing provider for token "${key}"`
        );
      }

      if (p.instance !== undefined) return p.instance as T;

      // Build
      let value = p.factory(container);

      // Apply extenders in registration order (deterministic)
      for (const ex of p.extenders) {
        value = ex(value, container);
      }

      p.instance = value;
      return value as T;
    },

    listTokens() {
      return Array.from(providers.keys()).sort();
    },
  };

  return container;
}

// helper to declare tokens with type inference
export function token<T>(name: string) {
  return name as any as Token<T>;
}
```

---

## 3) `packages/domain/src/bootstrap.ts`

```ts
// packages/domain/src/bootstrap.ts
import { createContainer } from "./container";
import type {
  AddonManifest,
  AddonAPI,
  DomainDeps,
  Container,
  JobRegistry,
  EventBus,
  DomainEvent,
} from "./types";

function topoSort(addons: AddonManifest[]): AddonManifest[] {
  const byId = new Map(addons.map((a) => [a.id, a]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const out: AddonManifest[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Addon dependency cycle detected at "${id}"`);
    }
    visiting.add(id);

    const a = byId.get(id);
    if (!a) throw new Error(`Addon "${id}" not found (dependency missing)`);

    for (const dep of a.dependsOn ?? []) {
      visit(dep);
    }

    visiting.delete(id);
    visited.add(id);
    out.push(a);
  }

  for (const a of addons) visit(a.id);
  return out;
}

function createJobRegistry(): JobRegistry {
  const map = new Map<string, any>();
  return {
    register(name, handler) {
      if (map.has(name)) {
        throw new Error(`JobRegistry: job "${name}" already registered`);
      }
      map.set(name, handler);
    },
    get(name) {
      return map.get(name);
    },
    list() {
      return Array.from(map.keys()).sort();
    },
  };
}

function createEventBus(): EventBus {
  const handlers = new Map<string, Array<(evt: DomainEvent) => void>>();
  return {
    emit(evt) {
      const hs = handlers.get(evt.name) ?? [];
      for (const h of hs) h(evt);
    },
    on(name, handler) {
      const hs = handlers.get(name) ?? [];
      hs.push(handler);
      handlers.set(name, hs);
    },
  };
}

export type DomainRuntime = {
  container: Container;
  deps: DomainDeps;
  jobs: JobRegistry;
  events: EventBus;

  // governance: what loaded and in what order
  addonOrder: string[];
  addonVersions: Record<string, string>;
};

export async function bootstrapDomain(opts: {
  deps: DomainDeps;
  addons: AddonManifest[]; // explicit list (deterministic)
}): Promise<DomainRuntime> {
  const container = createContainer();
  const jobs = createJobRegistry();
  const events = createEventBus();

  const ordered = topoSort(opts.addons);

  const api: AddonAPI = {
    container,
    deps: opts.deps,
    jobs,
    events,
    provide: container.provide,
    provideValue: container.provideValue,
    extend: container.extend,
  };

  for (const a of ordered) {
    if (a.register) {
      await a.register(api);
    }
  }

  const addonVersions: Record<string, string> = {};
  for (const a of ordered) addonVersions[a.id] = a.version;

  return {
    container,
    deps: opts.deps,
    jobs,
    events,
    addonOrder: ordered.map((a) => a.id),
    addonVersions,
  };
}
```

---

## 4) `packages/domain/src/addons/core/manifest.ts`

This is your “Core” addon: provides **IdService** + **AuditService** and an example event hook.

```ts
// packages/domain/src/addons/core/manifest.ts
import type { AddonManifest, RequestContext, DomainEvent } from "../../types";
import { token } from "../../container";

// ---- Tokens (public contract inside domain) ----
export type IdService = { newId(): string };
export const TOKENS = {
  IdService: token<IdService>("domain.core.IdService"),
  AuditService: token<AuditService>("domain.core.AuditService"),
};

export type AuditService = {
  write(evt: {
    name: string;
    ctx: RequestContext;
    data?: unknown;
  }): Promise<void>;
};

function isoNow() {
  return new Date().toISOString();
}

export const coreAddon: AddonManifest = {
  id: "core",
  version: "1.0.0",
  dependsOn: [],

  async register({ provideValue, provide, deps, events }) {
    // Id generator (lean default)
    provideValue(TOKENS.IdService, {
      newId() {
        // You can swap later with ULID, KSUID, etc.
        return crypto.randomUUID();
      },
    });

    // Audit service: default implementation emits an event.
    // App/worker can extend/replace this to write to DB append-only table.
    provide(TOKENS.AuditService, () => {
      const audit: AuditService = {
        async write({ name, ctx, data }) {
          const evt: DomainEvent = {
            name: `audit.${name}`,
            at: isoNow(),
            traceId: ctx.traceId,
            tenantId: ctx.tenantId,
            actorId: ctx.actorId,
            data,
          };
          events.emit(evt);

          // If you already have a db port, you can also persist here later.
          // Keep lean: do nothing else by default.
          void deps;
        },
      };
      return audit;
    });

    // Example: subscribe to audit events for side-effects (optional).
    // In real use, you might attach a listener that persists to DB via an adapter.
    events.on("audit.request.created", (evt) => {
      // Keep lean: no logging here (kernel/worker handles pino).
      void evt;
    });
  },
};
```

> Note: `crypto.randomUUID()` is available in Node 19+ / 20+. If you run into runtime constraints, switch to `import { randomUUID } from "node:crypto"`.

---

## 5) `packages/domain/src/index.ts`

```ts
// packages/domain/src/index.ts
export * from "./types";
export * from "./bootstrap";
export * from "./container";

// Addons
export { coreAddon } from "./addons/core/manifest";
```

---

# How you’ll use it (example wiring)

### In Next.js server runtime (API)

You’ll bootstrap once (singleton) and call services from routes.

```ts
import { bootstrapDomain, coreAddon } from "@workspace/domain";

const domain = await bootstrapDomain({
  deps: {
    env: {
      envName: process.env.NODE_ENV ?? "dev",
      release: process.env.RELEASE,
    },
  },
  addons: [coreAddon],
});
```

Then, inside your route handler (called by kernel), call domain services via `domain.container.get(TOKENS.AuditService)` etc.

---
