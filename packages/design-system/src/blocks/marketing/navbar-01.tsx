"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/button"
import { cn } from "@/lib/utils"

export interface NavLink {
  label: string
  href: string
  active?: boolean
}

export interface Navbar01Props {
  logo?: React.ReactNode
  links?: NavLink[]
  actions?: React.ReactNode
  sticky?: boolean
  transparent?: boolean
  className?: string
}

export function Navbar01({
  logo,
  links = [],
  actions,
  sticky = true,
  transparent = false,
  className,
}: Navbar01Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header
      className={cn(
        "z-50 w-full border-b",
        sticky && "sticky top-0",
        transparent ? "bg-transparent" : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        {logo && <div className="flex items-center">{logo}</div>}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-primary",
                link.active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        {actions && (
          <div className="hidden md:flex items-center gap-2">{actions}</div>
        )}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-3">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 hover:text-primary py-2",
                  link.active ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {actions && <div className="pt-4 border-t">{actions}</div>}
          </nav>
        </div>
      )}
    </header>
  )
}

// Centered variant
export interface Navbar02Props {
  logo?: React.ReactNode
  leftLinks?: NavLink[]
  rightLinks?: NavLink[]
  actions?: React.ReactNode
  sticky?: boolean
  className?: string
}

export function Navbar02({
  logo,
  leftLinks = [],
  rightLinks = [],
  actions,
  sticky = true,
  className,
}: Navbar02Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const allLinks = [...leftLinks, ...rightLinks]

  return (
    <header
      className={cn(
        "z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        sticky && "sticky top-0",
        className
      )}
    >
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Left Links */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {leftLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-primary",
                link.active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Centered Logo */}
        {logo && (
          <div className="flex items-center justify-center flex-shrink-0">
            {logo}
          </div>
        )}

        {/* Right Links + Actions */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
          {rightLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-primary",
                link.active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-3">
            {allLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200 hover:text-primary py-2",
                  link.active ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {actions && <div className="pt-4 border-t">{actions}</div>}
          </nav>
        </div>
      )}
    </header>
  )
}
