#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(__dirname, '../src/components');

async function fixImports() {
  const files = await readdir(componentsDir);
  const tsxFiles = files.filter(f => f.endsWith('.tsx'));
  
  for (const file of tsxFiles) {
    const filePath = join(componentsDir, file);
    let content = await readFile(filePath, 'utf-8');
    
    // Fix import paths
    content = content.replace(/@\/registry\/bases\/base\/lib\//g, '@/lib/');
    content = content.replace(/@\/registry\/bases\/base\/hooks\//g, '@/hooks/');
    content = content.replace(/@\/registry\/bases\/base\/ui\//g, '@/components/');
    
    await writeFile(filePath, content, 'utf-8');
    console.log(`Fixed: ${file}`);
  }
  
  console.log(`\nFixed ${tsxFiles.length} files`);
}

fixImports().catch(console.error);
