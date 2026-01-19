// packages/domain/src/addons/core/manifest.ts
// Core addon: provides IdService + AuditService

import type { AddonManifest, RequestContext, DomainEvent } from "../../types";
import { token } from "../../container";

// ---- Service Interfaces ----

export interface IdService {
  /** Generate a new unique ID */
  newId(): string;
}

export interface AuditService {
  /** Write an audit event */
  write(event: {
    name: string;
    ctx: RequestContext;
    data?: unknown;
  }): Promise<void>;
}

// ---- Tokens (public contract) ----

export const CORE_TOKENS = {
  IdService: token<IdService>("domain.core.IdService"),
  AuditService: token<AuditService>("domain.core.AuditService"),
} as const;

// ---- Helpers ----

function isoNow(): string {
  return new Date().toISOString();
}

// ---- Core Addon Manifest ----

export const coreAddon: AddonManifest = {
  id: "core",
  version: "1.0.0",
  dependsOn: [],

  async register({ provideValue, provide, events }) {
    // IdService: generates unique IDs
    provideValue(CORE_TOKENS.IdService, {
      newId() {
        return crypto.randomUUID();
      },
    });

    // AuditService: emits audit events
    // App/worker can extend this to persist to DB
    provide(CORE_TOKENS.AuditService, () => {
      const audit: AuditService = {
        async write({ name, ctx, data }) {
          const event: DomainEvent = {
            name: `audit.${name}`,
            at: isoNow(),
            traceId: ctx.traceId,
            tenantId: ctx.tenantId,
            actorId: ctx.actorId,
            data,
          };
          events.emit(event);
        },
      };
      return audit;
    });
  },
};
