// scripts/inspect-db.ts
// Inspect and optionally clean database tables
// Usage: tsx scripts/inspect-db.ts [--drop]

import { getDb } from "@workspace/db";
import { sql } from "drizzle-orm";

const db = getDb();

async function main() {
  const shouldDrop = process.argv.includes("--drop");

  console.log("🔍 Inspecting database tables...\n");

  // List all tables in public schema
  const tables = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  if (tables.rows.length === 0) {
    console.log("No tables found in public schema.");
    return;
  }

  console.log(`Found ${tables.rows.length} table(s):`);
  tables.rows.forEach((row: any) => {
    console.log(`  - ${row.table_name}`);
  });

  if (shouldDrop) {
    console.log("\n⚠️  Dropping all tables and views...");
    
    // Drop tables (skip system views)
    for (const row of tables.rows) {
      const tableName = (row as any).table_name;
      
      // Skip pg_stat_statements and other system views
      if (tableName.startsWith("pg_stat_")) {
        console.log(`  Skipping system view: ${tableName}`);
        continue;
      }
      
      console.log(`  Dropping: ${tableName}`);
      
      // Try as table first, then as view if that fails
      try {
        await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`));
      } catch (e: any) {
        if (e.code === "42809") { // Wrong object type
          await db.execute(sql.raw(`DROP VIEW IF EXISTS "${tableName}" CASCADE;`));
        } else {
          throw e;
        }
      }
    }
    
    console.log("\n✅ All tables dropped.");
  } else {
    console.log("\nTo drop all tables, run: tsx scripts/inspect-db.ts --drop");
  }
}

main().catch((err) => {
  console.error("\n❌ Error:");
  console.error(err);
  process.exit(1);
});
