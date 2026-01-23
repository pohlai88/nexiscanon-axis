/**
 * Users Table Template 01
 *
 * Data table page with:
 * - Application shell
 * - DataFortress table component
 * - Sorting, filtering, export
 *
 * Usage: Copy to apps/[app]/app/dashboard/users/page.tsx and customize
 */

import { Button } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  UserPlus,
} from 'lucide-react';

import type { DataFortressColumn } from '@workspace/shared-ui/blocks';
import { ApplicationShell01, DataFortress } from '@workspace/shared-ui/blocks';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  lastLogin: Date;
}

interface UserRow extends User {
  _id: string;
}

// Sample data - replace with actual data fetching
const sampleUsers: UserRow[] = [
  {
    _id: '1',
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2026-01-21'),
  },
  {
    _id: '2',
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    status: 'active',
    createdAt: new Date('2024-02-10'),
    lastLogin: new Date('2026-01-20'),
  },
  {
    _id: '3',
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'viewer',
    status: 'inactive',
    createdAt: new Date('2024-03-05'),
    lastLogin: new Date('2026-01-15'),
  },
];

const columns: DataFortressColumn<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    filterable: true,
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
          row.original.role === 'admin' && 'bg-primary/10 text-primary',
          row.original.role === 'user' && 'bg-accent/10 text-accent-foreground',
          row.original.role === 'viewer' && 'bg-muted text-muted-foreground',
        )}
      >
        {row.original.role}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    filterable: true,
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
          row.original.status === 'active' && 'bg-primary/10 text-primary',
          row.original.status === 'inactive' &&
            'bg-muted text-muted-foreground',
          row.original.status === 'pending' &&
            'bg-accent/10 text-accent-foreground',
        )}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created',
    sortable: true,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.createdAt.toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'lastLogin',
    accessorKey: 'lastLogin',
    header: 'Last Login',
    sortable: true,
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.lastLogin.toLocaleDateString()}
      </span>
    ),
  },
];

export default function UsersTable01() {
  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/dashboard',
        },
        {
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          href: '/dashboard/users',
          isActive: true,
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
        { label: 'Users' },
      ]}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://github.com/shadcn.png',
      }}
      onLogoutClick={() => console.log('Logout clicked')}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage your team members and their permissions
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Data Table */}
        <DataFortress
          data={sampleUsers}
          columns={columns}
          selectable
          auditEnabled
          exportable
          onExport={(format) => {
            console.log('Export as:', format);
            // Implement export logic
          }}
        />
      </div>
    </ApplicationShell01>
  );
}
