#!/usr/bin/env node
/**
 * Fix remaining TypeScript null safety errors
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const fixes = [
  // activity-feed.tsx - line 123, 239
  {
    file: 'src/blocks/activity-feed.tsx',
    patterns: [
      {
        search: /(\s+)onChange\(\{/g,
        replace: '$1onChange?.({',
      },
      {
        search: /if \(typeof Calendar === 'function'\)/g,
        replace: 'if (Calendar)',
      },
    ],
  },

  // comparison-cockpit.tsx - line 480
  {
    file: 'src/blocks/comparison-cockpit.tsx',
    patterns: [
      {
        search: /(metric\.trend === 'up' \? 'TrendingUp' : metric\.trend === 'down' \? 'TrendingDown' : false)/g,
        replace: "(metric.trend === 'up' ? 'TrendingUp' : metric.trend === 'down' ? 'TrendingDown' : undefined)",
      },
    ],
  },

  // excel-mode-grid.tsx - multiple lines
  {
    file: 'src/blocks/excel-mode-grid.tsx',
    patterns: [
      {
        search: /const col = columns\[focusedCell\.col\];/g,
        replace: 'const col = columns[focusedCell.col];\n    if (!col) return;',
      },
      {
        search: /const row = data\[focusedCell\.row\];/g,
        replace: 'const row = data[focusedCell.row];\n        if (!row) return;',
      },
    ],
  },
];

for (const fix of fixes) {
  try {
    const filepath = join(process.cwd(), fix.file);
    let content = readFileSync(filepath, 'utf8');

    for (const pattern of fix.patterns) {
      content = content.replace(pattern.search, pattern.replace);
    }

    writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Fixed ${fix.file}`);
  } catch (error) {
    console.error(`✗ Failed to fix ${fix.file}:`, error instanceof Error ? error.message : error);
  }
}

console.log('Done');
