import { execSync } from "node:child_process";
import { resolve } from "node:path";

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

function diff(paths: string[]) {
  const p = paths.map((x) => `"${x}"`).join(" ");
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
} catch {
  console.error("");
  console.error("❌ DB drift detected.");
  console.error(
    "Run: pnpm db:generate and commit the changes in packages/db/drizzle/"
  );
  process.exit(1);
}
