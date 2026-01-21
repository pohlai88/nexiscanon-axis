# Pattern Library

Common UI patterns showing correct usage of `@workspace/design-system`.

---

## Available Patterns

### Form Patterns
- **form-with-validation.tsx** - Form with inline validation
- **multi-step-form.tsx** - Wizard-style multi-step form

### Data Patterns
- **data-table-sortable.tsx** - Sortable/filterable table
- **infinite-scroll-list.tsx** - Infinite scroll implementation

### Modal Patterns
- **modal-with-form.tsx** - Modal dialog with form
- **confirmation-dialog.tsx** - Confirmation dialog pattern

### State Patterns
- **loading-skeleton.tsx** - Loading skeleton states
- **empty-state.tsx** - Empty state with CTA

---

## Usage

Patterns are **reference implementations**. They show the correct way to:

- Use `cn()` for conditional styling
- Handle form validation
- Manage loading states
- Structure responsive layouts
- Apply semantic tokens

### Copy Pattern Code

```bash
# View pattern
cat apps/_shared-ui/src/patterns/form-with-validation.tsx

# Copy pattern to your component
cp apps/_shared-ui/src/patterns/form-with-validation.tsx \
   apps/web/components/my-form.tsx
```

### Or Use as Reference

Open pattern file and copy specific techniques:
- Conditional styling approach
- Validation handling
- Error display
- Loading states

---

## Pattern Structure

Each pattern includes:

1. **Correct imports** from workspace packages
2. **TypeScript interfaces** for props
3. **cn() usage** for conditional classes
4. **Semantic tokens** for colors
5. **Comments** explaining key decisions

---

## Creating New Patterns

When creating patterns:

1. ✅ Follow all template rules
2. ✅ Add TypeScript types
3. ✅ Include inline comments
4. ✅ Show common variations
5. ✅ Demonstrate best practices

---

## References

- **Template Rules**: `../templates/README.md`
- **Design System**: `../../../packages/design-system/README.md`
