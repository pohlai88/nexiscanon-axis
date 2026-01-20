#!/usr/bin/env tsx
/**
 * Validate Directives - React Server/Client Directive Correctness
 * 
 * Validates that:
 * 1. Components using React hooks have 'use client' directive
 * 2. Components with 'use client' don't import server-only modules
 * 3. Server components don't accidentally use client-only APIs
 * 
 * Run: pnpm validate:directives
 * CI: Fails if directive violations found
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DS_ROOT = path.join(process.cwd(), 'packages/design-system');

interface DirectiveViolation {
  file: string;
  type: 'missing-use-client' | 'server-import-in-client' | 'client-api-in-server';
  message: string;
}

const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useDebugValue',
  'useDeferredValue',
  'useTransition',
  'useId',
  'useSyncExternalStore',
  'useInsertionEffect'
];

const SERVER_ONLY_IMPORTS = [
  'next/headers',
  'next/cookies',
  'server-only'
];

const CLIENT_ONLY_APIS = [
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'navigator'
];

async function scanComponents(): Promise<string[]> {
  return await glob('src/components/**/*.{ts,tsx}', { cwd: DS_ROOT });
}

function hasUseClientDirective(content: string): boolean {
  const lines = content.split('\n');
  for (const line of lines.slice(0, 10)) { // Check first 10 lines
    if (line.trim() === '"use client";' || line.trim() === "'use client';") {
      return true;
    }
  }
  return false;
}

function hasUseServerDirective(content: string): boolean {
  const lines = content.split('\n');
  for (const line of lines.slice(0, 10)) {
    if (line.trim() === '"use server";' || line.trim() === "'use server';") {
      return true;
    }
  }
  return false;
}

function usesReactHooks(content: string): boolean {
  return REACT_HOOKS.some(hook => {
    const pattern = new RegExp(`\\b${hook}\\s*\\(`, 'g');
    return pattern.test(content);
  });
}

function importsServerOnlyModules(content: string): boolean {
  return SERVER_ONLY_IMPORTS.some(module => {
    const pattern = new RegExp(`from\\s+['"]${module}['"]`, 'g');
    return pattern.test(content);
  });
}

function usesClientOnlyAPIs(content: string): boolean {
  return CLIENT_ONLY_APIS.some(api => {
    const pattern = new RegExp(`\\b${api}\\.`, 'g');
    return pattern.test(content);
  });
}

async function validateDirectives(): Promise<DirectiveViolation[]> {
  const violations: DirectiveViolation[] = [];
  const files = await scanComponents();
  
  for (const file of files) {
    const fullPath = path.join(DS_ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const hasUseClient = hasUseClientDirective(content);
    const hasUseServer = hasUseServerDirective(content);
    const usesHooks = usesReactHooks(content);
    const importsServer = importsServerOnlyModules(content);
    const usesClientAPIs = usesClientOnlyAPIs(content);
    
    // Rule 1: Components using hooks must have 'use client'
    if (usesHooks && !hasUseClient) {
      violations.push({
        file,
        type: 'missing-use-client',
        message: `Component uses React hooks but missing 'use client' directive`
      });
    }
    
    // Rule 2: Client components cannot import server-only modules
    if (hasUseClient && importsServer) {
      violations.push({
        file,
        type: 'server-import-in-client',
        message: `Client component imports server-only modules (next/headers, server-only, etc.)`
      });
    }
    
    // Rule 3: Server components shouldn't use client-only APIs
    if (!hasUseClient && !hasUseServer && usesClientAPIs) {
      violations.push({
        file,
        type: 'client-api-in-server',
        message: `Neutral component uses client-only APIs (window, document, etc.) - add 'use client' or wrap access`
      });
    }
  }
  
  return violations;
}

async function main() {
  console.log('🔍 Validating React directives...\n');
  
  const violations = await validateDirectives();
  
  if (violations.length === 0) {
    console.log('✅ All directives are correct!');
    console.log('   No violations found.\n');
    return;
  }
  
  console.error(`❌ Found ${violations.length} directive violation(s):\n`);
  
  for (const violation of violations) {
    console.error(`📁 ${violation.file}`);
    console.error(`   ${violation.message}`);
    console.error('');
  }
  
  console.error('💡 Fix suggestions:');
  console.error('   - Add "use client"; to top of files using React hooks');
  console.error('   - Remove server-only imports from client components');
  console.error('   - Wrap client API usage in useEffect or add "use client"');
  console.error('');
  
  process.exit(1);
}

main().catch(console.error);
