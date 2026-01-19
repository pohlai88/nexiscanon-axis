"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { toast } from "sonner"
import * as z from "zod"
import {
  Button,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Switch,
} from "@workspace/design-system"

const formSchema = z.object({
  twoFactor: z.boolean(),
  marketing: z.boolean(),
})

export function SwitchTanStackForm() {
  const form = useForm({
    defaultValues: {
      twoFactor: false,
      marketing: false,
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
      toast.success("Settings saved successfully!")
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.Field
        name="twoFactor"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field orientation="horizontal" data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor="two-factor-tanstack">
                  Multi-factor authentication
                </FieldLabel>
                <FieldDescription>
                  Enable multi-factor authentication to secure your account.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldContent>
              <Switch
                id="two-factor-tanstack"
                name={field.name}
                checked={field.state.value}
                onCheckedChange={field.handleChange}
                aria-invalid={isInvalid}
              />
            </Field>
          )
        }}
      />

      <form.Field
        name="marketing"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field orientation="horizontal" data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor="marketing-tanstack">
                  Marketing emails
                </FieldLabel>
                <FieldDescription>
                  Receive emails about new features and updates.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldContent>
              <Switch
                id="marketing-tanstack"
                name={field.name}
                checked={field.state.value}
                onCheckedChange={field.handleChange}
                aria-invalid={isInvalid}
              />
            </Field>
          )
        }}
      />

      <Button type="submit" disabled={form.state.isSubmitting}>
        Save Settings
      </Button>
    </form>
  )
}
