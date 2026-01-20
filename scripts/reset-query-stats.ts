#!/usr/bin/env tsx
/**
 * Reset pg_stat_statements
 * Clears all query statistics (useful after testing or to start fresh)
 * 
 * Usage: tsx scripts/reset-query-stats.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Make sure .env file exists with DATABASE_URL set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('🔄 Resetting pg_stat_statements...\n');
  
  try {
    await sql`SELECT pg_stat_statements_reset()`;
    console.log('✅ Query statistics have been reset.\n');
    console.log('All counters and timings are now cleared.');
    console.log('New statistics will accumulate from now on.\n');
  } catch (error) {
    console.error('❌ Error resetting statistics:', error);
    process.exit(1);
  }
}

main().catch(console.error);
