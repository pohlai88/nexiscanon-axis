import type { Metadata } from "next";
import { AlertList } from "@/components/widgets/alert-card";
import { Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/design-system";

export const metadata: Metadata = {
  title: "Alerts",
  description: "AFANDA Alert Management - Monitor and manage system alerts",
};

/**
 * Alerts Page
 *
 * Displays all alerts with filtering and management capabilities.
 *
 * @see AFANDA.md §5.3 AFANDA-Specific CSS Classes
 * @see B11-AFANDA.md §6 Alert System
 */

// Sample alert data
const sampleAlerts = {
  critical: [
    {
      id: "c1",
      title: "Low Cash Position",
      description: "Cash position ($42,500) is below the minimum threshold of $50,000. Immediate action required.",
      severity: "critical" as const,
      timestamp: "2 minutes ago",
      status: "active" as const,
    },
    {
      id: "c2",
      title: "Payment Failed",
      description: "Scheduled payment to Supplier ABC (INV-2024-0892) failed due to insufficient funds.",
      severity: "critical" as const,
      timestamp: "15 minutes ago",
      status: "active" as const,
    },
  ],
  warning: [
    {
      id: "w1",
      title: "Approval Overdue",
      description: "PO-2024-0847 has been pending approval for 5 days, exceeding the 3-day SLA.",
      severity: "warning" as const,
      timestamp: "1 hour ago",
      status: "active" as const,
    },
    {
      id: "w2",
      title: "Stock Alert - Low Inventory",
      description: "SKU-12345 (Widget Pro) is below reorder point. Current stock: 15 units, Reorder point: 50 units.",
      severity: "warning" as const,
      timestamp: "2 hours ago",
      status: "active" as const,
    },
    {
      id: "w3",
      title: "High DSO Warning",
      description: "Days Sales Outstanding (42 days) exceeds the 45-day warning threshold.",
      severity: "warning" as const,
      timestamp: "3 hours ago",
      status: "acknowledged" as const,
    },
    {
      id: "w4",
      title: "Reconciliation Discrepancy",
      description: "Bank reconciliation shows $2,450 variance. Investigation required.",
      severity: "warning" as const,
      timestamp: "5 hours ago",
      status: "active" as const,
    },
  ],
  info: [
    {
      id: "i1",
      title: "Period Close Reminder",
      description: "January 2024 period close is scheduled for tomorrow. Ensure all entries are posted.",
      severity: "info" as const,
      timestamp: "6 hours ago",
      status: "active" as const,
    },
    {
      id: "i2",
      title: "New User Registration",
      description: "User 'alex.johnson@company.com' has been added to the Sales team.",
      severity: "info" as const,
      timestamp: "1 day ago",
      status: "active" as const,
    },
    {
      id: "i3",
      title: "Report Generated",
      description: "Monthly Sales Report (December 2024) has been generated and is ready for review.",
      severity: "info" as const,
      timestamp: "1 day ago",
      status: "resolved" as const,
    },
  ],
};

const allAlerts = [
  ...sampleAlerts.critical,
  ...sampleAlerts.warning,
  ...sampleAlerts.info,
];

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts and notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="afanda-grid-4">
        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Critical</span>
            <Badge variant="destructive">{sampleAlerts.critical.length}</Badge>
          </div>
          <p className="mt-2 text-2xl font-bold">{sampleAlerts.critical.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Warning</span>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
              {sampleAlerts.warning.length}
            </Badge>
          </div>
          <p className="mt-2 text-2xl font-bold">{sampleAlerts.warning.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Info</span>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              {sampleAlerts.info.length}
            </Badge>
          </div>
          <p className="mt-2 text-2xl font-bold">{sampleAlerts.info.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Active</span>
            <Badge variant="outline">{allAlerts.filter(a => a.status === "active").length}</Badge>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {allAlerts.filter(a => a.status === "active").length}
          </p>
        </div>
      </div>

      {/* Alert Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {allAlerts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical
            <Badge variant="destructive" className="ml-2">
              {sampleAlerts.critical.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="warning">
            Warning
            <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-500">
              {sampleAlerts.warning.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="info">
            Info
            <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-500">
              {sampleAlerts.info.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <AlertList alerts={allAlerts} />
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <AlertList alerts={sampleAlerts.critical} />
          </div>
        </TabsContent>

        <TabsContent value="warning" className="space-y-4">
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <AlertList alerts={sampleAlerts.warning} />
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <AlertList alerts={sampleAlerts.info} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
