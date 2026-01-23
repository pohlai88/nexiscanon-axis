/**
 * User Seed Data
 *
 * Implements F01 B10 — Seeding
 */

import { db } from "../client";
import { users } from "../schema";

export async function seedUsers() {
  console.log("📦 Seeding users...");

  const seedData = [
    {
      id: "00000000-0000-0000-0000-000000000101",
      email: "admin@dev.local",
      name: "Dev Admin",
      role: "admin" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000000102",
      email: "user@dev.local",
      name: "Dev User",
      role: "user" as const,
    },
    {
      id: "00000000-0000-0000-0000-000000000103",
      email: "viewer@dev.local",
      name: "Dev Viewer",
      role: "viewer" as const,
    },
  ];

  const inserted = await db
    .insert(users)
    .values(seedData)
    .onConflictDoNothing()
    .returning({ id: users.id, email: users.email });

  console.log(`   ✓ Inserted ${inserted.length} users`);
  inserted.forEach((u) => console.log(`     - ${u.email} (${u.id})`));
}
