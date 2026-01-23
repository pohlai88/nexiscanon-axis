/**
 * Dashboard Template 02
 *
 * Shadcn dashboard-01 inspired template with:
 * - Sidebar with navigation
 * - Site header
 * - Section cards (stats)
 * - Interactive chart area
 * - Data table
 *
 * Usage: Copy to apps/[app]/app/dashboard/page.tsx and customize
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Activity,
} from 'lucide-react';

import { ApplicationShell01 } from '../../blocks/application-shell-01';
import { DataFortress } from '../../blocks/data-fortress';
import type { DataFortressColumn } from '../../blocks/data-fortress';

interface DashboardData {
  id: number;
  header: string;
  type: string;
  status: 'Done' | 'In Process';
  target: string;
  limit: string;
  reviewer: string;
}

const dashboardData: DashboardData[] = [
  {
    id: 1,
    header: 'Cover page',
    type: 'Cover page',
    status: 'In Process',
    target: '18',
    limit: '5',
    reviewer: 'Eddie Lake',
  },
  {
    id: 2,
    header: 'Table of contents',
    type: 'Table of contents',
    status: 'Done',
    target: '29',
    limit: '24',
    reviewer: 'Eddie Lake',
  },
  {
    id: 3,
    header: 'Executive summary',
    type: 'Narrative',
    status: 'Done',
    target: '10',
    limit: '13',
    reviewer: 'Eddie Lake',
  },
  {
    id: 4,
    header: 'Technical approach',
    type: 'Narrative',
    status: 'Done',
    target: '27',
    limit: '23',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 5,
    header: 'Design',
    type: 'Narrative',
    status: 'In Process',
    target: '2',
    limit: '16',
    reviewer: 'Jamik Tashpulatov',
  },
];

const columns: DataFortressColumn<DashboardData>[] = [
  {
    id: 'header',
    accessorKey: 'header',
    header: 'Header',
    sortable: true,
    filterable: true,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortable: true,
    cell: (row) => (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
          row.status === 'Done'
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {row.status}
      </span>
    ),
  },
  {
    id: 'target',
    accessorKey: 'target',
    header: 'Target',
    sortable: true,
  },
  {
    id: 'limit',
    accessorKey: 'limit',
    header: 'Limit',
    sortable: true,
  },
  {
    id: 'reviewer',
    accessorKey: 'reviewer',
    header: 'Reviewer',
    sortable: true,
    filterable: true,
  },
];

const stats = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    icon: DollarSign,
  },
  {
    title: 'Active Users',
    value: '2,350',
    change: '+12.5%',
    icon: Users,
  },
  {
    title: 'Conversions',
    value: '892',
    change: '-4.3%',
    icon: ShoppingCart,
  },
  {
    title: 'Server Load',
    value: '67%',
    change: '+2.1%',
    icon: Activity,
  },
];

export default function Dashboard02() {
  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/dashboard',
          isActive: true,
        },
        {
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          href: '/dashboard/users',
        },
        {
          label: 'Reports',
          icon: <FileText className="h-5 w-5" />,
          href: '/dashboard/reports',
        },
        {
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          href: '/dashboard/settings',
        },
      ]}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Overview' },
      ]}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://github.com/shadcn.png',
      }}
      onLogoutClick={() => console.log('Logout clicked')}
    >
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Section Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={cn(
                    'text-xs transition-colors duration-200',
                    stat.change.startsWith('+')
                      ? 'text-primary'
                      : 'text-destructive',
                  )}
                >
                  <TrendingUp className="mr-1 inline h-3 w-3" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Area */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 flex h-[300px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground text-sm">
                Chart component goes here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              A list of recent documents and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataFortress
              data={dashboardData.map((item) => ({ ...item, _id: item.id }))}
              columns={columns}
              selectable
              exportable
            />
          </CardContent>
        </Card>
      </div>
    </ApplicationShell01>
  );
}
