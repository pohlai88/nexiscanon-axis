"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/separator"

export interface FooterLink {
  label: string
  href: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterSocialLink {
  label: string
  href: string
  icon: React.ReactNode
}

export interface Footer01Props {
  logo?: React.ReactNode
  description?: string
  sections?: FooterSection[]
  socialLinks?: FooterSocialLink[]
  copyright?: string
  bottomLinks?: FooterLink[]
  className?: string
}

export function Footer01({
  logo,
  description,
  sections = [],
  socialLinks = [],
  copyright,
  bottomLinks = [],
  className,
}: Footer01Props) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            {logo && <div className="mb-4">{logo}</div>}
            {description && (
              <p className="text-sm text-muted-foreground max-w-xs">
                {description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-6">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {copyright || `© ${currentYear} All rights reserved.`}
          </p>
          {bottomLinks.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {bottomLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
