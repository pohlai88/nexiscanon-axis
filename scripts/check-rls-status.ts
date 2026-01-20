#!/usr/bin/env tsx
/**
 * Check RLS Status on All Tables
 * 
 * Verifies that:
 * 1. All public tables have RLS enabled
 * 2. All tables with RLS have at least one policy
 * 
 * FAILS if any security gaps found
 * 
 * Usage: tsx scripts/check-rls-status.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status on all tables...\n');

  try {
    // Get all tables with RLS status and policy count
    const tables = await sql`
      SELECT 
        t.schemaname,
        t.tablename,
        t.rowsecurity,
        COALESCE(p.policy_count, 0) as policy_count
      FROM pg_tables t
      LEFT JOIN (
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
      ) p ON t.tablename = p.tablename
      WHERE t.schemaname = 'public'
      ORDER BY t.tablename
    `;

    console.log('📊 Table Security Status:\n');
    
    // Format table output
    const formatted = tables.map((t: any) => ({
      table: t.tablename,
      rls: t.rowsecurity ? '✅ Enabled' : '❌ DISABLED',
      policies: t.policy_count,
      status: t.rowsecurity 
        ? (t.policy_count > 0 ? '✅ Secure' : '⚠️  No policies')
        : '🚨 RISK'
    }));

    console.table(formatted);

    // Check for security issues
    let hasErrors = false;
    const issues = [];

    // Issue 1: Tables without RLS
    const noRLS = tables.filter((t: any) => !t.rowsecurity);
    if (noRLS.length > 0) {
      issues.push({
        severity: '🚨 CRITICAL',
        issue: 'Tables without RLS',
        count: noRLS.length,
        tables: noRLS.map((t: any) => t.tablename)
      });
      hasErrors = true;
    }

    // Issue 2: Tables with RLS but no policies
    const noPolicies = tables.filter((t: any) => t.rowsecurity && t.policy_count === 0);
    if (noPolicies.length > 0) {
      issues.push({
        severity: '⚠️  WARNING',
        issue: 'Tables with RLS but no policies (access blocked)',
        count: noPolicies.length,
        tables: noPolicies.map((t: any) => t.tablename)
      });
      // This is a warning, not an error (intentional lockdown)
    }

    // Report issues
    if (issues.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔒 Security Issues Found:\n');
      
      issues.forEach(issue => {
        console.log(`${issue.severity}: ${issue.issue}`);
        console.log(`   Count: ${issue.count}`);
        console.log(`   Tables:`);
        issue.tables.forEach((t: string) => console.log(`      - ${t}`));
        console.log('');
      });

      if (hasErrors) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n❌ RLS check FAILED!\n');
        console.log('🔧 To fix:');
        console.log('   1. Enable RLS:');
        console.log('      pnpm rls:enable\n');
        console.log('   2. Create helper functions:');
        console.log('      pnpm rls:create-functions\n');
        console.log('   3. Apply policies:');
        console.log('      See: docs/NEON-DATA-API-SECURITY.md (Phase 4)\n');
        console.log('   4. Verify:');
        console.log('      pnpm rls:check\n');
        
        process.exit(1);
      }
    }

    // Success
    const totalTables = tables.length;
    const securedTables = tables.filter((t: any) => t.rowsecurity && t.policy_count > 0).length;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ RLS Security Check Passed!\n');
    console.log(`   Total tables: ${totalTables}`);
    console.log(`   Secured with RLS + policies: ${securedTables}`);
    console.log(`   Coverage: ${Math.round((securedTables / totalTables) * 100)}%\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error checking RLS status:', error);
    process.exit(1);
  }
}

checkRLSStatus().catch(console.error);
