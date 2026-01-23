"use client"

import * as React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "../../components/sidebar"
import { cn } from "../../lib/utils"

export interface DashboardLayout01Props {
  sidebar: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  sidebarWidth?: string
  headerHeight?: string
  className?: string
}

export function DashboardLayout01({
  sidebar,
  header,
  children,
  sidebarWidth = "calc(var(--spacing) * 72)",
  headerHeight = "calc(var(--spacing) * 12)",
  className,
}: DashboardLayout01Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": sidebarWidth,
          "--header-height": headerHeight,
        } as React.CSSProperties
      }
    >
      {sidebar}
      <SidebarInset>
        {header}
        <div className={cn("flex flex-1 flex-col", className)}>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
