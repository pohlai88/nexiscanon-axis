# E02-06: Skiper UI Components

> Status: **Active** | Priority: **LOW**
> Source: [legacy.skiper-ui.com](https://legacy.skiper-ui.com) | [GitHub](https://github.com/Gurvinder-Singh02/legacy-skiper-ui)

---

## Overview

Skiper UI provides experimental and creative UI components.
We've integrated the most useful patterns for ERP workflows.

**Focus Areas:**
- Multi-step wizards (DialogStack)
- Inline feedback forms (PopoverForm)

---

## Implemented Components

| Component | Location | Description |
|-----------|----------|-------------|
| `DialogStack` | `effects/dialog-stack.tsx` | Container for stacked dialogs |
| `DialogStackTrigger` | `effects/dialog-stack.tsx` | Button to open stack |
| `DialogStackOverlay` | `effects/dialog-stack.tsx` | Backdrop overlay |
| `DialogStackBody` | `effects/dialog-stack.tsx` | Content wrapper |
| `DialogStackContent` | `effects/dialog-stack.tsx` | Individual step content |
| `DialogStackHeader` | `effects/dialog-stack.tsx` | Step header |
| `DialogStackTitle` | `effects/dialog-stack.tsx` | Step title |
| `DialogStackDescription` | `effects/dialog-stack.tsx` | Step description |
| `DialogStackFooter` | `effects/dialog-stack.tsx` | Footer with actions |
| `DialogStackNext` | `effects/dialog-stack.tsx` | Next step button |
| `DialogStackPrevious` | `effects/dialog-stack.tsx` | Previous step button |
| `DialogStackClose` | `effects/dialog-stack.tsx` | Close button |
| `useDialogStack` | `effects/dialog-stack.tsx` | Hook for control |
| `PopoverForm` | `effects/popover-form.tsx` | Animated popover form |
| `PopoverFormButton` | `effects/popover-form.tsx` | Submit button with loading |
| `PopoverFormSuccess` | `effects/popover-form.tsx` | Success state |
| `PopoverFormTextarea` | `effects/popover-form.tsx` | Textarea input |
| `PopoverFormFooter` | `effects/popover-form.tsx` | Footer container |
| `usePopoverForm` | `effects/popover-form.tsx` | Hook for form state |

---

## Usage

### DialogStack - Multi-Step Wizard

```tsx
import {
  DialogStack,
  DialogStackTrigger,
  DialogStackOverlay,
  DialogStackBody,
  DialogStackContent,
  DialogStackHeader,
  DialogStackTitle,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackNext,
  DialogStackPrevious,
  DialogStackClose,
} from "@workspace/design-system"

<DialogStack>
  <DialogStackTrigger>Start Onboarding</DialogStackTrigger>
  <DialogStackOverlay />
  <DialogStackBody>
    {/* Step 1 */}
    <DialogStackContent>
      <DialogStackHeader>
        <DialogStackTitle>Welcome!</DialogStackTitle>
        <DialogStackDescription>
          Let's get you set up in just a few steps.
        </DialogStackDescription>
      </DialogStackHeader>
      <div className="py-4">
        {/* Step 1 content */}
      </div>
      <DialogStackFooter>
        <DialogStackClose>Cancel</DialogStackClose>
        <DialogStackNext>Continue</DialogStackNext>
      </DialogStackFooter>
    </DialogStackContent>

    {/* Step 2 */}
    <DialogStackContent>
      <DialogStackHeader>
        <DialogStackTitle>Profile Setup</DialogStackTitle>
        <DialogStackDescription>
          Tell us about yourself.
        </DialogStackDescription>
      </DialogStackHeader>
      <div className="py-4">
        {/* Step 2 content */}
      </div>
      <DialogStackFooter>
        <DialogStackPrevious>Back</DialogStackPrevious>
        <DialogStackNext>Next</DialogStackNext>
      </DialogStackFooter>
    </DialogStackContent>

    {/* Step 3 */}
    <DialogStackContent>
      <DialogStackHeader>
        <DialogStackTitle>All Done!</DialogStackTitle>
        <DialogStackDescription>
          You're ready to get started.
        </DialogStackDescription>
      </DialogStackHeader>
      <div className="py-4">
        {/* Step 3 content */}
      </div>
      <DialogStackFooter>
        <DialogStackPrevious>Back</DialogStackPrevious>
        <DialogStackClose>Finish</DialogStackClose>
      </DialogStackFooter>
    </DialogStackContent>
  </DialogStackBody>
</DialogStack>
```

### Controlled DialogStack

```tsx
import { useDialogStack, DialogStack } from "@workspace/design-system"

function MyWizard() {
  const { isOpen, open, close } = useDialogStack()

  return (
    <>
      <Button onClick={open}>Open Wizard</Button>
      <DialogStack open={isOpen} onOpenChange={(v) => v ? open() : close()}>
        {/* ... */}
      </DialogStack>
    </>
  )
}
```

### PopoverForm - Inline Feedback

```tsx
import {
  PopoverForm,
  PopoverFormButton,
  PopoverFormTextarea,
  PopoverFormFooter,
  usePopoverForm,
} from "@workspace/design-system"

function FeedbackButton() {
  const {
    isOpen,
    setIsOpen,
    isLoading,
    showSuccess,
    handleSubmit,
  } = usePopoverForm({
    onSuccess: () => console.log("Feedback submitted!"),
    successDuration: 2000,
  })

  const [feedback, setFeedback] = useState("")

  const onSubmit = () => {
    handleSubmit(async () => {
      await submitFeedback(feedback)
    })
  }

  return (
    <PopoverForm
      open={isOpen}
      setOpen={setIsOpen}
      title="Feedback"
      showSuccess={showSuccess}
      width={400}
      height={200}
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="h-full">
        <PopoverFormTextarea
          placeholder="Your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <PopoverFormFooter>
          <PopoverFormButton loading={isLoading} text="Send" />
        </PopoverFormFooter>
      </form>
    </PopoverForm>
  )
}
```

### Custom Success Content

```tsx
import { PopoverForm, PopoverFormSuccess } from "@workspace/design-system"

<PopoverForm
  open={open}
  setOpen={setOpen}
  title="Report Bug"
  showSuccess={success}
  successContent={
    <PopoverFormSuccess
      title="Bug Reported"
      description="Our team will look into this."
    />
  }
>
  {/* form content */}
</PopoverForm>
```

---

## Component API

### DialogStack Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open state callback |
| `clickable` | `boolean` | `false` | Click stacked items to go back |

### DialogStackContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | auto | Step index (auto-assigned) |
| `offset` | `number` | `10` | Vertical offset between stacks |

### PopoverForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Controlled open state |
| `setOpen` | `(open: boolean) => void` | required | Set open state |
| `title` | `string` | required | Trigger button text |
| `showSuccess` | `boolean` | `false` | Show success state |
| `successContent` | `ReactNode` | — | Custom success content |
| `width` | `string \| number` | `364` | Popover width |
| `height` | `string \| number` | `192` | Popover height |
| `showCloseButton` | `boolean` | `false` | Show close chevron |

### usePopoverForm Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onSuccess` | `() => void` | — | Success callback |
| `successDuration` | `number` | `2000` | Auto-close delay (ms) |

---

## Design System Status

| Source | Components | Blocks | Effects |
|--------|------------|--------|---------|
| Shadcn Base | 54 | — | — |
| ShadcnStudio | — | 109 | — |
| Magic UI | — | — | 28 |
| Aceternity | — | — | 4 |
| ElevenLabs | — | — | 3 |
| Bundui | — | — | 4 |
| **Skiper UI** | — | — | **2** (19 exports) |
| **TOTAL** | **54** | **109** | **41** |

---

## References

- [Skiper UI Documentation](https://legacy.skiper-ui.com)
- [GitHub Repository](https://github.com/Gurvinder-Singh02/legacy-skiper-ui)
- MIT Licensed
