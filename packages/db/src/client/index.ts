export { db, createDbClient, type Database } from "./neon";
export {
  createTenantScopedClient,
  withTenant,
  type TenantScopedDb,
} from "./tenant-scoped";
