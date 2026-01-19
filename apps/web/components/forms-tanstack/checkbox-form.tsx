"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { toast } from "sonner"
import * as z from "zod"
import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/design-system"

const tasks = [
  { id: "comments", label: "Comments" },
  { id: "mentions", label: "Mentions" },
  { id: "updates", label: "Updates" },
  { id: "assignments", label: "Assignments" },
]

const formSchema = z.object({
  tasks: z
    .array(z.string())
    .min(1, "Select at least one notification type.")
    .max(3, "You can select up to 3 notification types."),
})

export function CheckboxTanStackForm() {
  const form = useForm({
    defaultValues: {
      tasks: [] as string[],
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
      toast.success("Notification preferences saved!")
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
        name="tasks"
        mode="array"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <FieldSet>
              <FieldLegend variant="label">Tasks</FieldLegend>
              <FieldDescription>
                Get notified when tasks you&apos;ve created have updates.
              </FieldDescription>
              <FieldGroup data-slot="checkbox-group">
                {tasks.map((task) => (
                  <Field
                    key={task.id}
                    orientation="horizontal"
                    data-invalid={isInvalid}
                  >
                    <Checkbox
                      id={`task-tanstack-${task.id}`}
                      name={field.name}
                      aria-invalid={isInvalid}
                      checked={field.state.value.includes(task.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.pushValue(task.id)
                        } else {
                          const index = field.state.value.indexOf(task.id)
                          if (index > -1) {
                            field.removeValue(index)
                          }
                        }
                      }}
                    />
                    <FieldLabel
                      htmlFor={`task-tanstack-${task.id}`}
                      className="font-normal"
                    >
                      {task.label}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          )
        }}
      />

      <Button type="submit" disabled={form.state.isSubmitting}>
        Save Preferences
      </Button>
    </form>
  )
}
