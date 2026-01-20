// packages/app-runtime/src/index.ts
// App-layer composition: wire domain with infrastructure (DB, env, etc.)
// This package is allowed to know about both @workspace/domain and @workspace/db

import { bootstrapDomain, allAddons, REQUESTS_TOKENS, tokenId } from "@workspace/domain";
import type { DomainRuntime, Container } from "@workspace/domain";

export { getR2Client, getR2Config, type R2Client, type R2Config } from "./r2";

let _domainRuntime: DomainRuntime | null = null;

/**
 * Wire Drizzle repository implementations to domain container.
 * Only called when DATABASE_URL exists.
 * Returns token IDs (string constants) for drift-proof, auditable logging.
 */
async function wireDatabaseRepositories(runtime: DomainRuntime): Promise<string[]> {
  // Import db package (only in app layer, not in domain)
  const { getDb, createRequestsRepo } = await import("@workspace/db");
  const db = getDb();

  const wiredRepos: string[] = [];

  // Replace in-memory RequestRepository with Drizzle implementation
  runtime.container.provide(REQUESTS_TOKENS.RequestRepository, () => {
    return createRequestsRepo(db);
  });
  wiredRepos.push(tokenId(REQUESTS_TOKENS.RequestRepository));

  return wiredRepos;
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
      const wiredRepos = await wireDatabaseRepositories(_domainRuntime);
      
      // Fail-fast assertion: verify all expected tokens were wired
      if (!wiredRepos.includes(tokenId(REQUESTS_TOKENS.RequestRepository))) {
        throw new Error(
          "Fatal: RequestRepository was not wired despite DATABASE_URL being set. Check wireDatabaseRepositories()."
        );
      }

      // EVI018: Wire audit event listener to persist audit logs to DB
      const { getDb, createAuditLogsRepository } = await import("@workspace/db");
      const db = getDb();
      const auditRepo = createAuditLogsRepository(db);
      
      // Subscribe to all audit.* events (wildcard by listening to each known event)
      const auditHandler = async (event: any) => {
        const cleanEventName = event.name.replace(/^audit\./, "");
        try {
          await auditRepo.append({
            tenantId: event.tenantId || "",
            actorId: event.actorId || "",
            traceId: event.traceId || "",
            eventName: cleanEventName,
            eventData: event.data,
          });
        } catch (err) {
          console.error("Failed to persist audit event:", err);
        }
      };
      
      // Register handler for all known audit event types
      _domainRuntime.events.on("audit.request.created", auditHandler);
      _domainRuntime.events.on("audit.request.approved", auditHandler);
      _domainRuntime.events.on("audit.template.created", auditHandler);
      _domainRuntime.events.on("audit.template.listed", auditHandler);
      _domainRuntime.events.on("audit.template.read", auditHandler);
      _domainRuntime.events.on("audit.approval.attempted", auditHandler);
      _domainRuntime.events.on("audit.approval.succeeded", auditHandler);
      _domainRuntime.events.on("audit.approval.blocked.evidence_required", auditHandler);
      _domainRuntime.events.on("audit.approval.blocked.evidence_stale", auditHandler);
      _domainRuntime.events.on("audit.report.generate.requested", auditHandler);

      // Emit one-time observable log (startup proof) with actual token IDs
      console.log(
        JSON.stringify({
          event: "domain.wiring",
          wired: "drizzle",
          repos: wiredRepos,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      // Emit one-time observable log (in-memory fallback)
      console.log(
        JSON.stringify({
          event: "domain.wiring",
          wired: "in-memory",
          repos: [tokenId(REQUESTS_TOKENS.RequestRepository)],
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  return _domainRuntime.container;
}

/**
 * Get evidence files repository directly.
 * Phase 1: direct access from app-runtime, not domain-wrapped.
 */
export async function getEvidenceFilesRepo() {
  const { getDb, createEvidenceFileRepository } = await import("@workspace/db");
  const db = getDb();
  return createEvidenceFileRepository(db);
}

/**
 * Get request-evidence links repository.
 */
export async function getRequestEvidenceLinksRepo() {
  const { getDb, createRequestEvidenceLinksRepository } = await import("@workspace/db");
  const db = getDb();
  return createRequestEvidenceLinksRepository(db);
}

/**
 * Get audit logs repository.
 */
export async function getAuditLogsRepo() {
  const { getDb, createAuditLogsRepository } = await import("@workspace/db");
  const db = getDb();
  return createAuditLogsRepository(db);
}

/**
 * Get templates repository.
 */
export async function getTemplatesRepo() {
  const { getDb, createTemplatesRepo } = await import("@workspace/db");
  const db = getDb();
  return createTemplatesRepo(db);
}
