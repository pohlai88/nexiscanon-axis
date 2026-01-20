#!/usr/bin/env tsx
/**
 * Design System Auto-Fix Script
 * 
 * Automatically fixes cross-imports by converting:
 * - from '@workspace/design-system/lib/utils' → from '../../lib/utils'
 * - from '@workspace/design-system/components/button' → from './button'
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { glob } from 'glob';

const DS_ROOT = join(process.cwd(), 'packages/design-system');
const SRC_ROOT = join(DS_ROOT, 'src');

console.log('\n🔧 Auto-fixing design-system cross-imports...\n');

let totalFixed = 0;

const files = glob.sync('src/**/*.{ts,tsx}', { cwd: DS_ROOT });

for (const file of files) {
  const fullPath = join(DS_ROOT, file);
  const content = readFileSync(fullPath, 'utf-8');
  let modified = content;
  let fileFixed = 0;

  // Replace all @workspace/design-system/* imports with relative paths
  modified = modified.replace(
    /from\s+['"]@workspace\/design-system\/([^'"]+)['"]/g,
    (match, importPath) => {
      const currentDir = dirname(fullPath);
      const targetPath = join(SRC_ROOT, importPath);
      
      let relativePath = relative(currentDir, targetPath)
        .replace(/\\/g, '/')
        .replace(/\.tsx?$/, ''); // Remove extension
      
      // Ensure it starts with ./
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }

      fileFixed++;
      return `from '${relativePath}'`;
    }
  );

  if (fileFixed > 0) {
    writeFileSync(fullPath, modified, 'utf-8');
    console.log(`✓ Fixed ${fileFixed} imports in ${file}`);
    totalFixed += fileFixed;
  }
}

console.log(`\n✅ Fixed ${totalFixed} cross-imports across ${files.length} files\n`);
