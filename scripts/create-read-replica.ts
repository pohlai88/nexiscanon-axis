#!/usr/bin/env tsx
/**
 * Create Read Replica for Neon Branch
 * 
 * Creates a read-only compute on a specified branch
 * 
 * Usage:
 *   tsx scripts/create-read-replica.ts <branch-name>
 *   tsx scripts/create-read-replica.ts production
 *   tsx scripts/create-read-replica.ts production --min-cu 0.5 --max-cu 4
 *   tsx scripts/create-read-replica.ts test-integration
 */

import { config } from "dotenv";

config();

const NEON_API_KEY = process.env.NEON_API_KEY;
const PROJECT_ID = 'dark-band-87285012';

if (!NEON_API_KEY) {
  console.error('❌ NEON_API_KEY environment variable is required');
  console.error('   Get your API key from: https://console.neon.tech/app/settings/api-keys');
  process.exit(1);
}

const args = process.argv.slice(2);
const branchName = args[0];

if (!branchName) {
  console.error('❌ Branch name is required');
  console.error('   Usage: tsx scripts/create-read-replica.ts <branch-name>');
  console.error('   Example: tsx scripts/create-read-replica.ts production');
  process.exit(1);
}

const minCU = parseFloat(args.find(arg => arg.startsWith('--min-cu='))?.split('=')[1] || '0.25');
const maxCU = parseFloat(args.find(arg => arg.startsWith('--max-cu='))?.split('=')[1] || '2');

interface Branch {
  id: string;
  name: string;
  primary: boolean;
  default: boolean;
}

async function listBranches(): Promise<Branch[]> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches`,
    {
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.branches || [];
}

async function createReadReplica(branchId: string, minCU: number, maxCU: number) {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/endpoints`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: {
          type: 'read_only',
          branch_id: branchId,
          autoscaling_limit_min_cu: minCU,
          autoscaling_limit_max_cu: maxCU,
          pooler_enabled: true,
          suspend_timeout_seconds: 300, // 5 minutes
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create read replica: ${response.status} ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('🔧 Creating Read Replica...\n');

  // Find branch by name
  const branches = await listBranches();
  const branch = branches.find(b => b.name === branchName);

  if (!branch) {
    console.error(`❌ Branch "${branchName}" not found`);
    console.error('\nAvailable branches:');
    branches.forEach(b => {
      const tags = [];
      if (b.primary) tags.push('primary');
      if (b.default) tags.push('default');
      const tagStr = tags.length > 0 ? ` (${tags.join(', ')})` : '';
      console.error(`   - ${b.name}${tagStr}`);
    });
    process.exit(1);
  }

  console.log(`📊 Branch: ${branch.name}`);
  console.log(`   ID: ${branch.id}`);
  console.log(`   Autoscaling: ${minCU} - ${maxCU} CU`);
  console.log(`   Pooler: Enabled`);
  console.log(`   Suspend timeout: 300s (5 min)\n`);

  console.log('Creating read replica...\n');

  try {
    const result = await createReadReplica(branch.id, minCU, maxCU);
    
    console.log('✅ Read replica created successfully!\n');
    console.log('📋 Replica Details:');
    console.log(`   Endpoint ID: ${result.endpoint.id}`);
    console.log(`   Host: ${result.endpoint.host}`);
    console.log(`   Type: ${result.endpoint.type}`);
    console.log(`   Pooler: ${result.endpoint.pooler_enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Autoscaling: ${result.endpoint.autoscaling_limit_min_cu} - ${result.endpoint.autoscaling_limit_max_cu} CU\n`);
    
    if (result.connection_uris && result.connection_uris.length > 0) {
      console.log('🔗 Connection String (add to .env):');
      console.log(`   DATABASE_URL_REPLICA=${result.connection_uris[0].connection_uri}\n`);
    }
    
    console.log('📝 Next steps:');
    console.log('   1. Add DATABASE_URL_REPLICA to your .env file');
    console.log('   2. Update your database client to use replica for reads');
    console.log('   3. Run: pnpm neon:list-replicas to verify');
    console.log('   4. Monitor performance with: pnpm db:performance\n');
  } catch (error) {
    console.error('❌ Error creating read replica:', error);
    process.exit(1);
  }
}

main().catch(console.error);
