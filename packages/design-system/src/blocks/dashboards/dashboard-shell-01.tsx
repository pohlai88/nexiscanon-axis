"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DashboardShell01Props {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  sidebarPosition?: "left" | "right"
  sidebarWidth?: string
  sidebarCollapsed?: boolean
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function DashboardShell01({
  header,
  sidebar,
  footer,
  children,
  sidebarPosition = "left",
  sidebarWidth = "280px",
  sidebarCollapsed = false,
  showHeader = true,
  showFooter = false,
  className,
}: DashboardShell01Props) {
  const collapsedWidth = "64px"
  const currentWidth = sidebarCollapsed ? collapsedWidth : sidebarWidth

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {/* Header */}
      {showHeader && header && (
        <header className="sticky top-0 z-50 border-b bg-background">
          {header}
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Left */}
        {sidebar && sidebarPosition === "left" && (
          <aside
            className="sticky top-0 h-screen shrink-0 border-r bg-background transition-all duration-300"
            style={{ width: currentWidth }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>

        {/* Sidebar - Right */}
        {sidebar && sidebarPosition === "right" && (
          <aside
            className="sticky top-0 h-screen shrink-0 border-l bg-background transition-all duration-300"
            style={{ width: currentWidth }}
          >
            {sidebar}
          </aside>
        )}
      </div>

      {/* Footer */}
      {showFooter && footer && (
        <footer className="border-t bg-background">{footer}</footer>
      )}
    </div>
  )
}

// Variant: Full-width header above sidebar
export interface DashboardShell02Props {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  children: React.ReactNode
  sidebarWidth?: string
  className?: string
}

export function DashboardShell02({
  header,
  sidebar,
  children,
  sidebarWidth = "280px",
  className,
}: DashboardShell02Props) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {/* Full-width Header */}
      {header && (
        <header className="sticky top-0 z-50 border-b bg-background">
          {header}
        </header>
      )}

      {/* Content with Sidebar */}
      <div className="flex flex-1">
        {sidebar && (
          <aside
            className="hidden md:flex shrink-0 flex-col border-r bg-muted/40"
            style={{ width: sidebarWidth }}
          >
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

// Variant: Sidebar with inset content
export interface DashboardShell03Props {
  sidebar?: React.ReactNode
  children: React.ReactNode
  sidebarWidth?: string
  className?: string
}

export function DashboardShell03({
  sidebar,
  children,
  sidebarWidth = "280px",
  className,
}: DashboardShell03Props) {
  return (
    <div className={cn("flex min-h-screen bg-muted/40", className)}>
      {sidebar && (
        <aside
          className="hidden md:flex shrink-0 flex-col border-r bg-background"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>
      )}
      <main className="flex-1 p-4 md:p-6">
        <div className="rounded-xl border bg-background shadow-sm min-h-full p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
