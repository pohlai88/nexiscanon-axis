"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../components/command"
import { cn } from "../../lib/utils"

export interface CommandAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  onSelect: () => void
}

export interface CommandPaletteGroup {
  heading: string
  actions: CommandAction[]
}

export interface CommandPalette01Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandPaletteGroup[]
  placeholder?: string
  emptyMessage?: string
  className?: string
}

export function CommandPalette01({
  open,
  onOpenChange,
  groups,
  placeholder = "Type a command or search...",
  emptyMessage = "No results found.",
  className,
}: CommandPalette01Props) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className={cn("rounded-lg border shadow-md", className)}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {groups.map((group, groupIndex) => (
            <React.Fragment key={group.heading}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group.heading}>
                {group.actions.map((action) => {
                  const Icon = action.icon
                  return (
                    <CommandItem
                      key={action.id}
                      onSelect={() => {
                        action.onSelect()
                        onOpenChange(false)
                      }}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <span>{action.label}</span>
                      {action.shortcut && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {action.shortcut}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

// Hook for keyboard shortcut
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return { open, setOpen }
}
