import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/design-system/components/avatar';
import { Button } from '@workspace/design-system/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/design-system/components/dropdown-menu';
import { ChevronDown, Globe, User, Settings, LogOut } from 'lucide-react';
import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface DashboardHeader01Props {
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
 * Dashboard Header 01
 *
 * Comprehensive dashboard header with navigation, breadcrumbs, user profile,
 * and language dropdown for efficient dashboard management.
 *
 * @meta
 * - Category: dashboard-and-application
 * - Section: dashboard-header
 * - Use Cases: Multi-language dashboards, User-centric admin interfaces
 */
export function DashboardHeader01({
  breadcrumbs = [],
  user,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  onLanguageChange,
  currentLanguage = 'EN',
}: DashboardHeader01Props) {
  return (
    <header className="bg-card flex h-16 items-center justify-between border-b px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {crumb.href ? (
              <a
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span>{currentLanguage}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onLanguageChange?.('EN')}>
              English (EN)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange?.('ES')}>
              Español (ES)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange?.('FR')}>
              Français (FR)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange?.('DE')}>
              Deutsch (DE)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-7 w-7">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  )}
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden font-medium md:inline">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogoutClick}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
