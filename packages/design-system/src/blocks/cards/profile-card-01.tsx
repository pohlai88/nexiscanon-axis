"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/avatar"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { cn } from "../../lib/utils"

export interface ProfileCard01Props {
  name: string
  email?: string
  role?: string
  avatar?: string
  status?: "active" | "inactive" | "pending"
  stats?: Array<{
    label: string
    value: string | number
  }>
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "ghost"
  }>
  className?: string
}

export function ProfileCard01({
  name,
  email,
  role,
  avatar,
  status,
  stats,
  actions,
  className,
}: ProfileCard01Props) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    pending: "bg-yellow-500",
  }

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {status && (
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background",
                  statusColors[status]
                )}
              />
            )}
          </div>
        </div>
        <CardTitle className="mt-4">{name}</CardTitle>
        {email && (
          <CardDescription className="text-sm">{email}</CardDescription>
        )}
        {role && (
          <div className="mt-2">
            <Badge variant="secondary">{role}</Badge>
          </div>
        )}
      </CardHeader>
      {stats && stats.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant={action.variant || "default"}
              onClick={action.onClick}
              className="flex-1"
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
