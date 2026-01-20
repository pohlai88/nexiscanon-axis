#!/usr/bin/env tsx
/**
 * Query Performance Monitor using pg_stat_statements
 * 
 * Shows top slow queries, most frequent queries, and performance metrics
 * 
 * Usage: 
 *   tsx scripts/query-performance.ts
 *   tsx scripts/query-performance.ts --limit 20
 *   tsx scripts/query-performance.ts --min-time 1000
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

const args = process.argv.slice(2);
const limit = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10');
const minTime = parseInt(args.find(arg => arg.startsWith('--min-time='))?.split('=')[1] || '100');

interface QueryStats {
  query: string;
  calls: number;
  total_exec_time: number;
  mean_exec_time: number;
  min_exec_time: number;
  max_exec_time: number;
  stddev_exec_time: number;
  rows: number;
}

async function getTopSlowQueries(limit: number = 10): Promise<QueryStats[]> {
  const result = await sql`
    SELECT 
      query,
      calls,
      total_exec_time,
      mean_exec_time,
      min_exec_time,
      max_exec_time,
      stddev_exec_time,
      rows
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat_statements%'
    ORDER BY mean_exec_time DESC
    LIMIT ${limit}
  `;
  return result as QueryStats[];
}

async function getMostFrequentQueries(limit: number = 10): Promise<QueryStats[]> {
  const result = await sql`
    SELECT 
      query,
      calls,
      total_exec_time,
      mean_exec_time,
      min_exec_time,
      max_exec_time,
      stddev_exec_time,
      rows
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat_statements%'
    ORDER BY calls DESC
    LIMIT ${limit}
  `;
  return result as QueryStats[];
}

async function getSlowQueriesAboveThreshold(minTimeMs: number): Promise<QueryStats[]> {
  const result = await sql`
    SELECT 
      query,
      calls,
      total_exec_time,
      mean_exec_time,
      min_exec_time,
      max_exec_time,
      stddev_exec_time,
      rows
    FROM pg_stat_statements
    WHERE mean_exec_time > ${minTimeMs}
      AND query NOT LIKE '%pg_stat_statements%'
    ORDER BY mean_exec_time DESC
  `;
  return result as QueryStats[];
}

function formatTime(ms: number): string {
  if (ms < 1) return `${ms.toFixed(3)}ms`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function truncateQuery(query: string, maxLength: number = 80): string {
  const cleaned = query.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
}

async function main() {
  console.log('🔍 Query Performance Monitor\n');
  console.log('=' .repeat(100));
  
  // Top Slow Queries (by mean execution time)
  console.log('\n📊 Top Slow Queries (by average execution time)\n');
  const slowQueries = await getTopSlowQueries(limit);
  
  if (slowQueries.length === 0) {
    console.log('   No queries found. Run some queries first.');
  } else {
    slowQueries.forEach((q, i) => {
      console.log(`${i + 1}. ${truncateQuery(q.query)}`);
      console.log(`   Calls: ${q.calls} | Avg: ${formatTime(q.mean_exec_time)} | Min: ${formatTime(q.min_exec_time)} | Max: ${formatTime(q.max_exec_time)}`);
      console.log(`   Total Time: ${formatTime(q.total_exec_time)} | Rows: ${q.rows}\n`);
    });
  }
  
  // Most Frequent Queries
  console.log('=' .repeat(100));
  console.log('\n📈 Most Frequent Queries\n');
  const frequentQueries = await getMostFrequentQueries(limit);
  
  if (frequentQueries.length === 0) {
    console.log('   No queries found.');
  } else {
    frequentQueries.forEach((q, i) => {
      console.log(`${i + 1}. ${truncateQuery(q.query)}`);
      console.log(`   Calls: ${q.calls} | Avg: ${formatTime(q.mean_exec_time)} | Total: ${formatTime(q.total_exec_time)}`);
      console.log(`   Rows: ${q.rows}\n`);
    });
  }
  
  // Queries above threshold
  if (minTime > 0) {
    console.log('=' .repeat(100));
    console.log(`\n⚠️  Queries Slower Than ${minTime}ms\n`);
    const thresholdQueries = await getSlowQueriesAboveThreshold(minTime);
    
    if (thresholdQueries.length === 0) {
      console.log(`   ✅ No queries exceed ${minTime}ms threshold.\n`);
    } else {
      thresholdQueries.forEach((q, i) => {
        console.log(`${i + 1}. ${truncateQuery(q.query)}`);
        console.log(`   Avg: ${formatTime(q.mean_exec_time)} | Calls: ${q.calls} | Total: ${formatTime(q.total_exec_time)}\n`);
      });
    }
  }
  
  console.log('=' .repeat(100));
  console.log('\n💡 Tips:');
  console.log('   - Run with --limit=20 to see more queries');
  console.log('   - Run with --min-time=500 to find queries slower than 500ms');
  console.log('   - Use EXPLAIN ANALYZE to investigate slow queries');
  console.log('   - Consider adding indexes for frequently slow queries\n');
}

main().catch(console.error);
