"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar"
import { cn } from "@/lib/utils"

export interface AppSidebar01Props {
  navigation: Array<{
    href: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
  }>
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AppSidebar01({
  navigation,
  header,
  footer,
  className,
}: AppSidebar01Props) {
  return (
    <Sidebar className={cn(className)}>
      {header && <SidebarHeader>{header}</SidebarHeader>}
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton>
                <a href={item.href} className="flex items-center gap-2 w-full">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
    </Sidebar>
  )
}
