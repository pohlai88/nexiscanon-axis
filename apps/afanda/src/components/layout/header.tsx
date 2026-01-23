"use client";

import { Bell, Search, Settings, User, Moon, Sun } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Badge,
  SidebarTrigger,
  Separator,
} from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

/**
 * AFANDA Header Component
 *
 * Top navigation bar with search, notifications, and user menu.
 *
 * @see AFANDA.md §7.1 Layout Principles
 */

interface AfandaHeaderProps {
  className?: string;
}

export function AfandaHeader({ className }: AfandaHeaderProps) {
  return (
    <header
      className={cn(
        "afanda-header sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm",
        className
      )}
    >
      {/* Sidebar Toggle */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dashboards, KPIs, alerts..."
            className="w-full bg-muted/50 pl-8 focus:bg-background"
          />
          <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-muted-foreground"
            >
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
              >
                7
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-xs">
                7 new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <NotificationItem
                title="Low Cash Position"
                description="Cash position is below the minimum threshold"
                time="2 min ago"
                severity="critical"
              />
              <NotificationItem
                title="Approval Required"
                description="PO-2024-0847 requires your approval"
                time="15 min ago"
                severity="warning"
              />
              <NotificationItem
                title="Stock Alert"
                description="SKU-12345 is below reorder point"
                time="1 hour ago"
                severity="info"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground"
            >
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>My Dashboard</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  severity: "critical" | "warning" | "info";
}

function NotificationItem({
  title,
  description,
  time,
  severity,
}: NotificationItemProps) {
  const severityColors = {
    critical: "bg-destructive",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-3">
      <div className="flex w-full items-center gap-2">
        <span
          className={cn("h-2 w-2 rounded-full", severityColors[severity])}
        />
        <span className="font-medium">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground">{time}</span>
      </div>
      <span className="text-sm text-muted-foreground">{description}</span>
    </DropdownMenuItem>
  );
}
