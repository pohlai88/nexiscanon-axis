"use client"

import * as React from "react"
import { ChevronRight, Search } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/collapsible"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/sidebar"
import { cn } from "@/lib/utils"

export interface DocsSidebarItem {
  title: string
  url: string
  isActive?: boolean
}

export interface DocsSidebarSection {
  title: string
  url?: string
  items: DocsSidebarItem[]
  defaultOpen?: boolean
}

export interface DocsSidebar01Props {
  sections: DocsSidebarSection[]
  header?: React.ReactNode
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export function DocsSidebar01({
  sections,
  header,
  showSearch = true,
  searchPlaceholder = "Search docs...",
  onSearch,
  className,
}: DocsSidebar01Props) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <Sidebar className={cn(className)}>
      <SidebarHeader>
        {header}
        {showSearch && (
          <SidebarGroup className="py-0">
            <SidebarGroupContent className="relative">
              <Label htmlFor="docs-search" className="sr-only">
                Search
              </Label>
              <Input
                id="docs-search"
                placeholder={searchPlaceholder}
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 opacity-50 select-none" />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {sections.map((section) => (
          <Collapsible
            key={section.title}
            title={section.title}
            defaultOpen={section.defaultOpen !== false}
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm cursor-pointer">
                <CollapsibleTrigger className="flex w-full items-center">
                  {section.title}
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
