/**
 * Tasks Page Template 01
 *
 * Task management page with:
 * - Task list with filters
 * - Status badges
 * - Priority indicators
 * - Due dates
 * - Assignee information
 *
 * Usage: Copy to apps/[app]/app/tasks/page.tsx and customize
 */

'use client';

import { Button, Card, Input } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  CheckSquare2,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { useState } from 'react';

import type { Task } from '@workspace/shared-ui/blocks';
import { SmartTaskList, ApplicationShell01  } from '@workspace/shared-ui/blocks';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write and review the Q1 project proposal document',
    status: 'in-progress',
    priority: 'high',
    assignee: {
      name: 'Alice Johnson',
      avatar: 'https://github.com/shadcn.png',
    },
    dueDate: new Date('2026-01-25'),
    tags: ['documentation', 'urgent'],
  },
  {
    id: '2',
    title: 'Review design mockups',
    description: 'Review and provide feedback on the new dashboard designs',
    status: 'todo',
    priority: 'medium',
    assignee: {
      name: 'Bob Smith',
      avatar: 'https://github.com/shadcn.png',
    },
    dueDate: new Date('2026-01-23'),
    tags: ['design', 'review'],
  },
  {
    id: '3',
    title: 'Update API documentation',
    description: 'Document the new authentication endpoints',
    status: 'done',
    priority: 'low',
    assignee: {
      name: 'Carol Davis',
      avatar: 'https://github.com/shadcn.png',
    },
    dueDate: new Date('2026-01-20'),
    tags: ['documentation', 'api'],
  },
  {
    id: '4',
    title: 'Fix login bug',
    description: 'Investigate and fix the authentication issue',
    status: 'in-progress',
    priority: 'high',
    assignee: {
      name: 'David Wilson',
      avatar: 'https://github.com/shadcn.png',
    },
    dueDate: new Date('2026-01-22'),
    tags: ['bug', 'urgent'],
  },
];

export default function TasksPage01() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/dashboard',
        },
        {
          label: 'Tasks',
          icon: <CheckSquare2 className="h-5 w-5" />,
          href: '/tasks',
          isActive: true,
        },
        {
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          href: '/dashboard/users',
        },
        {
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          href: '/dashboard/settings',
        },
      ]}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tasks' },
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
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track your team's tasks
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 transition-all duration-200"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Task List */}
        <SmartTaskList
          tasks={filteredTasks}
          onTaskUpdate={(taskId, updates) => {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task,
              ),
            );
          }}
          onTaskDelete={(taskId) => {
            setTasks((prev) => prev.filter((task) => task.id !== taskId));
          }}
          showAssignee
          showDueDate
          showPriority
          showTags
        />
      </div>
    </ApplicationShell01>
  );
}
