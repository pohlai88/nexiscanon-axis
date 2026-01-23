#!/usr/bin/env tsx
/**
 * Local development setup script.
 *
 * Usage: pnpm axis:setup
 *
 * This script:
 * 1. Checks Node.js and pnpm versions
 * 2. Installs dependencies
 * 3. Creates .env.local from template
 * 4. Validates required environment variables
 * 5. Runs database health check
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  dim: "\x1b[2m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, "green");
}

function warn(message: string) {
  log(`⚠ ${message}`, "yellow");
}

function error(message: string) {
  log(`✗ ${message}`, "red");
}

function info(message: string) {
  log(`→ ${message}`, "blue");
}

function run(command: string, options?: { silent?: boolean }): string {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: options?.silent ? "pipe" : "inherit",
    });
  } catch (e) {
    return "";
  }
}

function getVersion(command: string): string {
  try {
    return execSync(command, { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

// Step 1: Check prerequisites
function checkPrerequisites() {
  log("\n📋 Checking prerequisites...\n", "blue");

  // Node.js
  const nodeVersion = getVersion("node --version");
  const nodeMajor = parseInt(nodeVersion.replace("v", "").split(".")[0] || "0");
  if (nodeMajor >= 20) {
    success(`Node.js ${nodeVersion}`);
  } else {
    error(`Node.js ${nodeVersion} (requires v20+)`);
    process.exit(1);
  }

  // pnpm
  const pnpmVersion = getVersion("pnpm --version");
  const pnpmMajor = parseInt(pnpmVersion.split(".")[0] || "0");
  if (pnpmMajor >= 9) {
    success(`pnpm ${pnpmVersion}`);
  } else {
    error(`pnpm ${pnpmVersion || "not found"} (requires v9+)`);
    info("Install pnpm: npm install -g pnpm");
    process.exit(1);
  }

  // Git
  const gitVersion = getVersion("git --version");
  if (gitVersion) {
    success(`Git ${gitVersion.replace("git version ", "")}`);
  } else {
    warn("Git not found (optional but recommended)");
  }
}

// Step 2: Install dependencies
function installDependencies() {
  log("\n📦 Installing dependencies...\n", "blue");

  run("pnpm install");
  success("Dependencies installed");
}

// Step 3: Setup environment
function setupEnvironment() {
  log("\n🔐 Setting up environment...\n", "blue");

  const envLocal = resolve(ROOT, ".env.local");
  const envSample = resolve(ROOT, ".envsamplelocal");

  if (existsSync(envLocal)) {
    success(".env.local already exists");
    return;
  }

  if (!existsSync(envSample)) {
    error(".envsamplelocal not found");
    process.exit(1);
  }

  copyFileSync(envSample, envLocal);
  success("Created .env.local from .envsamplelocal");
  warn("Please edit .env.local with your credentials");
}

// Step 4: Validate environment
function validateEnvironment() {
  log("\n🔍 Validating environment...\n", "blue");

  const envLocal = resolve(ROOT, ".env.local");
  if (!existsSync(envLocal)) {
    warn(".env.local not found - skipping validation");
    return;
  }

  const envContent = readFileSync(envLocal, "utf-8");
  const requiredVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_NEON_AUTH_URL",
    "JWKS_URL",
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    const regex = new RegExp(`^${varName}=.+`, "m");
    if (!regex.test(envContent)) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    warn(`Missing environment variables:`);
    for (const v of missingVars) {
      log(`  - ${v}`, "dim");
    }
    info("Edit .env.local to add these values");
  } else {
    success("Required environment variables present");
  }
}

// Step 5: Database check
function checkDatabase() {
  log("\n🗄️  Checking database connection...\n", "blue");

  const envLocal = resolve(ROOT, ".env.local");
  if (!existsSync(envLocal)) {
    warn("Skipping database check (no .env.local)");
    return;
  }

  const envContent = readFileSync(envLocal, "utf-8");
  const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m);

  if (!dbMatch || dbMatch[1].includes("your-project")) {
    warn("DATABASE_URL not configured yet");
    info("Get your connection string from: https://console.neon.tech");
    return;
  }

  success("DATABASE_URL is configured");
  info("Run 'pnpm dev --filter @axis/web' to start the app");
}

// Step 6: Print next steps
function printNextSteps() {
  log("\n✨ Setup complete!\n", "green");

  log("Next steps:", "blue");
  log("  1. Edit .env.local with your Neon credentials", "dim");
  log("  2. Run: pnpm dev --filter @axis/web", "dim");
  log("  3. Open: http://localhost:3000", "dim");
  log("");

  log("Useful commands:", "blue");
  log("  pnpm dev --filter @axis/web    Start dev server", "dim");
  log("  pnpm build --filter @axis/web  Build for production", "dim");
  log("  pnpm tsx scripts/seed.ts       Seed demo data", "dim");
  log("  pnpm lint                      Run linter", "dim");
  log("");

  log("Documentation:", "blue");
  log("  docs/tutorials/getting-started.md", "dim");
  log("  docs/HANDOFF.md", "dim");
  log("");
}

// Main
async function main() {
  log("\n🚀 NexusCanon AXIS - Development Setup\n", "blue");
  log("━".repeat(50), "dim");

  checkPrerequisites();
  installDependencies();
  setupEnvironment();
  validateEnvironment();
  checkDatabase();
  printNextSteps();
}

main().catch((e) => {
  error(`Setup failed: ${e.message}`);
  process.exit(1);
});
