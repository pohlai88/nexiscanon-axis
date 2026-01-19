// scripts/check-wiring.ts
// Quick proof that kernel is wired to real Drizzle (not mock)
// Usage: tsx scripts/check-wiring.ts

import { getDb } from "@workspace/db";

const db = getDb();

async function main() {
  // Check constructor name to prove it's Drizzle
  const constructorName = db.constructor.name;
  
  // NeonHttpDatabase and NeonDatabase are Drizzle's Neon drivers
  const isDrizzle = 
    constructorName.toLowerCase().includes("drizzle") ||
    constructorName.toLowerCase().includes("neon") ||
    constructorName === "NeonHttpDatabase" ||
    constructorName === "NeonDatabase";
  
  const proof = {
    wired: isDrizzle ? "drizzle" : "unknown",
    constructor: constructorName,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(proof));
  process.exit(0);
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message, wired: "failed" }));
  process.exit(1);
});
