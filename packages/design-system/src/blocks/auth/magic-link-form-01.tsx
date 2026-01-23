"use client"

import * as React from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/field"
import { Input } from "@/components/input"
import { cn } from "@/lib/utils"

export interface MagicLinkForm01Props {
  onSubmit?: (email: string) => void | Promise<void>
  onPasswordLogin?: () => void
  title?: string
  description?: string
  isLoading?: boolean
  className?: string
}

export function MagicLinkForm01({
  onSubmit,
  onPasswordLogin,
  title = "Sign in with email",
  description = "Enter your email and we'll send you a magic link to sign in.",
  isLoading = false,
  className,
}: MagicLinkForm01Props) {
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit?.(email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card className={cn("w-[400px]", className)}>
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Click the link in your email to sign in. The link will expire in 10 minutes.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="w-full"
          >
            Try a different email
          </Button>
          {onPasswordLogin && (
            <FieldDescription className="text-center">
              Or{" "}
              <button
                type="button"
                onClick={onPasswordLogin}
                className="underline underline-offset-4"
              >
                sign in with password
              </button>
            </FieldDescription>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={cn("w-[400px]", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="magic-email">Email address</FieldLabel>
              <Input
                id="magic-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? "Sending..." : "Send magic link"}
          </Button>
          {onPasswordLogin && (
            <>
              <FieldSeparator>Or</FieldSeparator>
              <Button
                variant="outline"
                type="button"
                onClick={onPasswordLogin}
                className="w-full"
              >
                Sign in with password
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
