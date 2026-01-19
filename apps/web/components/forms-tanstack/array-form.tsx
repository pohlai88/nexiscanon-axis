"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import {
  Button,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/design-system";

const formSchema = z.object({
  emails: z
    .array(
      z.object({
        address: z.string().email("Enter a valid email address."),
      })
    )
    .min(1, "Add at least one email address.")
    .max(5, "You can add up to 5 email addresses."),
});

export function ArrayTanStackForm() {
  const form = useForm({
    defaultValues: {
      emails: [{ address: "" }],
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      toast.success("Email addresses saved!");
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
        name="emails"
        mode="array"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <FieldSet className="gap-4">
              <FieldLegend variant="label">Email Addresses</FieldLegend>
              <FieldDescription>
                Add up to 5 email addresses where we can contact you.
              </FieldDescription>
              <FieldGroup className="gap-4">
                {field.state.value.map((_, index) => (
                  <form.Field
                    key={index}
                    name={`emails[${index}].address`}
                    children={(subField) => {
                      const isSubFieldInvalid =
                        subField.state.meta.isTouched &&
                        !subField.state.meta.isValid;
                      return (
                        <Field
                          orientation="horizontal"
                          data-invalid={isSubFieldInvalid}
                        >
                          <FieldContent>
                            <FieldLabel
                              htmlFor={`email-tanstack-${index}`}
                              className="sr-only"
                            >
                              Email {index + 1}
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id={`email-tanstack-${index}`}
                                name={subField.name}
                                value={subField.state.value}
                                onBlur={subField.handleBlur}
                                onChange={(e) =>
                                  subField.handleChange(e.target.value)
                                }
                                aria-invalid={isSubFieldInvalid}
                                placeholder="name@example.com"
                                type="email"
                                autoComplete="email"
                              />
                              {field.state.value.length > 1 && (
                                <InputGroupAddon align="inline-end">
                                  <InputGroupButton
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => field.removeValue(index)}
                                    aria-label={`Remove email ${index + 1}`}
                                  >
                                    <XIcon />
                                  </InputGroupButton>
                                </InputGroupAddon>
                              )}
                            </InputGroup>
                            {isSubFieldInvalid && (
                              <FieldError errors={subField.state.meta.errors} />
                            )}
                          </FieldContent>
                        </Field>
                      );
                    }}
                  />
                ))}
              </FieldGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            form.getFieldValue("emails").length < 5 &&
            form.pushFieldValue("emails", { address: "" })
          }
          disabled={form.getFieldValue("emails").length >= 5}
        >
          Add Email Address
        </Button>
        <Button type="submit" disabled={form.state.isSubmitting}>
          Save Emails
        </Button>
      </div>
    </form>
  );
}
