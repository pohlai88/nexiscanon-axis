#!/usr/bin/env tsx
/**
 * Optimize Neon project configuration for SaaS workloads
 * 
 * Enables:
 * - Connection pooling (pgBouncer)
 * - Scale-to-zero after 5 minutes of inactivity
 * 
 * Usage: tsx scripts/optimize-neon-config.ts
 * Requires: NEON_API_KEY environment variable
 */

const NEON_API_KEY = process.env.NEON_API_KEY;
const PROJECT_ID = 'dark-band-87285012';

if (!NEON_API_KEY) {
  console.error('❌ NEON_API_KEY environment variable is required');
  console.error('   Get your API key from: https://console.neon.tech/app/settings/api-keys');
  process.exit(1);
}

interface Endpoint {
  id: string;
  branch_id: string;
  pooler_enabled: boolean;
  suspend_timeout_seconds: number;
  autoscaling_limit_min_cu: number;
  autoscaling_limit_max_cu: number;
}

async function fetchEndpoints(): Promise<Endpoint[]> {
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

async function updateEndpoint(endpointId: string, updates: Partial<Endpoint>): Promise<void> {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/endpoints/${endpointId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: updates }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update endpoint: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  console.log('🔧 Optimizing Neon configuration for SaaS workloads...\n');

  const endpoints = await fetchEndpoints();
  console.log(`Found ${endpoints.length} compute endpoint(s)\n`);

  for (const endpoint of endpoints) {
    console.log(`📊 Endpoint: ${endpoint.id}`);
    console.log(`   Branch: ${endpoint.branch_id}`);
    console.log(`   Current settings:`);
    console.log(`   - Pooler enabled: ${endpoint.pooler_enabled}`);
    console.log(`   - Suspend timeout: ${endpoint.suspend_timeout_seconds}s`);
    console.log(`   - Autoscaling: ${endpoint.autoscaling_limit_min_cu} - ${endpoint.autoscaling_limit_max_cu} CU`);

    const updates: Partial<Endpoint> = {};
    let needsUpdate = false;

    // Enable connection pooling if not already enabled
    if (!endpoint.pooler_enabled) {
      updates.pooler_enabled = true;
      needsUpdate = true;
      console.log(`   ✅ Will enable connection pooling (pgBouncer)`);
    }

    // Try to set suspend timeout to 5 minutes (300s) for cost efficiency
    // Note: Some Neon plans don't allow modifying suspend timeout
    if (endpoint.suspend_timeout_seconds === 0) {
      updates.suspend_timeout_seconds = 300;
      console.log(`   ⏳ Will attempt to set suspend timeout to 300s (5 min)`);
      console.log(`      (may be restricted by plan - will skip if not allowed)`);
    }

    if (needsUpdate) {
      try {
        await updateEndpoint(endpoint.id, updates);
        console.log(`   ✨ Endpoint optimized!\n`);
      } catch (error) {
        // If suspend timeout modification fails, retry with only pooler
        if (error instanceof Error && error.message.includes('suspend interval')) {
          console.log(`   ⚠️  Suspend timeout modification not permitted on this plan`);
          console.log(`   🔄 Retrying with connection pooling only...\n`);
          
          const poolerOnlyUpdates: Partial<Endpoint> = {
            pooler_enabled: true
          };
          
          try {
            await updateEndpoint(endpoint.id, poolerOnlyUpdates);
            console.log(`   ✨ Connection pooling enabled!\n`);
          } catch (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }
    } else {
      console.log(`   ✓ Already optimized\n`);
    }
  }

  console.log('✅ Neon optimization complete!');
  console.log('\n📝 Summary:');
  console.log('   ✅ Connection pooling configured (where needed)');
  console.log('   ℹ️  Suspend timeout: Plan restrictions may prevent modification');
  console.log('      (Manual configuration available in Neon Console if needed)');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your application to apply connection pooling');
  console.log('   2. Monitor performance in Neon Console: https://console.neon.tech');
  console.log('   3. For suspend timeout: Check plan limits or upgrade if needed');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
