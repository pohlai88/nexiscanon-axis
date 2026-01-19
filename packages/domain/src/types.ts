// packages/domain/src/types.ts
// Domain types: Addon manifests, Container, Ports, Events, Jobs

export type AddonId = string;

/** Environment configuration */
export type DomainEnv = {
  envName: string; // "development" | "staging" | "production"
  release?: string;
};

/** Request context passed to domain services */
export type RequestContext = {
  traceId: string;
  requestId: string;
  tenantId?: string;
  actorId?: string;
  roles?: string[];
};

/** Dependencies injected into domain bootstrap */
export type DomainDeps = {
  env: DomainEnv;

  // Ports (adapters provided by app/worker)
  db?: DbPort;
  files?: FilesPort;
  authz?: AuthzPort;
};

/** Database port interface */
export interface DbPort {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
}

/** File storage port interface */
export interface FilesPort {
  createUploadUrl(input: {
    tenantId: string;
    key: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<{ uploadUrl: string; key: string }>;
}

/** Authorization port interface */
export interface AuthzPort {
  hasRole(ctx: RequestContext, required: string[]): boolean;
}

// ---- Addon / Manifest types ----

export type RegisterFn = (api: AddonAPI) => void | Promise<void>;

/** Addon manifest - Odoo-inspired module declaration */
export type AddonManifest = {
  id: AddonId;
  version: string;
  dependsOn?: AddonId[];
  register?: RegisterFn;
};

/** API passed to addon register() function */
export type AddonAPI = {
  container: Container;
  deps: DomainDeps;
  jobs: JobRegistry;
  events: EventBus;

  // Convenience methods (delegate to container)
  provide<T>(token: Token<T>, factory: Factory<T>): void;
  provideValue<T>(token: Token<T>, value: T): void;
  extend<T>(token: Token<T>, extender: Extender<T>): void;
};

// ---- Container types ----

/** Token for type-safe dependency injection */
export type Token<T> = string & { __type?: T };

/** Factory function that creates a service */
export type Factory<T> = (c: Container) => T;

/** Extender function that wraps/extends an existing service */
export type Extender<T> = (current: T, c: Container) => T;

/** Dependency injection container */
export interface Container {
  provide<T>(token: Token<T>, factory: Factory<T>): void;
  provideValue<T>(token: Token<T>, value: T): void;
  extend<T>(token: Token<T>, extender: Extender<T>): void;
  get<T>(token: Token<T>): T;
  listTokens(): string[];
}

// ---- Job Registry types ----

export type JobHandler = (input: {
  ctx: RequestContext;
  payload: unknown;
}) => Promise<void>;

export interface JobRegistry {
  register(jobName: string, handler: JobHandler): void;
  get(jobName: string): JobHandler | undefined;
  list(): string[];
}

// ---- Event Bus types ----

export type DomainEvent = {
  name: string;
  at: string; // ISO timestamp
  traceId?: string;
  tenantId?: string;
  actorId?: string;
  data?: unknown;
};

export interface EventBus {
  emit(event: DomainEvent): void;
  on(name: string, handler: (event: DomainEvent) => void): void;
  off(name: string, handler: (event: DomainEvent) => void): void;
}
