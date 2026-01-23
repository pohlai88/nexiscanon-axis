"use client"

import * as React from "react"
import { ArrowUpRight, Link, MoreHorizontal, StarOff, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../components/sidebar"

export interface FavoriteItem {
  name: string
  url: string
  emoji?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface NavFavoritesProps {
  favorites: FavoriteItem[]
  label?: string
  onRemove?: (item: FavoriteItem) => void
  onCopyLink?: (item: FavoriteItem) => void
  onOpenNewTab?: (item: FavoriteItem) => void
  onDelete?: (item: FavoriteItem) => void
  showMoreButton?: boolean
  onMoreClick?: () => void
}

export function NavFavorites({
  favorites,
  label = "Favorites",
  onRemove,
  onCopyLink,
  onOpenNewTab,
  onDelete,
  showMoreButton = true,
  onMoreClick,
}: NavFavoritesProps) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton>
              <a href={item.url} title={item.name} className="flex items-center gap-2">
                {item.emoji && <span>{item.emoji}</span>}
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="truncate">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                {onRemove && (
                  <DropdownMenuItem onClick={() => onRemove(item)}>
                    <StarOff className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Remove from Favorites</span>
                  </DropdownMenuItem>
                )}
                {(onCopyLink || onOpenNewTab) && <DropdownMenuSeparator />}
                {onCopyLink && (
                  <DropdownMenuItem onClick={() => onCopyLink(item)}>
                    <Link className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                )}
                {onOpenNewTab && (
                  <DropdownMenuItem onClick={() => onOpenNewTab(item)}>
                    <ArrowUpRight className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(item)}>
                      <Trash2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {showMoreButton && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              onClick={onMoreClick}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
