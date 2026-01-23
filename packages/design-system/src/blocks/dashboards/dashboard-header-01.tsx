"use client"

import * as React from "react"
import { Bell, Menu, Search, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/avatar"
import { Button } from "../../components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu"
import { Input } from "../../components/input"
import { cn } from "../../lib/utils"

export interface DashboardHeaderUser {
  name: string
  email?: string
  avatarUrl?: string
  initials?: string
}

export interface DashboardHeaderNotification {
  id: string
  title: string
  description?: string
  time?: string
  read?: boolean
}

export interface DashboardHeader01Props {
  user?: DashboardHeaderUser
  notifications?: DashboardHeaderNotification[]
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  onMenuClick?: () => void
  onNotificationClick?: (notification: DashboardHeaderNotification) => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout?: () => void
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  className?: string
}

export function DashboardHeader01({
  user,
  notifications = [],
  showSearch = true,
  searchPlaceholder = "Search...",
  onSearch,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  leftContent,
  rightContent,
  className,
}: DashboardHeader01Props) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
        className
      )}
    >
      {/* Mobile menu button */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}

      {/* Left content */}
      {leftContent && <div className="flex items-center gap-2">{leftContent}</div>}

      {/* Search */}
      {showSearch && (
        <form
          onSubmit={handleSearchSubmit}
          className="hidden flex-1 md:flex md:max-w-sm"
        >
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-8"
            />
          </div>
        </form>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Custom right content */}
        {rightContent}

        {/* Notifications */}
        {notifications.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => onNotificationClick?.(notification)}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !notification.read && "text-primary"
                      )}
                    >
                      {notification.title}
                    </span>
                    {notification.time && (
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    )}
                  </div>
                  {notification.description && (
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>
                    {user.initials || user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
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
              <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
