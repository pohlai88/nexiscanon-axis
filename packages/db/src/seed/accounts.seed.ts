/**
 * Chart of Accounts Seed Data
 *
 * Minimal COA for posting spine testing.
 * Implements F01 B10 — Seeding
 */

import { db } from "../client";
import { accounts } from "../schema";

/**
 * Seed chart of accounts.
 *
 * Creates minimal account structure for testing:
 * - Assets (Cash, AR)
 * - Liabilities (AP)
 * - Revenue
 * - Expenses
 */
export async function seedAccounts(tenantId: string) {
  console.log("📦 Seeding chart of accounts...");

  const seedData = [
    // Assets
    {
      id: "00000000-0000-0000-0000-000000001000",
      tenantId,
      code: "1000",
      name: "Assets",
      accountType: "asset" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000001100",
      tenantId,
      code: "1100",
      name: "Current Assets",
      accountType: "asset" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000001110",
      tenantId,
      code: "1110",
      name: "Cash",
      accountType: "asset" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000001120",
      tenantId,
      code: "1120",
      name: "Accounts Receivable",
      accountType: "asset" as const,
      currency: "USD",
      isActive: "true" as const,
    },

    // Liabilities
    {
      id: "00000000-0000-0000-0000-000000002000",
      tenantId,
      code: "2000",
      name: "Liabilities",
      accountType: "liability" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000002100",
      tenantId,
      code: "2100",
      name: "Current Liabilities",
      accountType: "liability" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000002110",
      tenantId,
      code: "2110",
      name: "Accounts Payable",
      accountType: "liability" as const,
      currency: "USD",
      isActive: "true" as const,
    },

    // Revenue
    {
      id: "00000000-0000-0000-0000-000000004000",
      tenantId,
      code: "4000",
      name: "Revenue",
      accountType: "revenue" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000004100",
      tenantId,
      code: "4100",
      name: "Sales Revenue",
      accountType: "revenue" as const,
      currency: "USD",
      isActive: "true" as const,
    },

    // Expenses
    {
      id: "00000000-0000-0000-0000-000000005000",
      tenantId,
      code: "5000",
      name: "Expenses",
      accountType: "expense" as const,
      currency: "USD",
      isActive: "true" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000005100",
      tenantId,
      code: "5100",
      name: "Cost of Goods Sold",
      accountType: "expense" as const,
      currency: "USD",
      isActive: "true" as const,
    },
  ];

  const inserted = await db
    .insert(accounts)
    .values(seedData)
    .onConflictDoNothing()
    .returning({ id: accounts.id, code: accounts.code, name: accounts.name });

  console.log(`   ✓ Inserted ${inserted.length} accounts`);
  inserted.forEach((a) => console.log(`     - ${a.code} ${a.name} (${a.id})`));

  return inserted;
}
