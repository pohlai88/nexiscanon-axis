"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/popover"
import { Button } from "../../components/button"
import { Badge } from "../../components/badge"
import { ScrollArea } from "../../components/scroll-area"
import { Separator } from "../../components/separator"
import { cn } from "../../lib/utils"
import { Bell, Check, X } from "lucide-react"

export interface Notification {
  id: string
  title: string
  description?: string
  time: string
  read: boolean
  type?: "info" | "success" | "warning" | "error"
  icon?: React.ComponentType<{ className?: string }>
}

export interface NotificationCenter01Props {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDismiss: (id: string) => void
  onClearAll: () => void
  className?: string
}

export function NotificationCenter01({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  className,
}: NotificationCenter01Props) {
  const unreadCount = notifications.filter((n) => !n.read).length

  const typeColors = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-auto p-0 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative rounded-lg p-3 hover:bg-accent",
                      !notification.read && "bg-accent/50"
                    )}
                  >
                    <div className="flex gap-3">
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-5 w-5 mt-0.5",
                            notification.type && typeColors[notification.type]
                          )}
                        />
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {notification.description && (
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onDismiss(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="w-full"
              >
                Clear all
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
