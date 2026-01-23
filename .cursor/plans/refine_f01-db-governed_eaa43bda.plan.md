---
name: Refine F01-DB-GOVERNED
overview: Refine and improve the F01-DB-GOVERNED.md document to be a comprehensive, actionable database governance specification following best practices from Drizzle ORM, Neon, and PostgreSQL, aligned with existing codebase patterns.
todos:
  - id: rewrite-f01-section-a
    content: "Rewrite Section A: Add F01-01 (@axis/registry SSOT), update F01-02 (Drizzle reflects registry), add F01-06 (RLS with pgPolicy)"
    status: completed
  - id: add-drizzle-patterns
    content: "Add Section B3: Enum pattern ($type<>), relations(), index()/uniqueIndex(), type inference ($inferSelect/$inferInsert)"
    status: completed
  - id: add-constraint-patterns
    content: "Add Section B4: check(), unique(), foreignKey(), primaryKey(), constraint naming conventions"
    status: completed
  - id: add-rls-section
    content: "Add Section B5: RLS with pgTable.withRLS(), pgPolicy(), Neon crudPolicy/authenticatedRole helpers"
    status: completed
  - id: add-migration-workflow
    content: "Update Section B6: drizzle-kit generate/migrate/push/pull workflow, custom migrations, safety patterns"
    status: completed
  - id: expand-neon-ops
    content: "Expand Section B7: Official Neon MCP patterns - drivers (neon-http/websockets/postgres-js), PgBouncer (transaction mode limits), branching (GitHub Actions), PITR, autoscaling, security (credentials, SQL injection), query optimization (prepared statements, batch, edge regions)"
    status: completed
  - id: add-transactions-section
    content: "Add Section B9: Official Neon MCP transaction patterns - HTTP sql.transaction(), WebSocket interactive, Drizzle tx, serverless lifecycle (pool create/close in handler), Neon error handling"
    status: completed
  - id: add-seeding-section
    content: "Add Section B10: Development seeds, drizzle-seed generators, seed versioning, test data patterns"
    status: completed
  - id: add-performance-section
    content: "Add Section B11: Query optimization, serverless cold starts, connection pooling, read replicas"
    status: completed
  - id: add-team-migrations
    content: "Add Section B12: Branch migration strategy, conflict resolution, drizzle-kit check, migrations for teams"
    status: completed
  - id: add-templates
    content: "Add Section D: Templates based on ACTUAL live schema - Tenant table (UUID PK, enums, JSONB settings), Junction table (composite PK, FK CASCADE), Audit table (FK SET NULL, DESC index)"
    status: completed
  - id: add-mcp-workflow
    content: "Add Section E: Neon MCP workflow integration - prepare_database_migration/complete_database_migration, query tuning workflow, schema verification tools"
    status: completed
isProject: false
---

