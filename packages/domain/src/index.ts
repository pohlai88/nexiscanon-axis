// packages/domain/src/index.ts
// Domain package exports

// Types
export type {
  AddonId,
  DomainEnv,
  RequestContext,
  DomainDeps,
  DbPort,
  FilesPort,
  AuthzPort,
  RegisterFn,
  AddonManifest,
  AddonAPI,
  Token,
  Factory,
  Extender,
  Container,
  JobHandler,
  JobRegistry,
  DomainEvent,
  EventBus,
} from "./types";

// Container
export { createContainer, token } from "./container";

// Bootstrap
export { bootstrapDomain } from "./bootstrap";
export type { DomainRuntime } from "./bootstrap";

// Addons
export {
  allAddons,
  coreAddon,
  CORE_TOKENS,
  requestsAddon,
  REQUESTS_TOKENS,
} from "./addons";
export type {
  IdService,
  AuditService,
  RequestService,
  Request,
  RequestStatus,
} from "./addons";

// Repository ports (for app-layer wiring)
export type { RequestRepository } from "./addons/requests/ports";
