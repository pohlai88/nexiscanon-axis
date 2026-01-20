#!/usr/bin/env tsx
/**
 * Validate Exports - Ensure Generated Exports Match Repository
 * 
 * Verifies that package.json exports and index.ts are up-to-date.
 * Run in CI to catch export drift.
 * 
 * Run: pnpm validate:exports
 * CI: Fails if exports need regeneration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DS_ROOT = path.join(process.cwd(), 'packages/design-system');
const PACKAGE_JSON_PATH = path.join(DS_ROOT, 'package.json');
const INDEX_PATH = path.join(DS_ROOT, 'index.ts');

async function main() {
  console.log('🔍 Validating design-system exports...\n');
  
  // Save current state
  const packageJsonBefore = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
  const indexBefore = fs.existsSync(INDEX_PATH) 
    ? fs.readFileSync(INDEX_PATH, 'utf-8')
    : '';
  
  // Regenerate
  console.log('📦 Regenerating exports...');
  try {
    execSync('pnpm gen:exports', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('❌ Failed to generate exports');
    process.exit(1);
  }
  
  // Check for differences
  const packageJsonAfter = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
  const indexAfter = fs.existsSync(INDEX_PATH)
    ? fs.readFileSync(INDEX_PATH, 'utf-8')
    : '';
  
  const packageJsonChanged = packageJsonBefore !== packageJsonAfter;
  const indexChanged = indexBefore !== indexAfter;
  
  if (packageJsonChanged || indexChanged) {
    console.error('\n❌ Export drift detected!');
    console.error('\nThe following files are out of sync:');
    
    if (packageJsonChanged) {
      console.error('  - packages/design-system/package.json');
    }
    if (indexChanged) {
      console.error('  - packages/design-system/src/index.ts');
    }
    
    console.error('\n💡 Fix by running: pnpm gen:exports');
    console.error('   Then commit the changes.\n');
    
    // Restore original files
    fs.writeFileSync(PACKAGE_JSON_PATH, packageJsonBefore);
    if (indexBefore) {
      fs.writeFileSync(INDEX_PATH, indexBefore);
    }
    
    process.exit(1);
  }
  
  console.log('\n✅ Exports are up-to-date!');
  console.log('   No export drift detected.\n');
}

main().catch(console.error);
