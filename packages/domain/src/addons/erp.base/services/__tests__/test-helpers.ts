// packages/domain/src/addons/erp.base/services/__tests__/test-helpers.ts
// Test helpers for ERP services
//
// Provides database and service setup for tests

import type { ServiceContext } from "../../types";

// Re-export for test convenience (with type assertions to avoid pg version conflicts)
export { drizzle } from "drizzle-orm/node-postgres";
export { Pool } from "pg";

/**
 * Create a test database connection
 * NOTE: Tests use drizzle + pg Pool directly
 * Type assertion used to avoid @types/pg version conflicts between packages
 */
export function createTestDbConfig() {
  const connectionString =
    process.env.DATABASE_URL_TEST || process.env.DATABASE_URL || "postgresql://localhost:5432/test";

  return {
    connectionString,
    max: 1, // Single connection for tests
  };
}

/**
 * Create a test service context
 */
export function createTestContext(overrides?: Partial<ServiceContext>): ServiceContext {
  return {
    tenantId: overrides?.tenantId ?? "test-tenant-id",
    actorUserId: overrides?.actorUserId ?? "test-user-id",
    traceId: overrides?.traceId ?? "test-trace-id",
    ...overrides,
  };
}

/**
 * Clean up test data for a tenant
 * NOTE: Use db.execute() with raw SQL for cleanup
 */
export async function cleanupTestData(db: any, tenantId: string): Promise<void> {
  // This is a simplified cleanup - in production you'd want CASCADE deletes
  // or a proper test database reset strategy
  try {
    await db.execute(`
      DELETE FROM erp_products WHERE tenant_id = '${tenantId}';
      DELETE FROM erp_partners WHERE tenant_id = '${tenantId}';
      DELETE FROM erp_sequences WHERE tenant_id = '${tenantId}';
      DELETE FROM erp_uoms WHERE tenant_id = '${tenantId}';
      DELETE FROM erp_audit_events WHERE tenant_id = '${tenantId}';
    `);
  } catch (error) {
    // Ignore cleanup errors (tables may not exist in test setup)
    console.warn(`Test cleanup warning for tenant ${tenantId}:`, error);
  }
}
