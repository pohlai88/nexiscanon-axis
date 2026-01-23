"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../components/sidebar"

export interface NavDropdownSubItem {
  title: string
  url: string
}

export interface NavDropdownItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavDropdownSubItem[]
}

export interface NavDropdownProps {
  items: NavDropdownItem[]
}

export function NavDropdown({ items }: NavDropdownProps) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <DropdownMenu key={item.title}>
            <SidebarMenuItem>
              <DropdownMenuTrigger>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                  <MoreHorizontal className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {item.items?.length ? (
                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                  className="min-w-56 rounded-lg"
                >
                  {item.items.map((subItem) => (
                    <DropdownMenuItem key={subItem.title}>
                      <a href={subItem.url}>{subItem.title}</a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              ) : null}
            </SidebarMenuItem>
          </DropdownMenu>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
