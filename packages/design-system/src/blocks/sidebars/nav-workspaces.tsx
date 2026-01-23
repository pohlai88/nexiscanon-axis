"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../components/sidebar"

export interface WorkspacePage {
  name: string
  url?: string
  emoji?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface Workspace {
  name: string
  emoji?: string
  icon?: React.ComponentType<{ className?: string }>
  pages: WorkspacePage[]
}

export interface NavWorkspacesProps {
  workspaces: Workspace[]
  label?: string
  onAddPage?: (workspace: Workspace) => void
  showMoreButton?: boolean
  onMoreClick?: () => void
}

export function NavWorkspaces({
  workspaces,
  label = "Workspaces",
  onAddPage,
  showMoreButton = true,
  onMoreClick,
}: NavWorkspacesProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <Collapsible key={workspace.name}>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <a href="#" className="flex items-center gap-2">
                    {workspace.emoji && <span>{workspace.emoji}</span>}
                    {workspace.icon && <workspace.icon className="h-4 w-4" />}
                    <span>{workspace.name}</span>
                  </a>
                </SidebarMenuButton>
                <CollapsibleTrigger>
                  <SidebarMenuAction
                    className="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-[state=open]:rotate-90"
                    showOnHover
                  >
                    <ChevronRight className="h-4 w-4" />
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                {onAddPage && (
                  <SidebarMenuAction showOnHover onClick={() => onAddPage(workspace)}>
                    <Plus className="h-4 w-4" />
                  </SidebarMenuAction>
                )}
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {workspace.pages.map((page) => (
                      <SidebarMenuSubItem key={page.name}>
                        <SidebarMenuSubButton>
                          <a href={page.url || "#"} className="flex items-center gap-2">
                            {page.emoji && <span>{page.emoji}</span>}
                            {page.icon && <page.icon className="h-4 w-4" />}
                            <span>{page.name}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
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
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
