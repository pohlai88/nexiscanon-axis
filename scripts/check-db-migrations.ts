import { execSync } from "node:child_process";
import { resolve } from "node:path";

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

function diff(paths: string[]) {
  const p = paths.map((x) => `"${x}"`).join(" ");
  
  // Check working tree status
  try {
    execSync(`git diff --quiet -- ${p}`, { stdio: "pipe" });
    console.log("Working tree: CLEAN\n");
  } catch {
    // Get list of dirty files (first 10, with overflow indicator)
    try {
      const allFiles = execSync(`git diff --name-only -- ${p}`, { encoding: "utf-8" })
        .trim()
        .split("\n")
        .filter(Boolean);
      const shown = allFiles
        .slice(0, 10)
        .map((f) => f.replace("packages/db/", ""))
        .join(", ");
      const overflow = allFiles.length > 10 ? ` (+${allFiles.length - 10} more)` : "";
      console.log(`Working tree: DIRTY (${shown}${overflow})\n`);
    } catch {
      console.log("Working tree: DIRTY (packages/db/drizzle or schema.ts)\n");
    }
  }
  
  // Now run the actual diff (with output)
  execSync(`git diff --exit-code -- ${p}`, { stdio: "inherit" });
}

const configPath = resolve(process.cwd(), "packages/db/drizzle.config.ts");
const diffPaths = ["packages/db/drizzle", "packages/db/src/schema.ts"];

console.log(`Using config: ${configPath}`);
console.log(`Diff scope: ${diffPaths.join(", ")}\n`);

try {
  // 1) Regenerate migrations from current schema
  run("pnpm db:generate");

  // 2) Fail if anything changed (drift)
  diff(diffPaths);

  console.log("✅ check-db-migrations: OK (no drift detected)");
} catch (err) {
  console.error("");
  console.error("❌ DB drift detected.");
  console.error("");
  console.error("Note: drizzle-kit may report 'No schema changes' even when drift exists,");
  console.error("because this check also fails on uncommitted changes inside packages/db/drizzle/");
  console.error("");
  console.error("This means either:");
  console.error("  1. schema.ts changed but drizzle/ migrations not updated (run: pnpm db:generate)");
  console.error("  2. Uncommitted changes in packages/db/drizzle/ (stage/commit them)");
  console.error("");
  console.error("If (1): Run pnpm db:generate and commit the generated files.");
  console.error("If (2): Stage/commit your drizzle/ changes, including manual/ infra SQL.");
  console.error("");
  console.error("Tip: run 'git status -- packages/db/drizzle packages/db/src/schema.ts'");
  process.exit(1);
}
