// Example: How to update your repositories to use read replicas
// This is a reference implementation - NOT added to actual repo yet

import { getDb, getReplicaDb } from "../client";
import { requests, users, tenants } from "../schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Request Repository with Read Replica Support
 * 
 * Strategy:
 * - Writes → always use primary (getDb)
 * - Reads → use replica by default, allow override for consistency needs
 * - Read-after-write → explicitly use primary
 */
export class RequestRepositoryWithReplica {
  /**
   * Create new request
   * Uses primary database (write operation)
   */
  async create(data: InsertRequest) {
    return await getDb()
      .insert(requests)
      .values(data)
      .returning();
  }

  /**
   * Update request
   * Uses primary database (write operation)
   */
  async update(id: string, data: Partial<InsertRequest>) {
    return await getDb()
      .update(requests)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, id))
      .returning();
  }

  /**
   * Delete request (soft delete)
   * Uses primary database (write operation)
   */
  async delete(id: string) {
    return await getDb()
      .update(requests)
      .set({ deletedAt: new Date() })
      .where(eq(requests.id, id));
  }

  /**
   * Find request by ID
   * 
   * @param id - Request ID
   * @param options.useReplica - Use read replica (default: true)
   *                            Set to false for read-after-write scenarios
   */
  async findById(
    id: string,
    options: { useReplica?: boolean } = {}
  ) {
    const { useReplica = true } = options;
    const db = useReplica ? getReplicaDb() : getDb();

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, id))
      .limit(1);

    return request;
  }

  /**
   * List requests with filters
   * Perfect for read replica (non-critical, read-heavy)
   */
  async list(filters: {
    tenantId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const { tenantId, status, limit = 50, offset = 0 } = filters;

    return await getReplicaDb()
      .select()
      .from(requests)
      .where(
        and(
          tenantId ? eq(requests.tenantId, tenantId) : undefined,
          status ? eq(requests.status, status) : undefined
        )
      )
      .orderBy(desc(requests.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get request statistics
   * Heavy analytics query - perfect for read replica
   */
  async getStats(tenantId: string) {
    return await getReplicaDb()
      .select({
        total: sql`count(*)`,
        pending: sql`count(*) filter (where status = 'pending')`,
        approved: sql`count(*) filter (where status = 'approved')`,
        rejected: sql`count(*) filter (where status = 'rejected')`,
        avgProcessingTime: sql`avg(extract(epoch from (updated_at - created_at)))`,
      })
      .from(requests)
      .where(eq(requests.tenantId, tenantId));
  }

  /**
   * Create and immediately fetch
   * Read-after-write scenario - must use primary for consistency
   */
  async createAndFetch(data: InsertRequest) {
    // Write to primary
    const [created] = await getDb()
      .insert(requests)
      .values(data)
      .returning();

    // ✅ Use primary for read-after-write (useReplica: false)
    return await this.findById(created.id, { useReplica: false });
  }

  /**
   * Get requests with user details
   * Join query - offload to replica
   */
  async listWithUsers(tenantId: string) {
    return await getReplicaDb()
      .select({
        request: requests,
        user: users,
      })
      .from(requests)
      .leftJoin(users, eq(requests.userId, users.id))
      .where(eq(requests.tenantId, tenantId))
      .limit(100);
  }

  /**
   * Generate monthly report
   * Complex aggregation - perfect for replica
   */
  async getMonthlyReport(tenantId: string, year: number) {
    return await getReplicaDb()
      .select({
        month: sql`extract(month from created_at)`,
        year: sql`extract(year from created_at)`,
        total: sql`count(*)`,
        approved: sql`count(*) filter (where status = 'approved')`,
        rejected: sql`count(*) filter (where status = 'rejected')`,
        avgProcessingDays: sql`avg(extract(day from (updated_at - created_at)))`,
      })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, tenantId),
          sql`extract(year from created_at) = ${year}`
        )
      )
      .groupBy(
        sql`extract(month from created_at)`,
        sql`extract(year from created_at)`
      )
      .orderBy(sql`extract(month from created_at)`);
  }
}

/**
 * User Repository Example
 */
export class UserRepositoryWithReplica {
  /**
   * Create user
   */
  async create(data: InsertUser) {
    return await getDb()
      .insert(users)
      .values(data)
      .returning();
  }

  /**
   * Find user by email
   * Use replica by default, but allow primary for auth checks
   */
  async findByEmail(email: string, options: { useReplica?: boolean } = {}) {
    const { useReplica = true } = options;
    const db = useReplica ? getReplicaDb() : getDb();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  /**
   * List users
   * Use replica for list operations
   */
  async list(filters: { tenantId?: string; limit?: number }) {
    const { tenantId, limit = 50 } = filters;

    return await getReplicaDb()
      .select()
      .from(users)
      .where(tenantId ? eq(users.tenantId, tenantId) : undefined)
      .limit(limit);
  }

  /**
   * User activity dashboard
   * Complex query - use replica
   */
  async getActivityDashboard(userId: string) {
    return await getReplicaDb()
      .select({
        user: users,
        requestCount: sql`count(${requests.id})`,
        recentRequests: sql`
          json_agg(
            json_build_object(
              'id', ${requests.id},
              'status', ${requests.status},
              'created_at', ${requests.createdAt}
            )
            order by ${requests.createdAt} desc
          ) filter (where ${requests.id} is not null)
        `,
      })
      .from(users)
      .leftJoin(requests, eq(requests.userId, users.id))
      .where(eq(users.id, userId))
      .groupBy(users.id);
  }
}

/**
 * Service Layer Example
 * Shows how to use both primary and replica strategically
 */
export class RequestService {
  private requestRepo = new RequestRepositoryWithReplica();

  /**
   * Submit new request
   * Write operation + immediate read (use primary for both)
   */
  async submitRequest(data: InsertRequest) {
    // Create and fetch in one go (both use primary)
    const request = await this.requestRepo.createAndFetch(data);

    // Additional operations that need consistency
    // (all use primary implicitly through repository methods)
    
    return request;
  }

  /**
   * Get request dashboard
   * Read-heavy, can tolerate slight lag
   */
  async getDashboard(tenantId: string) {
    // All these use replica (perfect for dashboard)
    const [requests, stats] = await Promise.all([
      this.requestRepo.list({ tenantId, limit: 20 }),
      this.requestRepo.getStats(tenantId),
    ]);

    return { requests, stats };
  }

  /**
   * Approve request and fetch updated state
   * Write + read-after-write (use primary for read)
   */
  async approveRequest(id: string, approverId: string) {
    // Update (uses primary)
    await this.requestRepo.update(id, {
      status: "approved",
      approverId,
      approvedAt: new Date(),
    });

    // Fetch with useReplica: false (ensures consistency)
    return await this.requestRepo.findById(id, { useReplica: false });
  }

  /**
   * Generate report
   * Analytics query (perfect for replica)
   */
  async generateReport(tenantId: string, year: number) {
    // Heavy aggregation on replica
    return await this.requestRepo.getMonthlyReport(tenantId, year);
  }
}

/**
 * API Route Example
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");

  const service = new RequestService();

  // Dashboard query - uses replica automatically
  const dashboard = await service.getDashboard(tenantId!);

  return Response.json(dashboard);
}

export async function POST(request: Request) {
  const data = await request.json();

  const service = new RequestService();

  // Create + read-after-write - uses primary
  const created = await service.submitRequest(data);

  return Response.json(created, { status: 201 });
}
