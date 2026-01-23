import { query } from "@/lib/db";
import { Card } from "@workspace/design-system";

// Force dynamic rendering - requires database access
export const dynamic = "force-dynamic";

/**
 * Admin configuration page.
 *
 * Pattern: Global platform settings for super-admin.
 * Read-only display for now; actions added later.
 */

interface SystemConfig {
  featureFlags: {
    subdomainRouting: boolean;
    stripeEnabled: boolean;
    resendEnabled: boolean;
    r2Enabled: boolean;
  };
  limits: {
    defaultRateLimit: number;
    maxTenantsPerUser: number;
    maxUsersPerTenant: number;
  };
  defaults: {
    defaultPlan: string;
    defaultRole: string;
  };
}

async function getSystemConfig(): Promise<SystemConfig> {
  // Read from environment and database
  // Future: use these counts for dashboard stats
  await Promise.all([
    query(async (sql) => sql`SELECT COUNT(*)::int as count FROM tenants`),
    query(async (sql) => sql`SELECT COUNT(*)::int as count FROM users`),
  ]);

  return {
    featureFlags: {
      subdomainRouting: process.env.SUBDOMAIN_ROUTING_ENABLED === "true",
      stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
      resendEnabled: !!process.env.RESEND_API_KEY,
      r2Enabled: !!process.env.R2_ACCESS_KEY_ID,
    },
    limits: {
      defaultRateLimit: 100,
      maxTenantsPerUser: 10,
      maxUsersPerTenant: 50,
    },
    defaults: {
      defaultPlan: "free",
      defaultRole: "member",
    },
  };
}

export default async function AdminConfigPage() {
  const config = await getSystemConfig();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configuration</h1>
      <p className="text-muted-foreground mb-8">
        Global platform settings and feature flags
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Flags */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Feature Flags</h2>
          <div className="space-y-3">
            <ConfigRow
              label="Subdomain Routing"
              value={config.featureFlags.subdomainRouting}
              type="boolean"
            />
            <ConfigRow
              label="Stripe Integration"
              value={config.featureFlags.stripeEnabled}
              type="boolean"
            />
            <ConfigRow
              label="Resend Email"
              value={config.featureFlags.resendEnabled}
              type="boolean"
            />
            <ConfigRow
              label="R2 Storage"
              value={config.featureFlags.r2Enabled}
              type="boolean"
            />
          </div>
        </Card>

        {/* Limits */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Rate Limits</h2>
          <div className="space-y-3">
            <ConfigRow
              label="Default Rate Limit"
              value={`${config.limits.defaultRateLimit} req/min`}
              type="string"
            />
            <ConfigRow
              label="Max Tenants per User"
              value={config.limits.maxTenantsPerUser}
              type="number"
            />
            <ConfigRow
              label="Max Users per Tenant"
              value={config.limits.maxUsersPerTenant}
              type="number"
            />
          </div>
        </Card>

        {/* Defaults */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Default Settings</h2>
          <div className="space-y-3">
            <ConfigRow
              label="Default Plan"
              value={config.defaults.defaultPlan}
              type="string"
            />
            <ConfigRow
              label="Default Role"
              value={config.defaults.defaultRole}
              type="string"
            />
          </div>
        </Card>

        {/* Environment */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Environment</h2>
          <div className="space-y-3">
            <ConfigRow
              label="App URL"
              value={process.env.NEXT_PUBLIC_APP_URL ?? "Not set"}
              type="string"
            />
            <ConfigRow
              label="Root Domain"
              value={process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "Not set"}
              type="string"
            />
            <ConfigRow
              label="Node Environment"
              value={process.env.NODE_ENV ?? "development"}
              type="string"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

interface ConfigRowProps {
  label: string;
  value: string | number | boolean;
  type: "string" | "number" | "boolean";
}

function ConfigRow({ label, value, type }: ConfigRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {type === "boolean" ? (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {value ? "Enabled" : "Disabled"}
        </span>
      ) : (
        <code className="text-sm bg-muted px-2 py-1 rounded">
          {String(value)}
        </code>
      )}
    </div>
  );
}
