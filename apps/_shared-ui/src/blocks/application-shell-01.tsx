import React from "react";
import { DashboardSidebar01, SidebarNavItem } from "./dashboard-sidebar-01";
import { DashboardHeader01, BreadcrumbItem } from "./dashboard-header-01";

export interface ApplicationShell01Props {
  children: React.ReactNode;
  sidebarItems?: SidebarNavItem[];
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onLanguageChange?: (lang: string) => void;
  currentLanguage?: string;
}

/**
 * Application Shell 01
 * 
 * Classic sidebar application shell with navigation menu, user profile,
 * and language selector for traditional dashboard layouts.
 * 
 * @meta
 * - Category: dashboard-and-application
 * - Section: application-shell
 * - Use Cases: Admin dashboards, Management systems, Enterprise apps
 */
export function ApplicationShell01({
  children,
  sidebarItems,
  breadcrumbs,
  user,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  onLanguageChange,
  currentLanguage,
}: ApplicationShell01Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <DashboardSidebar01 items={sidebarItems} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader01
          breadcrumbs={breadcrumbs}
          user={user}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
          onLogoutClick={onLogoutClick}
          onLanguageChange={onLanguageChange}
          currentLanguage={currentLanguage}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
