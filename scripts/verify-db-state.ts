// scripts/verify-db-state.ts
// Comprehensive database state verification
// Usage: tsx scripts/verify-db-state.ts

import { getDb } from "@workspace/db";
import { sql } from "drizzle-orm";

const db = getDb();

async function main() {
  console.log("🔍 Comprehensive Database Verification\n");

  // 1. List all tables
  console.log("=== Tables ===");
  const tables = await db.execute(sql`
    SELECT table_name, table_type
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  tables.rows.forEach((row: any) => {
    console.log(`  ${row.table_name} (${row.table_type})`);
  });
  console.log(`Total: ${tables.rows.length}\n`);

  // 2. Count rows in each table (skip views)
  console.log("=== Row Counts ===");
  for (const row of tables.rows) {
    const tableName = (row as any).table_name;
    
    // Skip system views
    if (tableName.startsWith("pg_stat_")) {
      continue;
    }
    
    try {
      const count = await db.execute(
        sql.raw(`SELECT COUNT(*) as count FROM "${tableName}";`)
      );
      const rowCount = (count.rows[0] as any).count;
      console.log(`  ${tableName}: ${rowCount} rows`);
    } catch (e: any) {
      console.log(`  ${tableName}: (cannot count - ${e.message})`);
    }
  }
  
  // 3. Check for drizzle migrations
  console.log("\n=== Drizzle Migrations ===");
  try {
    const migrations = await db.execute(sql`
      SELECT * FROM __drizzle_migrations__ ORDER BY created_at;
    `);
    console.log(`  Applied migrations: ${migrations.rows.length}`);
    migrations.rows.forEach((m: any, i: number) => {
      console.log(`  ${i + 1}. ${m.hash} (${new Date(m.created_at).toISOString()})`);
    });
  } catch (e) {
    console.log("  No drizzle_migrations table found");
  }

  // 4. Check for foreign key constraints
  console.log("\n=== Foreign Key Constraints ===");
  const fks = await db.execute(sql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `);
  
  if (fks.rows.length > 0) {
    fks.rows.forEach((fk: any) => {
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
  } else {
    console.log("  No foreign keys found");
  }

  console.log("\n✅ Database verification complete");
}

main().catch((err) => {
  console.error("\n❌ Error:");
  console.error(err);
  process.exit(1);
});
