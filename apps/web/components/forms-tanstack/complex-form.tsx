"use client"

import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { toast } from "sonner"
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

export function ComplexTanStackForm() {
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      bio: "",
      role: "",
      notifications: [] as string[],
      twoFactor: false,
      accountType: "" as any,
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
      toast.success("Account created successfully!")
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
    >
      {/* Personal Information Section */}
      <FieldSet>
        <FieldLegend>Personal Information</FieldLegend>
        <FieldDescription>
          Tell us about yourself. This information will be displayed on your
          profile.
        </FieldDescription>

        <FieldGroup>
          <form.Field
            name="fullName"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  <FieldDescription>
                    This is the name that will be displayed on your profile.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                  <FieldDescription>
                    We&apos;ll never share your email with anyone else.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="bio"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="I'm a software engineer passionate about..."
                    className="min-h-[100px]"
                  />
                  <FieldDescription>
                    Brief description for your profile. Max 200 characters.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="role"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field orientation="responsive" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="role-select-tanstack">Role</FieldLabel>
                    <FieldDescription>
                      Select your primary role or occupation.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger
                      id="role-select-tanstack"
                      aria-invalid={isInvalid}
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
              )
            }}
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
          <form.Field
            name="notifications"
            mode="array"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <FieldSet>
                  <FieldLegend variant="label">
                    Notification Channels
                  </FieldLegend>
                  <FieldDescription>
                    Choose how you want to receive notifications.
                  </FieldDescription>
                  <FieldGroup data-slot="checkbox-group">
                    {notificationTypes.map((notification) => (
                      <Field
                        key={notification.id}
                        orientation="horizontal"
                        data-invalid={isInvalid}
                      >
                        <Checkbox
                          id={`notification-tanstack-${notification.id}`}
                          name={field.name}
                          aria-invalid={isInvalid}
                          checked={
                            field.state.value?.includes(notification.id) ?? false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.pushValue(notification.id)
                            } else {
                              const index =
                                field.state.value?.indexOf(notification.id) ?? -1
                              if (index > -1) {
                                field.removeValue(index)
                              }
                            }
                          }}
                        />
                        <FieldLabel
                          htmlFor={`notification-tanstack-${notification.id}`}
                          className="font-normal"
                        >
                          {notification.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              )
            }}
          />

          <form.Field
            name="twoFactor"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field orientation="horizontal" data-invalid={isInvalid}>
                  <FieldContent>
                    <FieldLabel htmlFor="two-factor-auth-tanstack">
                      Two-Factor Authentication
                    </FieldLabel>
                    <FieldDescription>
                      Add an extra layer of security to your account.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldContent>
                  <Switch
                    id="two-factor-auth-tanstack"
                    name={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                    aria-invalid={isInvalid}
                  />
                </Field>
              )
            }}
          />
        </FieldGroup>
      </FieldSet>

      {/* Account Type Section */}
      <form.Field
        name="accountType"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <FieldSet>
              <FieldLegend>Account Type</FieldLegend>
              <FieldDescription>
                Choose the plan that best fits your needs.
              </FieldDescription>
              <RadioGroup
                name={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                {accountTypes.map((type) => (
                  <label
                    key={type.id}
                    htmlFor={`account-tanstack-${type.id}`}
                  >
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldTitle>{type.title}</FieldTitle>
                        <FieldDescription>{type.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        value={type.id}
                        id={`account-tanstack-${type.id}`}
                        aria-invalid={isInvalid}
                      />
                    </Field>
                  </label>
                ))}
              </RadioGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          )
        }}
      />

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? "Creating..." : "Create Account"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={form.state.isSubmitting}
        >
          Reset
        </Button>
      </div>

      {/* Form State Debug (Remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-lg border p-4 text-xs">
          <div className="mb-2 font-semibold">Form State (Dev Only):</div>
          <div className="space-y-1">
            <div>Valid: {form.state.isValid ? "✅" : "❌"}</div>
            <div>Submitting: {form.state.isSubmitting ? "Yes" : "No"}</div>
            <div>Can Submit: {form.state.canSubmit ? "Yes" : "No"}</div>
          </div>
        </div>
      )}
    </form>
  )
}
