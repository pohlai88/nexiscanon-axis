import type { Metadata } from "next";
import {
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Package,
  FileText,
  Clock,
} from "lucide-react";
import { MetricCard, MetricCardGroup } from "@/components/widgets/metric-card";
import { AlertCard, AlertList } from "@/components/widgets/alert-card";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "AFANDA Executive Dashboard - Real-time business metrics",
};

/**
 * Main Dashboard Page
 *
 * The unified decision board showing key metrics, alerts, and actions.
 *
 * @see AFANDA.md §1.1 AFANDA in the AXIS Ecosystem
 * @see B11-AFANDA.md §3.2 Standard Dashboards
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <MetricCardGroup columns={4}>
        <MetricCard
          label="Revenue MTD"
          value="$124,563"
          trend="up"
          change="+12.3%"
          description="vs last month"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Users"
          value="2,847"
          trend="up"
          change="+5.2%"
          description="vs last week"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Orders Today"
          value="156"
          trend="up"
          change="+23"
          description="vs yesterday"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <MetricCard
          label="Open Alerts"
          value="7"
          trend="down"
          change="-3"
          description="resolved today"
          upIsGood={false}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </MetricCardGroup>

      {/* Second Row - Financial & Operational */}
      <MetricCardGroup columns={4}>
        <MetricCard
          label="Gross Profit Margin"
          value="34.2%"
          trend="up"
          change="+1.8%"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Inventory Value"
          value="$892,450"
          trend="neutral"
          change="—"
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          label="Pending Approvals"
          value="23"
          trend="up"
          change="+5"
          upIsGood={false}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          label="DSO (Days)"
          value="42"
          trend="down"
          change="-3 days"
          upIsGood={false}
          icon={<Clock className="h-4 w-4" />}
        />
      </MetricCardGroup>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts Section */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Alerts</h2>
              <span className="text-sm text-muted-foreground">7 active</span>
            </div>
            <AlertList
              alerts={[
                {
                  id: "1",
                  title: "Low Cash Position",
                  description:
                    "Cash position is below the minimum threshold of $50,000",
                  severity: "critical",
                  timestamp: "2 minutes ago",
                },
                {
                  id: "2",
                  title: "Approval Overdue",
                  description:
                    "PO-2024-0847 has been pending approval for 5 days",
                  severity: "warning",
                  timestamp: "15 minutes ago",
                },
                {
                  id: "3",
                  title: "Stock Alert",
                  description: "SKU-12345 (Widget Pro) is below reorder point",
                  severity: "warning",
                  timestamp: "1 hour ago",
                },
                {
                  id: "4",
                  title: "High DSO Warning",
                  description: "Days Sales Outstanding exceeds 45 days target",
                  severity: "info",
                  timestamp: "3 hours ago",
                },
              ]}
              maxItems={4}
            />
          </div>
        </div>

        {/* Quick Actions / Pending Items */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold">Pending Approvals</h2>
            <div className="space-y-3">
              {[
                { type: "PO", id: "PO-2024-0847", amount: "$12,500", age: "5d" },
                { type: "PO", id: "PO-2024-0851", amount: "$8,200", age: "2d" },
                { type: "INV", id: "INV-2024-1234", amount: "$45,000", age: "1d" },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3"
                >
                  <div>
                    <span className="font-medium">{item.id}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {item.amount}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.age}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-lg border border-border bg-background/50 py-2 text-sm font-medium text-primary hover:bg-primary/10">
              View All Approvals
            </button>
          </div>

          {/* AFANDA Questions */}
          <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold">AFANDA Answers</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="afanda-status-dot afanda-status-dot-active mt-1.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">What is happening?</strong>
                  <br />
                  156 orders processed today
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="afanda-status-dot afanda-status-dot-pending mt-1.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">What needs attention?</strong>
                  <br />
                  7 alerts require review
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="afanda-status-dot afanda-status-dot-active mt-1.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">What should I do?</strong>
                  <br />
                  Approve 3 pending POs
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="afanda-status-dot afanda-status-dot-active mt-1.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">How are we performing?</strong>
                  <br />
                  Revenue up 12.3% MTD
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
