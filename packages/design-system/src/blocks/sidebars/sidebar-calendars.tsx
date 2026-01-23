"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../../components/sidebar"

export interface CalendarItem {
  name: string
  active?: boolean
}

export interface CalendarGroup {
  name: string
  items: CalendarItem[]
}

export interface SidebarCalendarsProps {
  calendars: CalendarGroup[]
  onToggle?: (groupName: string, itemName: string, active: boolean) => void
}

export function SidebarCalendars({ calendars, onToggle }: SidebarCalendarsProps) {
  const [activeItems, setActiveItems] = React.useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {}
    calendars.forEach((cal) => {
      initial[cal.name] = new Set(
        cal.items.filter((item) => item.active).map((item) => item.name)
      )
    })
    return initial
  })

  const handleToggle = (groupName: string, itemName: string) => {
    setActiveItems((prev) => {
      const newState = { ...prev }
      const groupSet = new Set(prev[groupName] || [])
      
      if (groupSet.has(itemName)) {
        groupSet.delete(itemName)
        onToggle?.(groupName, itemName, false)
      } else {
        groupSet.add(itemName)
        onToggle?.(groupName, itemName, true)
      }
      
      newState[groupName] = groupSet
      return newState
    })
  }

  return (
    <>
      {calendars.map((calendar, index) => (
        <React.Fragment key={calendar.name}>
          <SidebarGroup className="py-0">
            <Collapsible defaultOpen={index === 0} className="group/collapsible">
              <SidebarGroupLabel className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm">
                <CollapsibleTrigger className="flex w-full items-center">
                  {calendar.name}
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {calendar.items.map((item) => {
                      const isActive = activeItems[calendar.name]?.has(item.name) || false
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            onClick={() => handleToggle(calendar.name, item.name)}
                          >
                            <div
                              data-active={isActive}
                              className="group/calendar-item border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border"
                            >
                              <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                            </div>
                            {item.name}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator className="mx-0" />
        </React.Fragment>
      ))}
    </>
  )
}
