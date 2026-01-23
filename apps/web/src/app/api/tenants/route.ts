/**
 * Tenant listing API.
 *
 * Pattern: Public API for tenant discovery.
 * Used by: Subdomain routing, admin interfaces.
 * Protected by Arcjet rate limiting.
 *
 * @see https://github.com/vercel/platforms
 */

import { NextRequest, NextResponse } from "next/server";
import { findTenantBySlug, findTenantByDomain, listTenants } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { apiProtection, isArcjetConfigured } from "@/lib/arcjet";
import { logger } from "@/lib/logger";

/**
 * GET /api/tenants
 *
 * Query params:
 * - slug: Find by slug
 * - domain: Find by custom domain
 * - list: List all (admin only)
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? "unknown";
  const log = logger.child({ requestId, endpoint: "/api/tenants" });

  // Arcjet protection
  if (isArcjetConfigured()) {
    const decision = await apiProtection.protect(request);
    if (decision.isDenied()) {
      log.warn("Tenants API request denied by Arcjet", { reason: decision.reason });
      if (decision.reason.isRateLimit()) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
      return NextResponse.json({ error: "Request denied" }, { status: 403 });
    }
  }

  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const domain = searchParams.get("domain");
  const listAll = searchParams.get("list") === "true";

  try {
    // Find by slug
    if (slug) {
      const tenant = await findTenantBySlug(slug);
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }
      const settings = tenant.settings as Record<string, unknown> | null;
      return NextResponse.json({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan,
        branding: settings?.branding ?? {},
      });
    }

    // Find by custom domain
    if (domain) {
      const tenant = await findTenantByDomain(domain);
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }
      const settings = tenant.settings as Record<string, unknown> | null;
      return NextResponse.json({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan,
        branding: settings?.branding ?? {},
      });
    }

    // List all tenants (admin only)
    if (listAll) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if super admin
      const adminCheck = await query(async (sql) => {
        return sql`
          SELECT settings->>'isAdmin' as is_admin
          FROM users
          WHERE id = ${user.id}::uuid
          LIMIT 1
        `;
      });

      if (adminCheck[0]?.is_admin !== "true") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const limit = parseInt(searchParams.get("limit") ?? "50", 10);
      const offset = parseInt(searchParams.get("offset") ?? "0", 10);

      const { tenants, total } = await listTenants({ limit, offset });

      return NextResponse.json({
        tenants: tenants.map((t) => {
          const settings = t.settings as Record<string, unknown> | null;
          return {
            id: t.id,
            slug: t.slug,
            name: t.name,
            plan: t.plan,
            status: t.status,
            branding: settings?.branding ?? {},
            createdAt: t.createdAt.toISOString(),
          };
        }),
        total,
        limit,
        offset,
      });
    }

    return NextResponse.json(
      { error: "Missing query parameter: slug, domain, or list" },
      { status: 400 }
    );
  } catch (error) {
    log.error("Tenant API error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
