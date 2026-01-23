#!/usr/bin/env tsx
/**
 * Analyze local components vs shadcn registry to identify required overrides
 *
 * Usage: pnpm analyze:overrides [component]
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

interface ComponentsConfig {
  style: string;
}

function loadConfig(): ComponentsConfig {
  const configPath = join(ROOT, 'components.json');
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

function transformImports(content: string): string {
  let result = content;
  result = result.replace(/@\/lib\/utils/g, '../lib/utils');
  result = result.replace(/@\/registry\/new-york-v4\/ui\//g, './');
  result = result.replace(/@\/registry\/[^/]+\/ui\//g, './');
  result = result.replace(/@\/hooks\//g, '../hooks/');
  result = result.replace(/@\/components\/ui\//g, './');
  result = result.replace(/@\/components\//g, './');
  return result;
}

async function fetchFromRegistry(
  componentName: string,
  style: string,
): Promise<string | null> {
  try {
    const url = `https://ui.shadcn.com/r/styles/${style}/${componentName}.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.files && data.files[0]) {
      return transformImports(data.files[0].content);
    }
    return null;
  } catch {
    return null;
  }
}

function extractExports(content: string): string[] {
  const exports: string[] = [];

  // Match: export { X, Y, Z }
  const namedExports = content.match(/export\s*\{\s*([^}]+)\s*\}/g);
  if (namedExports) {
    namedExports.forEach((match) => {
      const names = match
        .replace(/export\s*\{/, '')
        .replace(/\}/, '')
        .split(',');
      names.forEach((n) => {
        const parts = n.trim().split(/\s+as\s+/);
        const clean = parts[0]?.trim();
        if (clean && !clean.startsWith('type')) exports.push(clean);
      });
    });
  }

  // Match: export type { X }
  const typeExports = content.match(/export\s+type\s*\{\s*([^}]+)\s*\}/g);
  if (typeExports) {
    typeExports.forEach((match) => {
      const names = match
        .replace(/export\s+type\s*\{/, '')
        .replace(/\}/, '')
        .split(',');
      names.forEach((n) => {
        const clean = n.trim();
        if (clean) exports.push(`type:${clean}`);
      });
    });
  }

  return exports.sort();
}

function extractFunctions(content: string): string[] {
  const functions: string[] = [];
  const matches = content.matchAll(
    /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm,
  );
  for (const match of matches) {
    const name = match[1];
    if (name) functions.push(name);
  }
  return functions.sort();
}

function extractVariants(content: string): Record<string, string[]> {
  const variants: Record<string, string[]> = {};

  // Find variant blocks
  const variantMatch = content.match(
    /variants:\s*\{([\s\S]*?)\n\s*\},?\s*\n\s*defaultVariants/,
  );
  if (variantMatch) {
    const variantBlock = variantMatch[1];
    if (variantBlock) {
      const variantGroups = variantBlock.matchAll(/(\w+):\s*\{([^}]+)\}/g);
      for (const group of variantGroups) {
        const name = group[1];
        const optionsStr = group[2];
        if (name && optionsStr) {
          const options = optionsStr.matchAll(/"?(\w+[-\w]*)"?:/g);
          variants[name] = [];
          for (const opt of options) {
            const optName = opt[1];
            if (optName) {
              variants[name].push(optName);
            }
          }
        }
      }
    }
  }

  return variants;
}

interface AnalysisResult {
  component: string;
  status: 'local-only' | 'shadcn-match' | 'has-overrides';
  localExports: string[];
  shadcnExports: string[];
  addedExports: string[];
  removedExports: string[];
  localVariants: Record<string, string[]>;
  shadcnVariants: Record<string, string[]>;
  addedVariants: Record<string, string[]>;
  localFunctions: string[];
  shadcnFunctions: string[];
  addedFunctions: string[];
}

async function analyzeComponent(
  componentName: string,
): Promise<AnalysisResult> {
  const config = loadConfig();
  const localPath = join(ROOT, 'src/components', `${componentName}.tsx`);

  const result: AnalysisResult = {
    component: componentName,
    status: 'shadcn-match',
    localExports: [],
    shadcnExports: [],
    addedExports: [],
    removedExports: [],
    localVariants: {},
    shadcnVariants: {},
    addedVariants: {},
    localFunctions: [],
    shadcnFunctions: [],
    addedFunctions: [],
  };

  if (!existsSync(localPath)) {
    return result;
  }

  const localContent = readFileSync(localPath, 'utf-8');
  const shadcnContent = await fetchFromRegistry(componentName, config.style);

  if (!shadcnContent) {
    result.status = 'local-only';
    result.localExports = extractExports(localContent);
    result.localFunctions = extractFunctions(localContent);
    result.localVariants = extractVariants(localContent);
    return result;
  }

  // Compare exports
  result.localExports = extractExports(localContent);
  result.shadcnExports = extractExports(shadcnContent);
  result.addedExports = result.localExports.filter(
    (e) => !result.shadcnExports.includes(e),
  );
  result.removedExports = result.shadcnExports.filter(
    (e) => !result.localExports.includes(e),
  );

  // Compare functions
  result.localFunctions = extractFunctions(localContent);
  result.shadcnFunctions = extractFunctions(shadcnContent);
  result.addedFunctions = result.localFunctions.filter(
    (f) => !result.shadcnFunctions.includes(f),
  );

  // Compare variants
  result.localVariants = extractVariants(localContent);
  result.shadcnVariants = extractVariants(shadcnContent);

  for (const [key, values] of Object.entries(result.localVariants)) {
    const shadcnValues = result.shadcnVariants[key] || [];
    const added = values.filter((v) => !shadcnValues.includes(v));
    if (added.length > 0) {
      result.addedVariants[key] = added;
    }
  }

  // Determine status
  if (
    result.addedExports.length > 0 ||
    result.addedFunctions.length > 0 ||
    Object.keys(result.addedVariants).length > 0
  ) {
    result.status = 'has-overrides';
  }

  return result;
}

async function analyzeAll(): Promise<void> {
  const componentsDir = join(ROOT, 'src/components');
  const files = readdirSync(componentsDir).filter((f) => f.endsWith('.tsx'));

  const localOnly: AnalysisResult[] = [];
  const hasOverrides: AnalysisResult[] = [];
  const shadcnMatch: AnalysisResult[] = [];

  console.log('🔍 Analyzing components...\n');

  for (const file of files) {
    const name = file.replace('.tsx', '');
    process.stdout.write(`  Analyzing ${name}...`);
    const result = await analyzeComponent(name);

    if (result.status === 'local-only') {
      localOnly.push(result);
      console.log(' 🏠 local-only');
    } else if (result.status === 'has-overrides') {
      hasOverrides.push(result);
      console.log(' 🔧 has-overrides');
    } else {
      shadcnMatch.push(result);
      console.log(' ✅ shadcn-match');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n🏠 LOCAL-ONLY (${localOnly.length}) - shadcn does not have:`);
  localOnly.forEach((r) => {
    console.log(`   - ${r.component}`);
  });

  console.log(
    `\n🔧 HAS OVERRIDES (${hasOverrides.length}) - need .shadcn-overrides/*.ts:`,
  );
  hasOverrides.forEach((r) => {
    console.log(`\n   ${r.component}:`);
    if (r.addedExports.length > 0) {
      console.log(`     + Exports: ${r.addedExports.join(', ')}`);
    }
    if (r.addedFunctions.length > 0) {
      console.log(`     + Functions: ${r.addedFunctions.join(', ')}`);
    }
    if (Object.keys(r.addedVariants).length > 0) {
      for (const [key, values] of Object.entries(r.addedVariants)) {
        console.log(`     + Variants[${key}]: ${values.join(', ')}`);
      }
    }
  });

  console.log(`\n✅ SHADCN-MATCH (${shadcnMatch.length}) - can sync directly:`);
  shadcnMatch.forEach((r) => {
    console.log(`   - ${r.component}`);
  });
}

// CLI
const args = process.argv.slice(2);
const componentName = args[0];

if (componentName && !componentName.startsWith('--')) {
  analyzeComponent(componentName).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });
} else {
  analyzeAll();
}
