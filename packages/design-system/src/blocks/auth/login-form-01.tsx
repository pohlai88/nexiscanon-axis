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
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { Button } from "../../components/button"
import { cn } from "../../lib/utils"

export interface LoginForm01Props {
  onSubmit?: (data: { email: string; password: string }) => void
  isLoading?: boolean
  title?: string
  description?: string
  className?: string
}

export function LoginForm01({
  onSubmit,
  isLoading = false,
  title = "Sign in to AXIS",
  description = "Enter your credentials to access your account",
  className,
}: LoginForm01Props) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ email, password })
  }

  return (
    <Card className={cn("w-[400px]", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <Button variant="link" className="text-sm">
            Forgot password?
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
