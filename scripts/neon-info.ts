// scripts/neon-info.ts
// Extract Neon project information from DATABASE_URL

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

try {
  const url = new URL(dbUrl);
  
  console.log("📊 Neon Database Information\n");
  console.log("=== Connection Details (non-secret) ===");
  console.log(`  Host: ${url.hostname}`);
  console.log(`  Database: ${url.pathname.slice(1).split("?")[0]}`);
  console.log(`  User: ${url.username}`);
  console.log(`  SSL Mode: ${url.searchParams.get("sslmode") || "unknown"}`);
  
  // Extract region from hostname (e.g., ap-southeast-1 from ep-xxx-pooler.ap-southeast-1.aws.neon.tech)
  const hostParts = url.hostname.split(".");
  const region = hostParts.find(part => part.includes("southeast") || part.includes("us-") || part.includes("eu-"));
  if (region) {
    console.log(`  Region: ${region}`);
  }
  
  // Extract endpoint name from hostname
  const endpointMatch = url.hostname.match(/^(ep-[^-]+-[^-]+)/);
  if (endpointMatch) {
    console.log(`  Endpoint: ${endpointMatch[1]}`);
  }
  
  console.log("\n✅ Information extracted");
} catch (e: any) {
  console.error("❌ Invalid DATABASE_URL:", e.message);
  process.exit(1);
}
