import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/design-system/components/avatar';
import { Badge } from '@workspace/design-system/components/badge';
import { Button } from '@workspace/design-system/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/design-system/components/dropdown-menu';
import { cn } from '@workspace/design-system/lib/utils';
import {
  Menu,
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  History,
  Shield,
} from 'lucide-react';
import React from 'react';

export interface NavbarOverlayProps {
  logo?: React.ReactNode;
  title?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  notifications?: number;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  onAuditTrailClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  showAuditTrail?: boolean;
  transparent?: boolean;
  fixed?: boolean;
  className?: string;
}

/**
 * Navbar Overlay
 *
 * **Problem Solved**: Fixed navigation bars consume screen space and hide content.
 * Users need quick access to audit trails, notifications, and account actions
 * without leaving their current context.
 *
 * **Innovation**:
 * - Transparent overlay mode with backdrop blur
 * - Quick access to audit trail viewer
 * - Notification center integration
 * - Command palette trigger (⌘K)
 * - User menu with role badge
 * - Responsive mobile hamburger
 *
 * **Business Value**:
 * - Maximizes content viewing area
 * - Improves audit trail accessibility
 * - Reduces navigation friction
 *
 * @meta
 * - Category: Layout & Navigation
 * - Pain Point: Navigation taking up valuable screen space
 * - Use Cases: Admin panels, Audit systems, Full-screen apps
 */
export function NavbarOverlay({
  logo,
  title = 'NexusCanon',
  user,
  notifications = 0,
  onNotificationClick,
  onSearchClick,
  onAuditTrailClick,
  onSettingsClick,
  onLogout,
  showAuditTrail = true,
  transparent = false,
  fixed = true,
  className,
}: NavbarOverlayProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchClick?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  return (
    <nav
      className={cn(
        'z-50 w-full border-b',
        fixed && 'fixed top-0 right-0 left-0',
        transparent
          ? 'bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md'
          : 'bg-background',
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {logo || (
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-sm font-bold">NC</span>
            </div>
          )}
          <span className="hidden text-lg font-semibold md:inline-block">
            {title}
          </span>
        </div>

        {/* Center: Quick Actions (Desktop) */}
        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {showAuditTrail && onAuditTrailClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAuditTrailClick}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              <span>Audit Trail</span>
            </Button>
          )}

          {onSearchClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSearchClick}
              className="w-64 justify-between"
            >
              <div className="text-muted-foreground flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search...</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                ⌘K
              </Badge>
            </Button>
          )}
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {onNotificationClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
                >
                  {notifications > 99 ? '99+' : notifications}
                </Badge>
              )}
            </Button>
          )}

          {/* Settings */}
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="hidden md:inline-flex"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 gap-2 pr-3 pl-2"
                >
                  <Avatar className="h-7 w-7 border">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm md:inline-block">
                    {user.name}
                  </span>
                  {user.role && (
                    <Badge
                      variant="outline"
                      className="hidden text-xs md:inline-flex"
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                    {user.role && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {showAuditTrail && onAuditTrailClick && (
                  <DropdownMenuItem onClick={onAuditTrailClick}>
                    <History className="mr-2 h-4 w-4" />
                    <span>Audit Trail</span>
                  </DropdownMenuItem>
                )}
                {onSettingsClick && (
                  <DropdownMenuItem onClick={onSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-background border-t p-4 md:hidden">
          <div className="space-y-2">
            {showAuditTrail && onAuditTrailClick && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onAuditTrailClick();
                  setMobileMenuOpen(false);
                }}
              >
                <History className="h-4 w-4" />
                <span>Audit Trail</span>
              </Button>
            )}
            {onSearchClick && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onSearchClick();
                  setMobileMenuOpen(false);
                }}
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>
            )}
            {onSettingsClick && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onSettingsClick();
                  setMobileMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
