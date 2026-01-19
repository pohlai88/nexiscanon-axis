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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/design-system"

const formSchema = z.object({
  language: z.string().min(1, "Please select a language."),
})

export function SelectTanStackForm() {
  const form = useForm({
    defaultValues: {
      language: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
      toast.success("Language preference saved!")
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
        name="language"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field orientation="responsive" data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor="language-select">
                  Spoken Language
                </FieldLabel>
                <FieldDescription>
                  For best results, select the language you speak.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger
                  id="language-select"
                  aria-invalid={isInvalid}
                  className="min-w-[120px]"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )
        }}
      />

      <Button type="submit" disabled={form.state.isSubmitting}>
        Save Preferences
      </Button>
    </form>
  )
}
