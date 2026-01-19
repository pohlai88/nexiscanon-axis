# React Hook Form Guide

This guide demonstrates how to build forms using React Hook Form with Zod validation and Shadcn UI components.

## Quick Start

### Installation

React Hook Form, Zod, and the resolver are already installed:

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### Basic Usage

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Examples

Check out the `/forms` page to see live examples of:

- **Basic Form** - Text input and textarea
- **Select Form** - Dropdown selection
- **Checkbox Form** - Multiple checkbox options
- **Radio Form** - Radio button selection
- **Switch Form** - Toggle switches
- **Array Form** - Dynamic fields with add/remove

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

Use the `useForm` hook with the Zod resolver:

```tsx
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { username: "", age: 18 },
});
```

### 3. Controller Pattern

Use `<Controller />` to connect form fields with your UI components:

```tsx
<Controller
  name="username"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### 4. Error Handling

Display errors using the `<FieldError />` component:

- Add `data-invalid={fieldState.invalid}` to `<Field />`
- Add `aria-invalid={fieldState.invalid}` to form controls
- Show errors conditionally: `{fieldState.invalid && <FieldError errors={[fieldState.error]} />}`

## Validation Modes

Configure when validation occurs:

```tsx
const form = useForm({
  resolver: zodResolver(formSchema),
  mode: "onChange", // "onBlur" | "onSubmit" | "onTouched" | "all"
});
```

## Working with Different Field Types

### Text Input / Textarea

Spread the `field` object directly:

```tsx
<Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
<Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
```

### Select

Use `field.value` and `field.onChange`:

```tsx
<Select value={field.value} onValueChange={field.onChange}>
  <SelectTrigger aria-invalid={fieldState.invalid}>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox (Single)

```tsx
<Checkbox
  checked={field.value}
  onCheckedChange={field.onChange}
  aria-invalid={fieldState.invalid}
/>
```

### Checkbox (Multiple)

```tsx
<Checkbox
  checked={field.value.includes(itemId)}
  onCheckedChange={(checked) => {
    const newValue = checked
      ? [...field.value, itemId]
      : field.value.filter((v) => v !== itemId);
    field.onChange(newValue);
  }}
  aria-invalid={fieldState.invalid}
/>
```

### Radio Group

```tsx
<RadioGroup value={field.value} onValueChange={field.onChange}>
  <RadioGroupItem value="option1" aria-invalid={fieldState.invalid} />
</RadioGroup>
```

### Switch

```tsx
<Switch
  checked={field.value}
  onCheckedChange={field.onChange}
  aria-invalid={fieldState.invalid}
/>
```

## Array Fields

Use `useFieldArray` for dynamic fields:

```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "emails",
})

// Map over fields
{fields.map((field, index) => (
  <Controller
    key={field.id} // Important: use field.id as key
    name={`emails.${index}.address`}
    control={form.control}
    render={({ field: controllerField, fieldState }) => (
      // Your field UI
    )}
  />
))}

// Add item
<Button onClick={() => append({ address: "" })}>Add</Button>

// Remove item
<Button onClick={() => remove(index)}>Remove</Button>
```

## Best Practices

1. **Always use `aria-invalid`** on form controls for accessibility
2. **Add `data-invalid` to `<Field />`** for proper error styling
3. **Use unique IDs** for form fields matching the field name
4. **Use `field.id` as key** when mapping over array fields
5. **Validate early** - Consider using `mode: "onChange"` for better UX
6. **Reset forms** after successful submission using `form.reset()`
7. **Handle loading states** during async operations

## Form Submission

```tsx
function onSubmit(data: FormData) {
  // Async operation
  fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify(data),
  })
    .then(() => {
      form.reset() // Reset after success
    })
    .catch((error) => {
      // Handle errors
    })
}

<form onSubmit={form.handleSubmit(onSubmit)}>
```

## Resources

- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Shadcn UI Field Component](https://ui.shadcn.com/docs/components/field)
- Example Forms: `/forms` page in this project
