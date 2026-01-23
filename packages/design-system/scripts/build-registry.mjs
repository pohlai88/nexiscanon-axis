#!/usr/bin/env node
/**
 * AXIS Registry Build Script
 * 
 * Generates individual JSON files for each registry item in public/r/
 * These files can be served by Next.js for the shadcn CLI to consume.
 * 
 * Usage: node scripts/build-registry.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Paths
const REGISTRY_PATH = join(ROOT, 'registry.json')
const OUTPUT_DIR = join(ROOT, 'public', 'r')
const SRC_DIR = join(ROOT, 'src')

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Read registry
const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'))

console.log(`Building AXIS Registry: ${registry.name}`)
console.log(`Items: ${registry.items.length}`)
console.log('---')

// Build each item
for (const item of registry.items) {
  try {
    // Read the source file content
    const files = item.files.map(file => {
      const filePath = join(SRC_DIR, file.path.replace('src/', ''))
      let content = ''
      
      if (existsSync(filePath)) {
        content = readFileSync(filePath, 'utf-8')
      } else {
        console.warn(`  Warning: File not found: ${file.path}`)
      }
      
      return {
        path: file.path,
        type: file.type,
        content
      }
    })

    // Build the registry item JSON (Shadcn schema)
    const registryItem = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      categories: item.categories,
      registryDependencies: item.registryDependencies || [],
      dependencies: item.dependencies || [],
      devDependencies: item.devDependencies || [],
      files
    }

    // Write to public/r/{name}.json
    const outputPath = join(OUTPUT_DIR, `${item.name}.json`)
    writeFileSync(outputPath, JSON.stringify(registryItem, null, 2))
    
    console.log(`  ✓ ${item.name}.json`)
  } catch (error) {
    console.error(`  ✗ ${item.name}: ${error.message}`)
  }
}

// Also write the index (list of all items)
const indexOutput = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: registry.name,
  homepage: registry.homepage,
  items: registry.items.map(item => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    categories: item.categories
  }))
}

writeFileSync(join(OUTPUT_DIR, 'index.json'), JSON.stringify(indexOutput, null, 2))
console.log('---')
console.log(`  ✓ index.json (${registry.items.length} items)`)

console.log('\nRegistry build complete!')
console.log(`Output: ${OUTPUT_DIR}`)
