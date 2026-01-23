"use client"

import * as React from "react"
import { Button } from "../../components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { SidebarInput } from "../../components/sidebar"
import { cn } from "../../lib/utils"

export interface SidebarOptInFormProps {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  onSubmit?: (email: string) => void | Promise<void>
  className?: string
}

export function SidebarOptInForm({
  title = "Subscribe to our newsletter",
  description = "Opt-in to receive updates and news.",
  placeholder = "Email",
  buttonText = "Subscribe",
  onSubmit,
  className,
}: SidebarOptInFormProps) {
  const [email, setEmail] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(email)
      setEmail("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn("gap-2 py-4 shadow-none", className)}>
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2.5">
            <SidebarInput
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
