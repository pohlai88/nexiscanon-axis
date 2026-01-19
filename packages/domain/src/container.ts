// packages/domain/src/container.ts
// Lightweight dependency injection container with extension support

import type { Container, Token, Factory, Extender } from "./types";

type Provider<T> = {
  factory: Factory<T>;
  instance?: T;
  extenders: Extender<T>[];
};

/**
 * Create a new dependency injection container.
 * Supports provide, provideValue, extend, and get operations.
 */
export function createContainer(): Container {
  const providers = new Map<string, Provider<unknown>>();

  function ensure(token: Token<unknown>): Provider<unknown> {
    const key = token as unknown as string;
    let provider = providers.get(key);

    if (!provider) {
      provider = {
        factory: () => {
          throw new Error(`No factory registered for token: ${key}`);
        },
        extenders: [],
      };
      providers.set(key, provider);
    }

    return provider;
  }

  const container: Container = {
    /**
     * Register a factory for a token.
     */
    provide<T>(token: Token<T>, factory: Factory<T>) {
      const provider = ensure(token);
      // Type erasure: we store Factory<unknown> but guarantee type safety via Token<T>
      provider.factory = factory as unknown as Factory<unknown>;
      // Reset instance so new factory is used
      delete provider.instance;
    },

    /**
     * Register a pre-built value for a token.
     */
    provideValue<T>(token: Token<T>, value: T) {
      const provider = ensure(token);
      provider.factory = () => value;
      provider.instance = value;
    },

    /**
     * Register an extender for a token.
     * Extenders wrap/modify the service after creation.
     */
    extend<T>(token: Token<T>, extender: Extender<T>) {
      const provider = ensure(token);
      // Type erasure: we store Extender<unknown> but guarantee type safety via Token<T>
      provider.extenders.push(extender as unknown as Extender<unknown>);
      // Reset instance so extenders are applied on next get
      delete provider.instance;
    },

    /**
     * Get a service by token.
     * Creates the instance on first access, applies extenders.
     */
    get<T>(token: Token<T>): T {
      const key = token as unknown as string;
      const provider = providers.get(key);

      if (!provider) {
        throw new Error(
          `Domain Container: missing provider for token "${key}"`
        );
      }

      // Return cached instance if available
      if (provider.instance !== undefined) {
        return provider.instance as T;
      }

      // Build instance
      let instance = provider.factory(container);

      // Apply extenders in registration order (deterministic)
      for (const extender of provider.extenders) {
        instance = extender(instance, container);
      }

      // Cache instance
      provider.instance = instance;

      return instance as T;
    },

    /**
     * List all registered tokens.
     */
    listTokens() {
      return Array.from(providers.keys()).sort();
    },
  };

  return container;
}

/**
 * Create a typed token for dependency injection.
 */
export function token<T>(name: string): Token<T> {
  return name as Token<T>;
}
