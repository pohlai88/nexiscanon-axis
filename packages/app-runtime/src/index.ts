// packages/app-runtime/src/index.ts
// App-layer composition: wire domain with infrastructure (DB, env, etc.)
// This package is allowed to know about both @workspace/domain and @workspace/db

import { bootstrapDomain, allAddons, REQUESTS_TOKENS } from "@workspace/domain";
import type { DomainRuntime, Container } from "@workspace/domain";

let _domainRuntime: DomainRuntime | null = null;

/**
 * Wire Drizzle repository implementations to domain container.
 * Only called when DATABASE_URL exists.
 */
async function wireDatabaseRepositories(runtime: DomainRuntime): Promise<void> {
  // Import db package (only in app layer, not in domain)
  const { getDb, createRequestsRepo } = await import("@workspace/db");
  const db = getDb();

  // Replace in-memory RequestRepository with Drizzle implementation
  runtime.container.provide(REQUESTS_TOKENS.RequestRepository, () => {
    return createRequestsRepo(db);
  });

  console.log("✅ Database repositories wired (Drizzle)");
}

/**
 * Get the domain container (singleton).
 * App-layer composition: decides whether to wire DB based on env.
 */
export async function getDomainContainer(): Promise<Container> {
  if (!_domainRuntime) {
    // Bootstrap domain (pure, no infra)
    _domainRuntime = await bootstrapDomain({
      deps: {
        env: { envName: process.env.NODE_ENV || "development" },
      },
      addons: allAddons,
    });

    // Wire database repositories if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      await wireDatabaseRepositories(_domainRuntime);
    } else {
      console.warn("⚠️  DATABASE_URL not set - using in-memory repositories");
    }
  }

  return _domainRuntime.container;
}
