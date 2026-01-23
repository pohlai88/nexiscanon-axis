import type { Metadata } from "next";
import { FileText, Download, Calendar, Clock, Plus } from "lucide-react";
import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/design-system";

export const metadata: Metadata = {
  title: "Reports",
  description: "AFANDA Report Builder - Generate and schedule reports",
};

/**
 * Reports Page
 *
 * Report builder and scheduled reports management.
 *
 * @see B11-AFANDA.md §7 Report Builder
 */

const recentReports = [
  {
    id: "1",
    name: "Monthly Sales Report",
    description: "Sales performance analysis for December 2024",
    type: "Sales",
    generatedAt: "2024-01-15 09:30 AM",
    format: "PDF",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "AR Aging Report",
    description: "Accounts receivable aging summary",
    type: "Finance",
    generatedAt: "2024-01-14 03:15 PM",
    format: "Excel",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "Inventory Valuation",
    description: "Current inventory value by category",
    type: "Inventory",
    generatedAt: "2024-01-14 11:00 AM",
    format: "PDF",
    size: "3.1 MB",
  },
  {
    id: "4",
    name: "Trial Balance",
    description: "Trial balance as of December 31, 2024",
    type: "Accounting",
    generatedAt: "2024-01-13 05:00 PM",
    format: "Excel",
    size: "856 KB",
  },
];

const scheduledReports = [
  {
    id: "s1",
    name: "Daily Sales Summary",
    schedule: "Daily at 6:00 AM",
    nextRun: "Tomorrow, 6:00 AM",
    recipients: 3,
  },
  {
    id: "s2",
    name: "Weekly KPI Dashboard",
    schedule: "Every Monday at 8:00 AM",
    nextRun: "Monday, Jan 22, 8:00 AM",
    recipients: 5,
  },
  {
    id: "s3",
    name: "Monthly Financial Summary",
    schedule: "1st of each month at 9:00 AM",
    nextRun: "Feb 1, 9:00 AM",
    recipients: 8,
  },
];

const reportTemplates = [
  { name: "Sales Report", category: "Sales", icon: "📊" },
  { name: "AR Aging", category: "Finance", icon: "💰" },
  { name: "AP Aging", category: "Finance", icon: "📋" },
  { name: "Inventory Valuation", category: "Inventory", icon: "📦" },
  { name: "Trial Balance", category: "Accounting", icon: "⚖️" },
  { name: "P&L Statement", category: "Accounting", icon: "📈" },
  { name: "Cash Flow", category: "Finance", icon: "💵" },
  { name: "KPI Dashboard", category: "Analytics", icon: "🎯" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and manage business reports.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Report Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {reportTemplates.map((template) => (
            <Card
              key={template.name}
              className="cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.category}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Reports generated in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {report.generatedAt}
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {report.format}
                          </Badge>
                          <span>•</span>
                          {report.size}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Reports */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automated report generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-lg border border-border/50 bg-background/50 p-4"
                  >
                    <p className="font-medium">{report.name}</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {report.schedule}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Next: {report.nextRun}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {report.recipients} recipients
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
