"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar"
import { Separator } from "@/components/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb"

export interface ApplicationShellBreadcrumb {
  label: string
  href?: string
}

export interface ApplicationShell01Props {
  sidebarHeader?: React.ReactNode
  sidebarContent?: React.ReactNode
  sidebarFooter?: React.ReactNode
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
  breadcrumbs?: ApplicationShellBreadcrumb[]
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function ApplicationShell01({
  sidebarHeader,
  sidebarContent,
  sidebarFooter,
  headerLeft,
  headerRight,
  breadcrumbs,
  children,
  defaultOpen = true,
  className,
}: ApplicationShell01Props) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar variant="inset">
        {sidebarHeader && <SidebarHeader>{sidebarHeader}</SidebarHeader>}
        <SidebarContent>{sidebarContent}</SidebarContent>
        {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem
                      className={
                        index < breadcrumbs.length - 1 ? "hidden md:block" : ""
                      }
                    >
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href || "#"}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {headerLeft && (
            <div className="flex items-center gap-2">{headerLeft}</div>
          )}

          {headerRight && (
            <div className="ml-auto flex items-center gap-2">{headerRight}</div>
          )}
        </header>

        <main className={cn("flex-1 overflow-auto p-4 md:p-6", className)}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
