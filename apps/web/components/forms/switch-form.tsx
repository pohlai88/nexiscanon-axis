"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
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

type FormData = z.infer<typeof formSchema>

export function SwitchForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      twoFactor: false,
      marketing: false,
    },
  })

  function onSubmit(data: FormData) {
    console.log("Form submitted:", data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="twoFactor"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor="two-factor">
                Multi-factor authentication
              </FieldLabel>
              <FieldDescription>
                Enable multi-factor authentication to secure your account.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Switch
              id="two-factor"
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />

      <Controller
        name="marketing"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor="marketing">Marketing emails</FieldLabel>
              <FieldDescription>
                Receive emails about new features and updates.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Switch
              id="marketing"
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />

      <Button type="submit">Save Settings</Button>
    </form>
  )
}
