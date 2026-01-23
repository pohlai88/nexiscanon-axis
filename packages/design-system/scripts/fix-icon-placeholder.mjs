#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(__dirname, '../src/components');

const iconMap = {
  ChevronDownIcon: 'ChevronDown',
  ChevronRightIcon: 'ChevronRight',
  ChevronLeftIcon: 'ChevronLeft',
  ChevronUpIcon: 'ChevronUp',
  XIcon: 'X',
  CheckIcon: 'Check',
  CircleIcon: 'Circle',
  MinusIcon: 'Minus',
  DotIcon: 'Circle',
  ChevronsUpDownIcon: 'ChevronsUpDown',
  SearchIcon: 'Search',
  EllipsisIcon: 'Ellipsis',
  MoreHorizontalIcon: 'MoreHorizontal'
};

async function fixIconPlaceholder() {
  const files = await readdir(componentsDir);
  const tsxFiles = files.filter(f => f.endsWith('.tsx'));
  
  let fixedCount = 0;
  
  for (const file of tsxFiles) {
    const filePath = join(componentsDir, file);
    let content = await readFile(filePath, 'utf-8');
    
    // Check if file has IconPlaceholder
    if (!content.includes('IconPlaceholder')) {
      continue;
    }
    
    // Remove IconPlaceholder import
    content = content.replace(
      /import\s+\{\s*IconPlaceholder\s*\}\s+from\s+"@\/app\/\(create\)\/components\/icon-placeholder"\s*\n?/g,
      ''
    );
    
    // Find all IconPlaceholder usages and extract lucide icon names
    const iconMatches = content.match(/lucide="(\w+)"/g) || [];
    const iconsNeeded = iconMatches.map(match => {
      const iconName = match.match(/lucide="(\w+)"/)[1];
      return iconMap[iconName] || iconName.replace('Icon', '');
    });
    
    // Add lucide-react import if needed
    if (iconsNeeded.length > 0) {
      const uniqueIcons = [...new Set(iconsNeeded)];
      const lucideImport = `import { ${uniqueIcons.join(', ')} } from "lucide-react"\n`;
      
      // Add after first import or at top
      const importMatch = content.match(/^import.*$/m);
      if (importMatch) {
        const insertIndex = content.indexOf(importMatch[0]);
        content = content.slice(0, insertIndex) + lucideImport + content.slice(insertIndex);
      } else {
        content = lucideImport + content;
      }
    }
    
    // Replace IconPlaceholder usages with actual icon
    for (const iconName in iconMap) {
      const actualIconName = iconMap[iconName];
      const regex = new RegExp(
        `<IconPlaceholder\\s+lucide="${iconName}"[^>]*/>`,
        'g'
      );
      content = content.replace(regex, `<${actualIconName} />`);
    }
    
    // Generic fallback - replace remaining IconPlaceholder with lucide icon
    content = content.replace(
      /<IconPlaceholder\s+lucide="(\w+)"[^>]*\/>/g,
      (match, iconName) => {
        const actualName = iconName.replace('Icon', '');
        return `<${actualName} />`;
      }
    );
    
    await writeFile(filePath, content, 'utf-8');
    fixedCount++;
    console.log(`Fixed: ${file}`);
  }
  
  console.log(`\nFixed ${fixedCount} files`);
}

fixIconPlaceholder().catch(console.error);
