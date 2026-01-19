"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import {
  Button,
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@workspace/design-system"

const formSchema = z.object({
  // Personal Info
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(200, "Bio must be at most 200 characters"),

  // Preferences
  role: z.string().min(1, "Please select a role"),
  notifications: z.array(z.string()).optional(),
  twoFactor: z.boolean(),

  // Account Type
  accountType: z.enum(["free", "pro", "enterprise"], {
    required_error: "Please select an account type",
  }),
})

type FormData = z.infer<typeof formSchema>

const roles = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "manager", label: "Manager" },
  { value: "other", label: "Other" },
]

const notificationTypes = [
  { id: "email", label: "Email notifications" },
  { id: "push", label: "Push notifications" },
  { id: "sms", label: "SMS notifications" },
]

const accountTypes = [
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

export function ComplexForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      bio: "",
      role: "",
      notifications: [],
      twoFactor: false,
      accountType: undefined,
    },
  })

  function onSubmit(data: FormData) {
    console.log("Form submitted:", data)
    alert("Form submitted successfully! Check console for data.")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information Section */}
      <FieldSet>
        <FieldLegend>Personal Information</FieldLegend>
        <FieldDescription>
          Tell us about yourself. This information will be displayed on your profile.
        </FieldDescription>

        <FieldGroup>
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                <FieldDescription>
                  This is the name that will be displayed on your profile.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="john@example.com"
                  autoComplete="email"
                />
                <FieldDescription>
                  We&apos;ll never share your email with anyone else.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="bio"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="I'm a software engineer passionate about..."
                  className="min-h-[100px]"
                />
                <FieldDescription>
                  Brief description for your profile. Max 200 characters.
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="responsive" data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor="role-select">Role</FieldLabel>
                  <FieldDescription>
                    Select your primary role or occupation.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="role-select"
                    aria-invalid={fieldState.invalid}
                    className="min-w-[180px]"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Preferences Section */}
      <FieldSet>
        <FieldLegend>Preferences</FieldLegend>
        <FieldDescription>
          Configure your notification preferences and security settings.
        </FieldDescription>

        <FieldGroup>
          <Controller
            name="notifications"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet>
                <FieldLegend variant="label">Notification Channels</FieldLegend>
                <FieldDescription>
                  Choose how you want to receive notifications.
                </FieldDescription>
                <FieldGroup data-slot="checkbox-group">
                  {notificationTypes.map((notification) => (
                    <Field
                      key={notification.id}
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <Checkbox
                        id={`notification-${notification.id}`}
                        name={field.name}
                        aria-invalid={fieldState.invalid}
                        checked={field.value?.includes(notification.id) ?? false}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value ?? []
                          const newValue = checked
                            ? [...currentValue, notification.id]
                            : currentValue.filter((value) => value !== notification.id)
                          field.onChange(newValue)
                        }}
                      />
                      <FieldLabel
                        htmlFor={`notification-${notification.id}`}
                        className="font-normal"
                      >
                        {notification.label}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldSet>
            )}
          />

          <Controller
            name="twoFactor"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor="two-factor-auth">
                    Two-Factor Authentication
                  </FieldLabel>
                  <FieldDescription>
                    Add an extra layer of security to your account.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Switch
                  id="two-factor-auth"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {/* Account Type Section */}
      <Controller
        name="accountType"
        control={form.control}
        render={({ field, fieldState }) => (
          <FieldSet>
            <FieldLegend>Account Type</FieldLegend>
            <FieldDescription>
              Choose the plan that best fits your needs.
            </FieldDescription>
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              {accountTypes.map((type) => (
                <FieldLabel key={type.id} htmlFor={`account-${type.id}`}>
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldTitle>{type.title}</FieldTitle>
                      <FieldDescription>{type.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={type.id}
                      id={`account-${type.id}`}
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

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Create Account"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={form.formState.isSubmitting}
        >
          Reset
        </Button>
      </div>

      {/* Form State Debug (Remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-lg border p-4 text-xs">
          <div className="font-semibold mb-2">Form State (Dev Only):</div>
          <div className="space-y-1">
            <div>Valid: {form.formState.isValid ? "✅" : "❌"}</div>
            <div>Submitting: {form.formState.isSubmitting ? "Yes" : "No"}</div>
            <div>
              Errors:{" "}
              {Object.keys(form.formState.errors).length > 0
                ? Object.keys(form.formState.errors).join(", ")
                : "None"}
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
