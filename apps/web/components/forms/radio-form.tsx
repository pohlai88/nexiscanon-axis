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
  FieldLegend,
  FieldSet,
  FieldTitle,
  RadioGroup,
  RadioGroupItem,
} from "@workspace/design-system"

const plans = [
  {
    id: "free",
    title: "Free",
    description: "Basic features for personal use",
  },
  {
    id: "pro",
    title: "Pro",
    description: "Advanced features for professionals",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "Custom solutions for large teams",
  },
]

const formSchema = z.object({
  plan: z.string().min(1, "Please select a plan."),
})

type FormData = z.infer<typeof formSchema>

export function RadioForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plan: "",
    },
  })

  function onSubmit(data: FormData) {
    console.log("Form submitted:", data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="plan"
        control={form.control}
        render={({ field, fieldState }) => (
          <FieldSet>
            <FieldLegend>Plan</FieldLegend>
            <FieldDescription>
              You can upgrade or downgrade your plan at any time.
            </FieldDescription>
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              {plans.map((plan) => (
                <FieldLabel key={plan.id} htmlFor={`plan-${plan.id}`}>
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldTitle>{plan.title}</FieldTitle>
                      <FieldDescription>{plan.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={plan.id}
                      id={`plan-${plan.id}`}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <Button type="submit">Continue</Button>
    </form>
  )
}
