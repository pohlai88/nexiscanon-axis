"use client"

import * as React from "react"
import { Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/field"
import { Input } from "@/components/input"
import { cn } from "@/lib/utils"

export interface ResetPasswordForm01Props {
  onSubmit?: (password: string) => void | Promise<void>
  onLogin?: () => void
  title?: string
  description?: string
  minLength?: number
  requireUppercase?: boolean
  requireNumber?: boolean
  requireSpecial?: boolean
  isLoading?: boolean
  className?: string
}

export function ResetPasswordForm01({
  onSubmit,
  onLogin,
  title = "Reset your password",
  description = "Enter your new password below.",
  minLength = 8,
  requireUppercase = true,
  requireNumber = true,
  requireSpecial = false,
  isLoading = false,
  className,
}: ResetPasswordForm01Props) {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const validations = React.useMemo(() => {
    const checks = [
      { label: `At least ${minLength} characters`, valid: password.length >= minLength },
    ]
    if (requireUppercase) {
      checks.push({ label: "One uppercase letter", valid: /[A-Z]/.test(password) })
    }
    if (requireNumber) {
      checks.push({ label: "One number", valid: /\d/.test(password) })
    }
    if (requireSpecial) {
      checks.push({ label: "One special character", valid: /[!@#$%^&*]/.test(password) })
    }
    return checks
  }, [password, minLength, requireUppercase, requireNumber, requireSpecial])

  const isValid = validations.every((v) => v.valid) && password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    await onSubmit?.(password)
    setSuccess(true)
  }

  if (success) {
    return (
      <Card className={cn("w-[400px]", className)}>
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-center">Password reset successful</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully reset. You can now log in with your new password.
          </CardDescription>
        </CardHeader>
        {onLogin && (
          <CardFooter>
            <Button onClick={onLogin} className="w-full">
              Continue to login
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
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {validations.map((v, i) => (
                  <FieldDescription
                    key={i}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      v.valid ? "text-green-600" : "text-muted-foreground"
                    )}
                  >
                    <Check className={cn("h-3 w-3", v.valid ? "opacity-100" : "opacity-0")} />
                    {v.label}
                  </FieldDescription>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <FieldDescription className="text-destructive">
                  Passwords do not match
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
            {isLoading ? "Resetting..." : "Reset password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
