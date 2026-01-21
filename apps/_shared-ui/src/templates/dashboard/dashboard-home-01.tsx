/**
 * Dashboard Home Template 01
 * 
 * Main dashboard page with:
 * - Application shell (sidebar + header)
 * - Stats cards
 * - Charts/metrics area
 * - Recent activity
 * 
 * Usage: Copy to apps/[app]/app/dashboard/page.tsx and customize
 */

import { ApplicationShell01 } from "@workspace/shared-ui/blocks";
import { Card, Button } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Conversions",
    value: "892",
    change: "-4.3%",
    trend: "down" as const,
    icon: ShoppingCart,
  },
  {
    title: "Server Load",
    value: "67%",
    change: "+2.1%",
    trend: "up" as const,
    icon: Activity,
  },
];

const recentActivity = [
  {
    user: "Alice Johnson",
    action: "created a new project",
    time: "2 minutes ago",
    avatar: "https://github.com/shadcn.png",
  },
  {
    user: "Bob Smith",
    action: "updated settings",
    time: "5 minutes ago",
    avatar: "https://github.com/shadcn.png",
  },
  {
    user: "Carol Davis",
    action: "invited team member",
    time: "10 minutes ago",
    avatar: "https://github.com/shadcn.png",
  },
];

export default function DashboardHome01() {
  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          isActive: true,
        },
        {
          label: "Users",
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/users",
        },
        {
          label: "Reports",
          icon: <FileText className="h-5 w-5" />,
          href: "/dashboard/reports",
        },
        {
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
          href: "/dashboard/settings",
        },
      ]}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Overview" },
      ]}
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://github.com/shadcn.png",
      }}
      onLogoutClick={() => console.log("Logout clicked")}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-lg bg-muted p-2">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    stat.trend === "up" && "text-primary",
                    stat.trend === "down" && "text-destructive"
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-sm text-muted-foreground">
                  {stat.title}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Chart Area - Takes 4 columns */}
          <Card className="p-6 lg:col-span-4">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Revenue Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Monthly revenue for the last 6 months
                </p>
              </div>
            </div>

            {/* Placeholder for chart */}
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Chart component goes here
              </p>
            </div>
          </Card>

          {/* Recent Activity - Takes 3 columns */}
          <Card className="p-6 lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">
                Latest team actions
              </p>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-4 pb-4",
                    i !== recentActivity.length - 1 && "border-b"
                  )}
                >
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-4 w-full">
              View All Activity
            </Button>
          </Card>
        </div>
      </div>
    </ApplicationShell01>
  );
}
