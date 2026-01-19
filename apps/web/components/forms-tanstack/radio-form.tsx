"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { toast } from "sonner";
import * as z from "zod";
import {
  Button,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
  FieldTitle,
  RadioGroup,
  RadioGroupItem,
} from "@workspace/design-system";

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
];

const formSchema = z.object({
  plan: z.string().min(1, "Please select a plan."),
});

export function RadioTanStackForm() {
  const form = useForm({
    defaultValues: {
      plan: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      toast.success(`${value.plan} plan selected!`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="plan"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <FieldSet>
              <FieldLegend>Plan</FieldLegend>
              <FieldDescription>
                You can upgrade or downgrade your plan at any time.
              </FieldDescription>
              <RadioGroup
                name={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                {plans.map((plan) => (
                  <label key={plan.id} htmlFor={`plan-tanstack-${plan.id}`}>
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldTitle>{plan.title}</FieldTitle>
                        <FieldDescription>{plan.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        value={plan.id}
                        id={`plan-tanstack-${plan.id}`}
                        aria-invalid={isInvalid}
                      />
                    </Field>
                  </label>
                ))}
              </RadioGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      />

      <Button type="submit" disabled={form.state.isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
