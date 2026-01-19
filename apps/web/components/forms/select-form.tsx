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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/design-system"

const formSchema = z.object({
  language: z.string().min(1, "Please select a language."),
})

type FormData = z.infer<typeof formSchema>

export function SelectForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "",
    },
  })

  function onSubmit(data: FormData) {
    console.log("Form submitted:", data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="language"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field orientation="responsive" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor="language-select">
                Spoken Language
              </FieldLabel>
              <FieldDescription>
                For best results, select the language you speak.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id="language-select"
                aria-invalid={fieldState.invalid}
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
        )}
      />

      <Button type="submit">Save Preferences</Button>
    </form>
  )
}
