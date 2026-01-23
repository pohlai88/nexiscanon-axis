#!/usr/bin/env tsx
/**
 * Sync script for shadcn/ui components
 *
 * Usage:
 *   pnpm sync:shadcn:check        - Check for updates
 *   pnpm sync:shadcn <component>  - Sync specific component
 *   pnpm sync:shadcn:all          - Sync all components
 *
 * Overrides:
 *   After syncing, the script automatically applies patches from
 *   .shadcn-overrides/{component}.ts if the file exists.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath, pathToFileURL  } from 'url';

import type { ComponentOverride } from '../.shadcn-overrides/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

interface ComponentsConfig {
  style: string;
  registries?: Record<string, string>;
  aliases?: Record<string, string>;
}

function loadConfig(): ComponentsConfig {
  const configPath = join(ROOT, 'components.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  return config;
}

/**
 * Transform registry path to local component path
 * e.g., "registry/new-york-v4/ui/button.tsx" -> "src/components/button.tsx"
 */
function transformPath(registryPath: string): string {
  const filename = basename(registryPath);

  // UI components go to src/components/
  if (registryPath.includes('/ui/')) {
    return `src/components/${filename}`;
  }

  // Hooks go to src/hooks/
  if (registryPath.includes('/hooks/')) {
    return `src/hooks/${filename}`;
  }

  // Lib files go to src/lib/
  if (registryPath.includes('/lib/')) {
    return `src/lib/${filename}`;
  }

  // Default: put in src/components/
  return `src/components/${filename}`;
}

/**
 * Generate sync metadata header
 */
function generateSyncHeader(componentName: string, style: string): string {
  const now = new Date().toISOString();
  const sourceUrl = `https://ui.shadcn.com/r/styles/${style}/${componentName}.json`;

  return `/**
 * @shadcn-sync
 * @source ${sourceUrl}
 * @synced ${now}
 * @version ${style}
 *
 * DO NOT EDIT DIRECTLY - use \`pnpm sync:shadcn ${componentName}\` to update.
 * Local overrides are auto-applied from \`.shadcn-overrides/${componentName}.ts\`
 */

`;
}

/**
 * Remove existing sync header if present
 */
function removeSyncHeader(content: string): string {
  // Match the sync header block
  const headerPattern = /^\/\*\*\s*\n\s*\*\s*@shadcn-sync[\s\S]*?\*\/\s*\n\n?/;
  return content.replace(headerPattern, '');
}

/**
 * Load and apply overrides for a component
 * Returns the patched content and a list of applied patches
 */
async function applyOverrides(
  componentName: string,
  content: string,
): Promise<{ content: string; applied: string[]; failed: string[] }> {
  const overridePath = join(ROOT, '.shadcn-overrides', `${componentName}.ts`);

  if (!existsSync(overridePath)) {
    return { content, applied: [], failed: [] };
  }

  try {
    // Dynamic import of the override file
    const overrideUrl = pathToFileURL(overridePath).href;
    const overrideModule = await import(overrideUrl);
    const override: ComponentOverride = overrideModule.default;

    let result = content;
    const applied: string[] = [];
    const failed: string[] = [];

    for (const patch of override.patches) {
      if (result.includes(patch.find)) {
        result = result.replace(patch.find, patch.replace);
        applied.push(patch.id);
      } else {
        failed.push(`${patch.id} (find string not found)`);
      }
    }

    return { content: result, applied, failed };
  } catch (error) {
    console.error(`   ⚠️  Failed to load overrides: ${error}`);
    return { content, applied: [], failed: ['module load failed'] };
  }
}

/**
 * Transform import paths from shadcn format to workspace format
 */
function transformImports(content: string): string {
  let result = content;

  // Transform @/lib/utils -> ../lib/utils
  result = result.replace(/@\/lib\/utils/g, '../lib/utils');

  // Transform @/registry/new-york-v4/ui/* -> ./*
  result = result.replace(/@\/registry\/new-york-v4\/ui\//g, './');
  result = result.replace(/@\/registry\/[^/]+\/ui\//g, './');

  // Transform @/hooks/* -> ../hooks/*
  result = result.replace(/@\/hooks\//g, '../hooks/');

  // Transform @/components/ui/* -> ./*
  result = result.replace(/@\/components\/ui\//g, './');
  result = result.replace(/@\/components\//g, './');

  return result;
}

async function fetchComponentFromRegistry(
  componentName: string,
  registryUrl: string,
): Promise<{ files: Array<{ path: string; content: string }> } | null> {
  try {
    const url = registryUrl.replace('{name}', componentName);
    console.log(`   Fetching from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`   HTTP ${response.status}: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${componentName}:`, error);
    return null;
  }
}

async function syncComponent(
  componentName: string,
  dryRun = false,
): Promise<boolean> {
  const config = loadConfig();
  const registryUrl =
    config.registries?.['@shadcn'] ||
    `https://ui.shadcn.com/r/styles/${config.style}/${componentName}.json`;

  console.log(`📦 Fetching ${componentName} from registry...`);
  const componentData = await fetchComponentFromRegistry(
    componentName,
    registryUrl,
  );

  if (!componentData) {
    console.error(`❌ Component ${componentName} not found in registry`);
    return false;
  }

  if (dryRun) {
    console.log(`🔍 [DRY RUN] Would sync ${componentName}:`);
    componentData.files.forEach((file) => {
      const localPath = transformPath(file.path);
      console.log(`   ${file.path} -> ${localPath}`);
    });
    return true;
  }

  // Write component files
  for (const file of componentData.files) {
    const localPath = transformPath(file.path);
    const targetPath = join(ROOT, localPath);
    const targetDir = dirname(targetPath);

    // Skip if in custom/ directory
    if (localPath.includes('/custom/')) {
      console.log(`⏭️  Skipping custom component: ${localPath}`);
      continue;
    }

    // Check if file exists and warn
    if (existsSync(targetPath)) {
      console.log(`⚠️  Overwriting existing file: ${localPath}`);
    }

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Transform imports in content
    let transformedContent = transformImports(file.content);

    // Remove any existing sync header and add fresh one
    transformedContent = removeSyncHeader(transformedContent);

    // Add sync metadata header
    const header = generateSyncHeader(componentName, config.style);
    transformedContent = header + transformedContent;

    // Apply local overrides if they exist
    const {
      content: patchedContent,
      applied,
      failed,
    } = await applyOverrides(componentName, transformedContent);
    transformedContent = patchedContent;

    if (applied.length > 0) {
      console.log(
        `🔧 Applied ${applied.length} override(s): ${applied.join(', ')}`,
      );
    }
    if (failed.length > 0) {
      console.warn(`⚠️  Failed to apply: ${failed.join(', ')}`);
    }

    writeFileSync(targetPath, transformedContent, 'utf-8');
    console.log(`✅ Synced ${localPath}`);
  }

  return true;
}

/**
 * Parse sync metadata from a component file
 */
function parseSyncMetadata(filePath: string): {
  synced: boolean;
  date?: string;
  version?: string;
  source?: string;
} {
  if (!existsSync(filePath)) {
    return { synced: false };
  }

  const content = readFileSync(filePath, 'utf-8');
  const syncMatch = content.match(/@shadcn-sync/);

  if (!syncMatch) {
    return { synced: false };
  }

  const dateMatch = content.match(/@synced\s+(\S+)/);
  const versionMatch = content.match(/@version\s+(\S+)/);
  const sourceMatch = content.match(/@source\s+(\S+)/);

  return {
    synced: true,
    date: dateMatch?.[1],
    version: versionMatch?.[1],
    source: sourceMatch?.[1],
  };
}

/**
 * Check sync status of a component or all components
 */
async function checkSyncStatus(componentName?: string): Promise<void> {
  const componentsDir = join(ROOT, 'src/components');

  if (componentName) {
    // Check single component
    const filePath = join(componentsDir, `${componentName}.tsx`);
    const meta = parseSyncMetadata(filePath);

    if (!existsSync(filePath)) {
      console.log(`❌ ${componentName}: File not found`);
      return;
    }

    if (meta.synced) {
      console.log(`✅ ${componentName}: Synced`);
      console.log(`   Version: ${meta.version}`);
      console.log(`   Date: ${meta.date}`);
      console.log(`   Source: ${meta.source}`);
    } else {
      console.log(`⚠️  ${componentName}: Not synced (no @shadcn-sync header)`);
    }
    return;
  }

  // Check all components
  console.log('📋 Checking sync status of all components...\n');

  const { readdirSync } = await import('fs');
  const files = readdirSync(componentsDir).filter((f) => f.endsWith('.tsx'));

  const synced: string[] = [];
  const notSynced: string[] = [];

  for (const file of files) {
    const filePath = join(componentsDir, file);
    const meta = parseSyncMetadata(filePath);
    const name = file.replace('.tsx', '');

    if (meta.synced) {
      synced.push(`${name} (${meta.date?.split('T')[0] || 'unknown date'})`);
    } else {
      notSynced.push(name);
    }
  }

  console.log(`✅ Synced (${synced.length}):`);
  synced.forEach((c) => console.log(`   - ${c}`));

  console.log(`\n⚠️  Not synced (${notSynced.length}):`);
  notSynced.forEach((c) => console.log(`   - ${c}`));
}

async function checkForUpdates(): Promise<void> {
  console.log('🔍 Checking for shadcn/ui updates...');
  console.log(
    '⚠️  Update checking not yet implemented - use sync:shadcn:all to sync all components',
  );
}

async function syncAll(_overwrite?: boolean): Promise<void> {
  void _overwrite; // Reserved for future use
  console.log('🔄 Syncing all shadcn/ui components...');

  // Get list of components from registry index
  const config = loadConfig();
  const indexUrl =
    config.registries?.['@shadcn']?.replace('{name}', 'index') ||
    `https://ui.shadcn.com/r/styles/${config.style}/index.json`;

  try {
    console.log(`Fetching index from: ${indexUrl}`);
    const response = await fetch(indexUrl);
    const index = await response.json();

    if (index.items && Array.isArray(index.items)) {
      const uiComponents = index.items
        .filter((item: any) => item.type === 'registry:ui')
        .map((item: any) => item.name);

      console.log(`Found ${uiComponents.length} UI components to sync\n`);

      let synced = 0;
      let failed = 0;

      for (const componentName of uiComponents) {
        const success = await syncComponent(componentName, false);
        if (success) {
          synced++;
        } else {
          failed++;
        }
      }

      console.log(`\n✅ Sync complete! Synced: ${synced}, Failed: ${failed}`);
    } else {
      console.error('Unexpected index format. Keys:', Object.keys(index));
    }
  } catch (error) {
    console.error('Failed to fetch component index:', error);
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === '--check') {
  checkForUpdates();
} else if (command === '--status') {
  const componentName = args[1];
  checkSyncStatus(componentName);
} else if (command === '--all') {
  const overwrite = args.includes('--overwrite');
  syncAll(overwrite);
} else if (command && !command.startsWith('--')) {
  const componentName = command;
  const dryRun = args.includes('--dry-run');
  syncComponent(componentName, dryRun);
} else {
  console.log(`
Usage:
  pnpm sync:shadcn <component>        Sync specific component
  pnpm sync:shadcn <component> --dry-run  Preview sync without changes
  pnpm sync:shadcn --status           Check sync status of all components
  pnpm sync:shadcn --status <name>    Check sync status of specific component
  pnpm sync:shadcn --all              Sync all components
  pnpm sync:shadcn --all --overwrite  Sync all (overwrite existing)
  pnpm sync:shadcn --check            Check for updates (not yet implemented)
  `);
  process.exit(1);
}
