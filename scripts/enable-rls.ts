#!/usr/bin/env tsx
/**
 * Enable Row-Level Security on all public tables
 * 
 * WARNING: Once RLS is enabled, all access is blocked until policies are created!
 * 
 * Usage: tsx scripts/enable-rls.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const PUBLIC_TABLES = [
  'tenants',
  'users',
  'requests',
  'request_templates',
  'request_evidence_links',
  'evidence_files',
  'audit_logs',
];

async function enableRLS() {
  console.log('🔒 Enabling Row-Level Security...\n');

  for (const table of PUBLIC_TABLES) {
    try {
      await sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`;
      console.log(`✅ Enabled RLS on: ${table}`);
    } catch (error) {
      console.error(`❌ Failed to enable RLS on ${table}:`, error);
    }
  }

  console.log('\n📊 Verifying RLS status...\n');

  const status = await sql`
    SELECT 
      tablename,
      rowsecurity,
      CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
      END as status
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = ANY(${PUBLIC_TABLES})
    ORDER BY tablename
  `;

  console.table(status);

  const disabled = status.filter((s: any) => !s.rowsecurity);
  if (disabled.length > 0) {
    console.error(`\n⚠️  Warning: ${disabled.length} table(s) still have RLS disabled`);
    process.exit(1);
  }

  console.log('\n✅ RLS enabled on all public tables!');
  console.log('\n⚠️  IMPORTANT: All access is now blocked until policies are created.');
  console.log('Next step: Run pnpm rls:create-policies\n');
}

enableRLS().catch(console.error);
