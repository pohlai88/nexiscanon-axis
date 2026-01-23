import {
  LayoutDashboard,
  Users,
  Hash,
  TrendingUp,
  UserCheck,
  Target,
  MessageSquare,
  Activity,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import React from 'react';

export interface SidebarNavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
}

export interface DashboardSidebar01Props {
  items?: SidebarNavItem[];
}

const defaultItems: SidebarNavItem[] = [
  {
    label: 'Content Performance',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/dashboard/content',
  },
  {
    label: 'Audience Insights',
    icon: <Users className="h-5 w-5" />,
    href: '/dashboard/audience',
  },
  {
    label: 'Hashtag Performance',
    icon: <Hash className="h-5 w-5" />,
    href: '/dashboard/hashtags',
  },
  {
    label: 'Competitor Analysis',
    icon: <TrendingUp className="h-5 w-5" />,
    href: '/dashboard/competitors',
  },
  {
    label: 'Influencers',
    icon: <UserCheck className="h-5 w-5" />,
    href: '/dashboard/influencers',
  },
  {
    label: 'Campaign Tracking',
    icon: <Target className="h-5 w-5" />,
    href: '/dashboard/campaigns',
  },
  {
    label: 'Sentiment Tracking',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/dashboard/sentiment',
  },
  {
    label: 'Real Time Monitoring',
    icon: <Activity className="h-5 w-5" />,
    href: '/dashboard/monitoring',
  },
  {
    label: 'Schedule Post & Calendar',
    icon: <Calendar className="h-5 w-5" />,
    href: '/dashboard/schedule',
  },
];

/**
 * Dashboard Sidebar 01
 *
 * Social media analytics dashboard sidebar featuring Content Performance,
 * Audience Insights, Hashtag Performance, Competitor Analysis, Influencer
 * tracking, Campaign Tracking, Sentiment Tracking, Real Time Monitoring,
 * and Schedule Post & Calendar navigation.
 *
 * @meta
 * - Category: dashboard-and-application
 * - Section: dashboard-sidebar
 * - Use Cases: Social media management, Analytics dashboards, Content marketing
 */
export function DashboardSidebar01({
  items = defaultItems,
}: DashboardSidebar01Props) {
  return (
    <aside className="bg-card flex h-full w-64 flex-col border-r">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                item.isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  item.isActive
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
