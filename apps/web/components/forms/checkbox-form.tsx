"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
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
} from "@workspace/design-system";

const tasks = [
  { id: "comments", label: "Comments" },
  { id: "mentions", label: "Mentions" },
  { id: "updates", label: "Updates" },
  { id: "assignments", label: "Assignments" },
];

const formSchema = z.object({
  tasks: z
    .array(z.string())
    .min(1, "Select at least one notification type.")
    .max(3, "You can select up to 3 notification types."),
});

type FormData = z.infer<typeof formSchema>;

export function CheckboxForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks: [],
    },
  });

  function onSubmit(data: FormData) {
    console.log("Form submitted:", data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="tasks"
        control={form.control}
        render={({ field, fieldState }) => (
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
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    name={field.name}
                    aria-invalid={fieldState.invalid}
                    checked={field.value.includes(task.id)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...field.value, task.id]
                        : field.value.filter((value) => value !== task.id);
                      field.onChange(newValue);
                    }}
                  />
                  <FieldLabel
                    htmlFor={`task-${task.id}`}
                    className="font-normal"
                  >
                    {task.label}
                  </FieldLabel>
                </Field>
              ))}
            </FieldGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <Button type="submit">Save Preferences</Button>
    </form>
  );
}
