// packages/domain/src/bootstrap.ts
// Bootstrap domain with topological addon loading

import { createContainer } from "./container";
import type {
  AddonManifest,
  AddonAPI,
  DomainDeps,
  Container,
  JobRegistry,
  EventBus,
  DomainEvent,
  JobHandler,
} from "./types";

/**
 * Topologically sort addons by dependsOn.
 * Throws on circular dependencies.
 */
function topoSort(addons: AddonManifest[]): AddonManifest[] {
  const byId = new Map(addons.map((a) => [a.id, a]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: AddonManifest[] = [];

  function visit(id: string, path: string[] = []) {
    if (visited.has(id)) return;

    if (visiting.has(id)) {
      const cycle = [...path, id].join(" -> ");
      throw new Error(`Addon dependency cycle detected: ${cycle}`);
    }

    visiting.add(id);

    const addon = byId.get(id);
    if (!addon) {
      throw new Error(`Addon "${id}" not found (dependency missing)`);
    }

    for (const dep of addon.dependsOn ?? []) {
      visit(dep, [...path, id]);
    }

    visiting.delete(id);
    visited.add(id);
    result.push(addon);
  }

  for (const addon of addons) {
    visit(addon.id);
  }

  return result;
}

/**
 * Create a job registry.
 */
function createJobRegistry(): JobRegistry {
  const handlers = new Map<string, JobHandler>();

  return {
    register(name, handler) {
      if (handlers.has(name)) {
        throw new Error(`JobRegistry: job "${name}" already registered`);
      }
      handlers.set(name, handler);
    },

    get(name) {
      return handlers.get(name);
    },

    list() {
      return Array.from(handlers.keys()).sort();
    },
  };
}

/**
 * Create an event bus.
 */
function createEventBus(): EventBus {
  const listeners = new Map<string, Set<(event: DomainEvent) => void>>();

  return {
    emit(event) {
      const handlers = listeners.get(event.name);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(event);
          } catch (err) {
            // Log but don't throw - event handlers shouldn't break the flow
            console.error(`Event handler error for "${event.name}":`, err);
          }
        }
      }
    },

    on(name, handler) {
      let handlers = listeners.get(name);
      if (!handlers) {
        handlers = new Set();
        listeners.set(name, handlers);
      }
      handlers.add(handler);
    },

    off(name, handler) {
      const handlers = listeners.get(name);
      if (handlers) {
        handlers.delete(handler);
      }
    },
  };
}

/** Domain runtime returned by bootstrapDomain */
export type DomainRuntime = {
  container: Container;
  deps: DomainDeps;
  jobs: JobRegistry;
  events: EventBus;

  // Governance visibility
  addonOrder: string[];
  addonVersions: Record<string, string>;
};

/**
 * Bootstrap the domain with addons.
 * Loads addons in topological order by dependsOn.
 */
export async function bootstrapDomain(opts: {
  deps: DomainDeps;
  addons: AddonManifest[];
}): Promise<DomainRuntime> {
  const container = createContainer();
  const jobs = createJobRegistry();
  const events = createEventBus();

  // Sort addons topologically
  const ordered = topoSort(opts.addons);

  // Create addon API
  const api: AddonAPI = {
    container,
    deps: opts.deps,
    jobs,
    events,
    provide: container.provide.bind(container),
    provideValue: container.provideValue.bind(container),
    extend: container.extend.bind(container),
  };

  // Register each addon
  for (const addon of ordered) {
    if (addon.register) {
      await addon.register(api);
    }
  }

  // Build governance info
  const addonVersions: Record<string, string> = {};
  for (const addon of ordered) {
    addonVersions[addon.id] = addon.version;
  }

  return {
    container,
    deps: opts.deps,
    jobs,
    events,
    addonOrder: ordered.map((a) => a.id),
    addonVersions,
  };
}
