# TanStack Form Guide

This guide demonstrates how to build forms using TanStack Form with Zod validation and Shadcn UI components.

## Quick Start

### Installation

TanStack Form and Zod adapter are installed:

```bash
pnpm add @tanstack/react-form @tanstack/zod-form-adapter zod
```

### Basic Usage

```tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import {
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from "@workspace/design-system";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export function MyForm() {
  const form = useForm({
    defaultValues: { email: "" },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Examples

Check out the `/forms-tanstack` page to see live examples of:

- **Basic Form** - Text input and textarea with validation
- **Select Form** - Dropdown selection
- **Checkbox Form** - Multiple checkbox options with array mode
- **Radio Form** - Radio button selection
- **Switch Form** - Toggle switches
- **Array Form** - Dynamic fields with add/remove
- **Complex Form** - Real-world signup with all field types

## Key Concepts

### 1. Schema Validation

Define your form structure and validation rules using Zod:

```tsx
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});
```

### 2. Form Setup

Use the `useForm` hook with the Zod validator adapter:

```tsx
const form = useForm({
  defaultValues: { username: "", age: 18 },
  validatorAdapter: zodValidator(),
  validators: {
    onSubmit: formSchema,
  },
  onSubmit: async ({ value }) => {
    console.log(value);
  },
});
```

### 3. Render Prop Pattern

Use `form.Field` with a render prop to connect fields:

```tsx
<form.Field
  name="username"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
/>
```

### 4. Error Handling

Check validation state and display errors:

```tsx
const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

// Add data-invalid to Field
<Field data-invalid={isInvalid}>

// Add aria-invalid to input
<Input aria-invalid={isInvalid} />

// Show errors conditionally
{isInvalid && <FieldError errors={field.state.meta.errors} />}
```

## Validation Modes

Configure when validation occurs using the `validators` option:

```tsx
const form = useForm({
  defaultValues: {
    /* ... */
  },
  validatorAdapter: zodValidator(),
  validators: {
    onChange: formSchema, // Validate on every change
    onBlur: formSchema, // Validate on blur
    onSubmit: formSchema, // Validate on submit
  },
});
```

**Validation Strategies:**

- `onChange` - Real-time validation as user types
- `onBlur` - Validate when field loses focus
- `onSubmit` - Validate only on form submission
- **Combine multiple** - Use multiple strategies together

## Working with Different Field Types

### Text Input / Textarea

Use `field.state.value` and `field.handleChange`:

```tsx
<form.Field
  name="username"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
/>
```

### Select

```tsx
<form.Field
  name="language"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Language</FieldLabel>
        <Select
          name={field.name}
          value={field.state.value}
          onValueChange={field.handleChange}
        >
          <SelectTrigger id={field.name} aria-invalid={isInvalid}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
/>
```

### Checkbox (Single)

```tsx
<form.Field
  name="acceptTerms"
  children={(field) => (
    <Field orientation="horizontal">
      <Checkbox
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
      <FieldLabel>I accept the terms</FieldLabel>
    </Field>
  )}
/>
```

### Checkbox (Multiple with Array Mode)

Use `mode="array"` for checkbox groups:

```tsx
<form.Field
  name="interests"
  mode="array"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <FieldSet>
        <FieldLegend>Interests</FieldLegend>
        <FieldGroup data-slot="checkbox-group">
          {options.map((option) => (
            <Field key={option.id} orientation="horizontal">
              <Checkbox
                checked={field.state.value.includes(option.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.pushValue(option.id);
                  } else {
                    const index = field.state.value.indexOf(option.id);
                    if (index > -1) field.removeValue(index);
                  }
                }}
              />
              <FieldLabel>{option.label}</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldSet>
    );
  }}
/>
```

### Radio Group

```tsx
<form.Field
  name="plan"
  children={(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <FieldSet>
        <FieldLegend>Choose Plan</FieldLegend>
        <RadioGroup
          value={field.state.value}
          onValueChange={field.handleChange}
        >
          {plans.map((plan) => (
            <label key={plan.id} htmlFor={plan.id}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{plan.title}</FieldTitle>
                  <FieldDescription>{plan.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  value={plan.id}
                  id={plan.id}
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
```

### Switch

```tsx
<form.Field
  name="notifications"
  children={(field) => (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel>Enable Notifications</FieldLabel>
        <FieldDescription>Receive email updates</FieldDescription>
      </FieldContent>
      <Switch
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
    </Field>
  )}
/>
```

## Array Fields

TanStack Form provides powerful array field management with `mode="array"`:

### Basic Array Setup

```tsx
<form.Field
  name="emails"
  mode="array"
  children={(field) => (
    <FieldSet>
      <FieldLegend>Email Addresses</FieldLegend>
      <FieldGroup>
        {field.state.value.map((_, index) => (
          <form.Field
            key={index}
            name={`emails[${index}].address`}
            children={(subField) => (
              <Field>
                <Input
                  value={subField.state.value}
                  onChange={(e) => subField.handleChange(e.target.value)}
                  onBlur={subField.handleBlur}
                />
              </Field>
            )}
          />
        ))}
      </FieldGroup>
    </FieldSet>
  )}
/>
```

### Adding Items

Use `field.pushValue(item)`:

```tsx
<Button type="button" onClick={() => field.pushValue({ address: "" })}>
  Add Email
</Button>
```

Or use form-level methods:

```tsx
<Button
  type="button"
  onClick={() => form.pushFieldValue("emails", { address: "" })}
>
  Add Email
</Button>
```

### Removing Items

Use `field.removeValue(index)`:

```tsx
<Button type="button" onClick={() => field.removeValue(index)}>
  Remove
</Button>
```

### Array Validation

```tsx
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
```

## Form State

Access form state for UI feedback:

```tsx
const form = useForm({ /* ... */ })

// In JSX
<Button type="submit" disabled={form.state.isSubmitting}>
  {form.state.isSubmitting ? "Submitting..." : "Submit"}
</Button>

// Check if form is valid
{form.state.isValid ? "✅" : "❌"}

// Check if form can be submitted
{form.state.canSubmit ? "Ready" : "Not Ready"}
```

## Form Methods

### Reset Form

```tsx
<Button type="button" onClick={() => form.reset()}>
  Reset
</Button>
```

### Get Field Value

```tsx
const emailValue = form.getFieldValue("email");
```

### Set Field Value

```tsx
form.setFieldValue("email", "new@example.com");
```

### Validate Form

```tsx
await form.validateAllFields("submit");
```

## Best Practices

1. **Always use "use client"** directive (TanStack Form uses React hooks)
2. **Use `validatorAdapter`** - Pass `zodValidator()` for Zod integration
3. **Check `isTouched` and `isValid`** - For proper error display timing
4. **Add accessibility attributes** - `aria-invalid` on inputs
5. **Use `mode="array"`** for array fields - Enables array helpers
6. **Validate on multiple events** - Combine onChange, onBlur, onSubmit
7. **Handle loading states** - Use `form.state.isSubmitting`
8. **Reset after success** - Call `form.reset()` after submission

## Comparison with React Hook Form

| Feature                  | TanStack Form       | React Hook Form      |
| ------------------------ | ------------------- | -------------------- |
| **API Style**            | Render props        | Controller component |
| **Type Safety**          | Excellent           | Excellent            |
| **Bundle Size**          | Smaller             | Small                |
| **Validation**           | Built-in + adapters | Resolvers            |
| **Array Fields**         | `mode="array"`      | `useFieldArray`      |
| **Real-time Validation** | Easy (onChange)     | Requires mode config |
| **Learning Curve**       | Moderate            | Moderate             |
| **Performance**          | Excellent           | Excellent            |

## Form Submission

```tsx
const form = useForm({
  defaultValues: {
    /* ... */
  },
  validatorAdapter: zodValidator(),
  validators: {
    onSubmit: formSchema,
  },
  onSubmit: async ({ value }) => {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });

      if (response.ok) {
        toast.success("Success!");
        form.reset();
      } else {
        toast.error("Failed to submit");
      }
    } catch (error) {
      toast.error("Network error");
    }
  },
});
```

## Resources

- [TanStack Form Documentation](https://tanstack.com/form)
- [Zod Documentation](https://zod.dev)
- [Shadcn UI Field Component](https://ui.shadcn.com/docs/components/field)
- Example Forms: `/forms-tanstack` page in this project
- React Hook Form Guide: `docs/react-hook-form-guide.md`

## Tips

- **Use onChange validation** for better UX in complex forms
- **Combine validators** - Use both onBlur and onSubmit together
- **Leverage array mode** - Much simpler than manual array management
- **Type your defaults** - Helps TypeScript infer form types
- **Test validation** - Ensure error messages are user-friendly
- **Handle edge cases** - Empty arrays, null values, etc.

Enjoy building forms with TanStack Form! 🚀
