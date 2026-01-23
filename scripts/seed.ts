/**
 * Seed script for NexusCanon-AXIS.
 *
 * Creates demo data for development and testing.
 *
 * ## Neon Best Practices Applied:
 * - Uses connection pooling (-pooler suffix in DATABASE_URL)
 * - Single transaction for atomicity
 * - Idempotent: safe to run multiple times
 * - Uses UPSERT patterns to avoid duplicates
 *
 * ## Usage:
 * ```bash
 * # From project root
 * pnpm tsx scripts/seed.ts
 *
 * # Or with specific branch
 * DATABASE_URL="..." pnpm tsx scripts/seed.ts
 * ```
 *
 * @see https://neon.tech/docs/guides/node
 * @see https://neon.tech/docs/connect/connection-pooling
 */

import postgres from "postgres";

// Validate environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.error("   Set it in .env.local or pass directly:");
  console.error('   DATABASE_URL="postgresql://..." pnpm tsx scripts/seed.ts');
  process.exit(1);
}

// Create connection with pooling (Neon best practice)
const sql = postgres(DATABASE_URL, {
  max: 1, // Seed script only needs 1 connection
  idle_timeout: 20,
  connect_timeout: 10,
});

// Demo data configuration
const DEMO_DATA = {
  // Admin user (has isAdmin flag in settings)
  adminUser: {
    email: "admin@nexuscanon.com",
    name: "Admin User",
    settings: { isAdmin: "true" },
  },
  // Regular demo user
  demoUser: {
    email: "demo@nexuscanon.com",
    name: "Demo User",
    settings: {},
  },
  // Demo organization
  demoOrg: {
    slug: "acme-corp",
    name: "Acme Corporation",
    type: "organization" as const,
    settings: {
      branding: {
        emoji: "🏢",
        brandColor: "#3b82f6",
        description: "Demo organization for testing",
      },
    },
  },
  // Demo team (child of organization)
  demoTeam: {
    slug: "acme-engineering",
    name: "Engineering Team",
    type: "team" as const,
    settings: {
      branding: {
        emoji: "⚙️",
        description: "Engineering department",
      },
    },
  },
  // Personal workspace
  personalWorkspace: {
    slug: "demo-personal",
    name: "Demo's Workspace",
    type: "personal" as const,
    settings: {
      branding: {
        emoji: "👤",
      },
    },
  },
};

async function seed() {
  console.log("🌱 Starting seed...\n");

  try {
    // Use transaction for atomicity
    await sql.begin(async (tx) => {
      // 1. Create admin user
      console.log("👤 Creating admin user...");
      const [adminUser] = await tx`
        INSERT INTO users (email, name, email_verified, settings)
        VALUES (
          ${DEMO_DATA.adminUser.email},
          ${DEMO_DATA.adminUser.name},
          true,
          ${JSON.stringify(DEMO_DATA.adminUser.settings)}::jsonb
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          settings = EXCLUDED.settings,
          updated_at = now()
        RETURNING id, email
      `;
      console.log(`   ✓ Admin: ${adminUser.email} (${adminUser.id})`);

      // 2. Create demo user
      console.log("👤 Creating demo user...");
      const [demoUser] = await tx`
        INSERT INTO users (email, name, email_verified, settings)
        VALUES (
          ${DEMO_DATA.demoUser.email},
          ${DEMO_DATA.demoUser.name},
          true,
          ${JSON.stringify(DEMO_DATA.demoUser.settings)}::jsonb
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = now()
        RETURNING id, email
      `;
      console.log(`   ✓ Demo: ${demoUser.email} (${demoUser.id})`);

      // 3. Create demo organization
      console.log("🏢 Creating demo organization...");
      const [demoOrg] = await tx`
        INSERT INTO tenants (slug, name, type, settings)
        VALUES (
          ${DEMO_DATA.demoOrg.slug},
          ${DEMO_DATA.demoOrg.name},
          ${DEMO_DATA.demoOrg.type},
          ${JSON.stringify(DEMO_DATA.demoOrg.settings)}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          settings = EXCLUDED.settings,
          updated_at = now()
        RETURNING id, slug, name
      `;
      console.log(`   ✓ Org: ${demoOrg.name} (/${demoOrg.slug})`);

      // 4. Create demo team (child of org)
      console.log("👥 Creating demo team...");
      const [demoTeam] = await tx`
        INSERT INTO tenants (slug, name, type, parent_id, settings)
        VALUES (
          ${DEMO_DATA.demoTeam.slug},
          ${DEMO_DATA.demoTeam.name},
          ${DEMO_DATA.demoTeam.type},
          ${demoOrg.id},
          ${JSON.stringify(DEMO_DATA.demoTeam.settings)}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          parent_id = ${demoOrg.id},
          settings = EXCLUDED.settings,
          updated_at = now()
        RETURNING id, slug, name
      `;
      console.log(`   ✓ Team: ${demoTeam.name} (/${demoTeam.slug})`);

      // 5. Create personal workspace
      console.log("👤 Creating personal workspace...");
      const [personalWs] = await tx`
        INSERT INTO tenants (slug, name, type, settings)
        VALUES (
          ${DEMO_DATA.personalWorkspace.slug},
          ${DEMO_DATA.personalWorkspace.name},
          ${DEMO_DATA.personalWorkspace.type},
          ${JSON.stringify(DEMO_DATA.personalWorkspace.settings)}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          settings = EXCLUDED.settings,
          updated_at = now()
        RETURNING id, slug, name
      `;
      console.log(`   ✓ Personal: ${personalWs.name} (/${personalWs.slug})`);

      // 6. Add memberships
      console.log("🔗 Creating memberships...");

      // Admin owns the organization
      await tx`
        INSERT INTO tenant_users (tenant_id, user_id, role, accepted_at)
        VALUES (${demoOrg.id}, ${adminUser.id}, 'owner', now())
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET
          role = 'owner',
          updated_at = now()
      `;
      console.log(`   ✓ Admin → ${demoOrg.slug} (owner)`);

      // Admin is admin of team
      await tx`
        INSERT INTO tenant_users (tenant_id, user_id, role, accepted_at)
        VALUES (${demoTeam.id}, ${adminUser.id}, 'admin', now())
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET
          role = 'admin',
          updated_at = now()
      `;
      console.log(`   ✓ Admin → ${demoTeam.slug} (admin)`);

      // Demo user is member of organization
      await tx`
        INSERT INTO tenant_users (tenant_id, user_id, role, accepted_at)
        VALUES (${demoOrg.id}, ${demoUser.id}, 'member', now())
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET
          role = 'member',
          updated_at = now()
      `;
      console.log(`   ✓ Demo → ${demoOrg.slug} (member)`);

      // Demo user is member of team
      await tx`
        INSERT INTO tenant_users (tenant_id, user_id, role, accepted_at)
        VALUES (${demoTeam.id}, ${demoUser.id}, 'member', now())
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET
          role = 'member',
          updated_at = now()
      `;
      console.log(`   ✓ Demo → ${demoTeam.slug} (member)`);

      // Demo user owns personal workspace
      await tx`
        INSERT INTO tenant_users (tenant_id, user_id, role, accepted_at)
        VALUES (${personalWs.id}, ${demoUser.id}, 'owner', now())
        ON CONFLICT (tenant_id, user_id) DO UPDATE SET
          role = 'owner',
          updated_at = now()
      `;
      console.log(`   ✓ Demo → ${personalWs.slug} (owner)`);

      // 7. Create audit log entries
      console.log("📝 Creating audit log entries...");
      await tx`
        INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, metadata)
        VALUES
          (${demoOrg.id}, ${adminUser.id}, 'tenant.created', 'tenant', '{"name": "Acme Corporation"}'::jsonb),
          (${demoTeam.id}, ${adminUser.id}, 'tenant.created', 'tenant', '{"name": "Engineering Team"}'::jsonb),
          (${demoOrg.id}, ${adminUser.id}, 'member.invited', 'user', '{"email": "demo@nexuscanon.com"}'::jsonb)
      `;
      console.log("   ✓ 3 audit log entries created");
    });

    console.log("\n✅ Seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log("   - 2 users (admin + demo)");
    console.log("   - 3 tenants (org + team + personal)");
    console.log("   - 5 memberships");
    console.log("   - 3 audit log entries");
    console.log("\n🔑 Login credentials:");
    console.log(`   Admin: ${DEMO_DATA.adminUser.email}`);
    console.log(`   Demo:  ${DEMO_DATA.demoUser.email}`);
    console.log("\n   Note: Use Neon Auth for password management.");
    console.log("   These users have no password set - use register flow.");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run seed
seed();
