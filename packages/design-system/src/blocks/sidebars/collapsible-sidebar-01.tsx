"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../../components/sidebar"
import { NavMain, type NavMainItem } from "./nav-main"
import { NavUser, type NavUserProps } from "./nav-user"
import { TeamSwitcher, type Team } from "./team-switcher"
import { cn } from "../../lib/utils"

export interface CollapsibleSidebar01Props {
  teams?: Team[]
  navigation: NavMainItem[]
  user: NavUserProps["user"]
  navLabel?: string
  onUpgrade?: () => void
  onAccount?: () => void
  onBilling?: () => void
  onNotifications?: () => void
  onLogout?: () => void
  onTeamChange?: (team: Team) => void
  onAddTeam?: () => void
  className?: string
}

export function CollapsibleSidebar01({
  teams,
  navigation,
  user,
  navLabel = "Platform",
  onUpgrade,
  onAccount,
  onBilling,
  onNotifications,
  onLogout,
  onTeamChange,
  onAddTeam,
  className,
}: CollapsibleSidebar01Props) {
  return (
    <Sidebar collapsible="icon" className={cn(className)}>
      {teams && teams.length > 0 && (
        <SidebarHeader>
          <TeamSwitcher
            teams={teams}
            onTeamChange={onTeamChange}
            onAddTeam={onAddTeam}
          />
        </SidebarHeader>
      )}
      <SidebarContent>
        <NavMain items={navigation} label={navLabel} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={user}
          onUpgrade={onUpgrade}
          onAccount={onAccount}
          onBilling={onBilling}
          onNotifications={onNotifications}
          onLogout={onLogout}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
