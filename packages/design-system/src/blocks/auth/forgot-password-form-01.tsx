"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "../../components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Field, FieldGroup, FieldLabel } from "../../components/field"
import { Input } from "../../components/input"
import { cn } from "../../lib/utils"

export interface ForgotPasswordForm01Props {
  onSubmit?: (email: string) => void | Promise<void>
  onBack?: () => void
  title?: string
  description?: string
  submitLabel?: string
  isLoading?: boolean
  className?: string
}

export function ForgotPasswordForm01({
  onSubmit,
  onBack,
  title = "Forgot password?",
  description = "Enter your email address and we'll send you a link to reset your password.",
  submitLabel = "Send reset link",
  isLoading = false,
  className,
}: ForgotPasswordForm01Props) {
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
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="underline underline-offset-4"
            >
              try again
            </button>
          </p>
        </CardContent>
        {onBack && (
          <CardFooter>
            <Button variant="ghost" onClick={onBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </CardFooter>
        )}
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
              <FieldLabel htmlFor="forgot-email">Email address</FieldLabel>
              <Input
                id="forgot-email"
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
            {isLoading ? "Sending..." : submitLabel}
          </Button>
          {onBack && (
            <Button variant="ghost" type="button" onClick={onBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
