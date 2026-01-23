/**
 * Tenant Seed Data
 *
 * Implements F01 B10 — Seeding
 */

import { db } from "../client";
import { tenants } from "../schema";

export async function seedTenants() {
  console.log("📦 Seeding tenants...");

  const seedData = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      slug: "dev-tenant",
      name: "Development Tenant",
      type: "organization" as const,
      status: "active" as const,
      plan: "enterprise" as const,
      settings: {
        features: {
          inventory: true,
          accounting: true,
          sales: true,
          purchase: true,
        },
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      slug: "test-tenant",
      name: "Test Tenant",
      type: "organization" as const,
      status: "active" as const,
      plan: "professional" as const,
      settings: {
        features: {
          inventory: true,
          accounting: true,
          sales: true,
          purchase: false,
        },
      },
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      slug: "demo-acme",
      name: "ACME Corporation (Demo)",
      type: "organization" as const,
      status: "active" as const,
      plan: "professional" as const,
      settings: {
        features: {
          inventory: true,
          accounting: true,
          sales: true,
          purchase: true,
        },
      },
    },
  ];

  const inserted = await db
    .insert(tenants)
    .values(seedData)
    .onConflictDoNothing()
    .returning({ id: tenants.id, slug: tenants.slug });

  console.log(`   ✓ Inserted ${inserted.length} tenants`);
  inserted.forEach((t) => console.log(`     - ${t.slug} (${t.id})`));

  return inserted;
}
