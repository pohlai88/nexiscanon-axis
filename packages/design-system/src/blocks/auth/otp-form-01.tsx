"use client"

import * as React from "react"
import { Button } from "@/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/input-otp"
import { cn } from "@/lib/utils"

export interface OTPForm01Props {
  onSubmit?: (otp: string) => void
  onResend?: () => void
  title?: string
  description?: string
  submitLabel?: string
  length?: number
  isLoading?: boolean
  className?: string
}

export function OTPForm01({
  onSubmit,
  onResend,
  title = "Enter verification code",
  description = "We sent a 6-digit code to your email.",
  submitLabel = "Verify",
  length = 6,
  isLoading = false,
  className,
}: OTPForm01Props) {
  const [otp, setOtp] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === length) {
      onSubmit?.(otp)
    }
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <InputOTP
                maxLength={length}
                id="otp"
                value={otp}
                onChange={setOtp}
                required
              >
                <InputOTPGroup className="gap-2.5">
                  {Array.from({ length }, (_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="rounded-md border"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Enter the {length}-digit code sent to your email.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={isLoading || otp.length < length} className="w-full">
                {isLoading ? "Verifying..." : submitLabel}
              </Button>
              {onResend && (
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={onResend}
                    className="underline underline-offset-4"
                  >
                    Resend
                  </button>
                </FieldDescription>
              )}
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
