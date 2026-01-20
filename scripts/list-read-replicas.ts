#!/usr/bin/env tsx
/**
 * List Read Replicas for Neon Project
 * 
 * Shows all read-only computes across all branches
 * 
 * Usage:
 *   tsx scripts/list-read-replicas.ts
 *   tsx scripts/list-read-replicas.ts --branch production
 */

import { config } from "dotenv";

config();

const NEON_API_KEY = process.env.NEON_API_KEY;
const PROJECT_ID = 'dark-band-87285012';

if (!NEON_API_KEY) {
  console.error('❌ NEON_API_KEY environment variable is required');
  process.exit(1);
}

const args = process.argv.slice(2);
const filterBranch = args.find(arg => arg.startsWith('--branch='))?.split('=')[1];

interface Endpoint {
  id: string;
  branch_id: string;
  type: string;
  host: string;
  current_state: string;
  pooler_enabled: boolean;
  autoscaling_limit_min_cu: number;
  autoscaling_limit_max_cu: number;
  suspend_timeout_seconds: number;
  created_at: string;
  last_active?: string;
}

interface Branch {
  id: string;
  name: string;
}

async function listEndpoints(): Promise<Endpoint[]> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/endpoints`,
    {
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch endpoints: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.endpoints || [];
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

async function main() {
  console.log('📊 Read Replicas Status\n');
  console.log('='.repeat(80));

  const [endpoints, branches] = await Promise.all([listEndpoints(), listBranches()]);
  
  // Create branch lookup
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  // Filter for read-only endpoints
  const readReplicas = endpoints.filter(e => e.type === 'read_only');

  if (readReplicas.length === 0) {
    console.log('\n❌ No read replicas found');
    console.log('\n💡 Create one with: pnpm neon:create-replica <branch-name>\n');
    return;
  }

  console.log(`\n✅ Found ${readReplicas.length} read replica(s)\n`);

  readReplicas.forEach((replica, index) => {
    const branchName = branchMap.get(replica.branch_id) || 'unknown';
    
    if (filterBranch && branchName !== filterBranch) {
      return;
    }

    console.log(`${index + 1}. Replica: ${replica.id}`);
    console.log(`   Branch: ${branchName} (${replica.branch_id})`);
    console.log(`   Host: ${replica.host}`);
    console.log(`   Status: ${replica.current_state}`);
    console.log(`   Pooler: ${replica.pooler_enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Autoscaling: ${replica.autoscaling_limit_min_cu} - ${replica.autoscaling_limit_max_cu} CU`);
    console.log(`   Suspend timeout: ${replica.suspend_timeout_seconds}s`);
    console.log(`   Created: ${formatDate(replica.created_at)}`);
    if (replica.last_active) {
      console.log(`   Last active: ${formatDate(replica.last_active)}`);
    }
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('\n📝 Management Commands:');
  console.log('   Create: pnpm neon:create-replica <branch-name>');
  console.log('   Delete: pnpm neon:delete-replica <endpoint-id>');
  console.log('   Console: https://console.neon.tech/app/projects/' + PROJECT_ID + '\n');
}

main().catch(console.error);
