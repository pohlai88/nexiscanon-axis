#!/usr/bin/env tsx
/**
 * Design System Deep Audit Script
 * 
 * Checks for:
 * 1. Cross-imports using @workspace/design-system/* instead of relative paths
 * 2. Missing exports in index.ts
 * 3. Inconsistent import patterns
 * 4. Package.json export surface coverage
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { glob } from 'glob';

interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  file: string;
  line: number;
  message: string;
  fix?: string;
}

const issues: AuditIssue[] = [];
const DS_ROOT = join(process.cwd(), 'packages/design-system');
const SRC_ROOT = join(DS_ROOT, 'src');

// Color output helpers
const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

console.log(colors.blue('\n═══════════════════════════════════════════════════════'));
console.log(colors.blue('  Design System Deep Audit'));
console.log(colors.blue('═══════════════════════════════════════════════════════\n'));

/**
 * Check 1: Cross-imports using @workspace/design-system/* instead of relative
 */
function checkCrossImports() {
  console.log(colors.blue('▶ Checking for cross-imports using @workspace/design-system/*...'));
  
  const files = glob.sync('src/**/*.{ts,tsx}', { cwd: DS_ROOT });
  let count = 0;

  for (const file of files) {
    const fullPath = join(DS_ROOT, file);
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // Match: import { X } from '@workspace/design-system/...'
      const match = line.match(/from\s+['"]@workspace\/design-system\/([^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        
        // Calculate what the relative path should be
        const currentDir = join(DS_ROOT, file.replace(/\/[^/]+$/, ''));
        const targetPath = join(SRC_ROOT, importPath);
        const relativePath = relative(currentDir, targetPath)
          .replace(/\\/g, '/')
          .replace(/^(?!\.)/, './');

        issues.push({
          severity: 'error',
          file,
          line: idx + 1,
          message: `Cross-import using @workspace/design-system/${importPath}`,
          fix: `Change to: from '${relativePath}'`,
        });
        count++;
      }
    });
  }

  console.log(count === 0 
    ? colors.green(`  ✓ No cross-imports found\n`)
    : colors.red(`  ✗ Found ${count} cross-imports\n`)
  );
}

/**
 * Check 2: Components exported from index.ts
 */
function checkExportCoverage() {
  console.log(colors.blue('▶ Checking export coverage in index.ts...'));
  
  const indexPath = join(SRC_ROOT, 'index.ts');
  const indexContent = readFileSync(indexPath, 'utf-8');
  
  // Find all component files
  const componentFiles = glob.sync('src/components/*.{ts,tsx}', { cwd: DS_ROOT })
    .map(f => f.replace('src/components/', '').replace(/\.(ts|tsx)$/, ''));
  
  const missingExports: string[] = [];
  
  for (const component of componentFiles) {
    const exportLine = `export * from "./components/${component}"`;
    if (!indexContent.includes(exportLine)) {
      missingExports.push(component);
      issues.push({
        severity: 'warning',
        file: 'src/index.ts',
        line: 0,
        message: `Component "${component}" not exported`,
        fix: `Add: ${exportLine}`,
      });
    }
  }

  console.log(missingExports.length === 0
    ? colors.green(`  ✓ All ${componentFiles.length} components exported\n`)
    : colors.yellow(`  ⚠ ${missingExports.length} components not exported: ${missingExports.join(', ')}\n`)
  );
}

/**
 * Check 3: package.json exports coverage
 */
function checkPackageExports() {
  console.log(colors.blue('▶ Checking package.json exports coverage...'));
  
  const pkgPath = join(DS_ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const exports = pkg.exports || {};
  
  // Find all component files
  const componentFiles = glob.sync('src/components/*.{ts,tsx}', { cwd: DS_ROOT })
    .map(f => f.replace('src/components/', '').replace(/\.(ts|tsx)$/, ''));
  
  const missingPkgExports: string[] = [];
  
  for (const component of componentFiles) {
    const exportKey = `./${component}`;
    if (!exports[exportKey]) {
      missingPkgExports.push(component);
      issues.push({
        severity: 'info',
        file: 'package.json',
        line: 0,
        message: `Component "${component}" not in package.json exports`,
        fix: `Add: "${exportKey}": "./src/components/${component}.tsx"`,
      });
    }
  }

  console.log(missingPkgExports.length === 0
    ? colors.green(`  ✓ All ${componentFiles.length} components in package.json exports\n`)
    : colors.gray(`  ℹ ${missingPkgExports.length} components not in package.json exports (optional)\n`)
  );
}

/**
 * Check 4: Unused CSS theme files
 */
function checkUnusedThemes() {
  console.log(colors.blue('▶ Checking for unused theme CSS files...'));
  
  const themesDir = join(SRC_ROOT, 'styles/themes');
  const themeFiles = readdirSync(themesDir)
    .filter(f => f.endsWith('.css'))
    .map(f => f.replace('.css', ''));
  
  const themeTokensPath = join(SRC_ROOT, 'tokens/theme.ts');
  const themeTokensContent = readFileSync(themeTokensPath, 'utf-8');
  
  const unusedThemes: string[] = [];
  
  for (const theme of themeFiles) {
    if (!themeTokensContent.includes(`"${theme}"`)) {
      unusedThemes.push(theme);
      issues.push({
        severity: 'warning',
        file: `styles/themes/${theme}.css`,
        line: 0,
        message: `Theme "${theme}" not registered in tokens/theme.ts`,
        fix: `Add to ThemeName type and THEME_NAMES array`,
      });
    }
  }

  console.log(unusedThemes.length === 0
    ? colors.green(`  ✓ All ${themeFiles.length} theme files registered\n`)
    : colors.yellow(`  ⚠ ${unusedThemes.length} unused themes: ${unusedThemes.join(', ')}\n`)
  );
}

/**
 * Check 5: Duplicate exports
 */
function checkDuplicateExports() {
  console.log(colors.blue('▶ Checking for duplicate exports in index.ts...'));
  
  const indexPath = join(SRC_ROOT, 'index.ts');
  const indexContent = readFileSync(indexPath, 'utf-8');
  const lines = indexContent.split('\n');
  
  const exportLines = new Map<string, number[]>();
  
  lines.forEach((line, idx) => {
    const match = line.match(/export \* from ['"](.+)['"]/);
    if (match) {
      const path = match[1];
      if (!exportLines.has(path)) {
        exportLines.set(path, []);
      }
      exportLines.get(path)!.push(idx + 1);
    }
  });
  
  let duplicates = 0;
  for (const [path, lineNumbers] of exportLines) {
    if (lineNumbers.length > 1) {
      duplicates++;
      issues.push({
        severity: 'error',
        file: 'src/index.ts',
        line: lineNumbers[1],
        message: `Duplicate export: "${path}" (also on line ${lineNumbers[0]})`,
        fix: 'Remove duplicate line',
      });
    }
  }

  console.log(duplicates === 0
    ? colors.green(`  ✓ No duplicate exports\n`)
    : colors.red(`  ✗ Found ${duplicates} duplicate exports\n`)
  );
}

// Run all checks
checkCrossImports();
checkExportCoverage();
checkPackageExports();
checkUnusedThemes();
checkDuplicateExports();

// Print summary
console.log(colors.blue('═══════════════════════════════════════════════════════'));
console.log(colors.blue('  Summary'));
console.log(colors.blue('═══════════════════════════════════════════════════════\n'));

const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');
const infos = issues.filter(i => i.severity === 'info');

console.log(`${colors.red('Errors:  ')} ${errors.length}`);
console.log(`${colors.yellow('Warnings:')} ${warnings.length}`);
console.log(`${colors.gray('Info:    ')} ${infos.length}`);
console.log();

// Print detailed issues
if (issues.length > 0) {
  console.log(colors.blue('═══════════════════════════════════════════════════════'));
  console.log(colors.blue('  Detailed Issues'));
  console.log(colors.blue('═══════════════════════════════════════════════════════\n'));

  const grouped = {
    error: errors,
    warning: warnings,
    info: infos,
  };

  for (const [severity, items] of Object.entries(grouped)) {
    if (items.length === 0) continue;

    const colorFn = severity === 'error' ? colors.red : severity === 'warning' ? colors.yellow : colors.gray;
    console.log(colorFn(`\n${severity.toUpperCase()}S:\n`));

    for (const issue of items) {
      console.log(colorFn(`  ${issue.file}${issue.line ? `:${issue.line}` : ''}`));
      console.log(`    ${issue.message}`);
      if (issue.fix) {
        console.log(colors.gray(`    → ${issue.fix}`));
      }
      console.log();
    }
  }
}

// Exit code
const exitCode = errors.length > 0 ? 1 : 0;
console.log(colors.blue('═══════════════════════════════════════════════════════\n'));
console.log(exitCode === 0 
  ? colors.green('✓ Audit complete - no errors')
  : colors.red('✗ Audit complete - errors found')
);
console.log();

process.exit(exitCode);
