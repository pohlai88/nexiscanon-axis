# shadcn/ui Overrides

Automated patching system for local customizations to shadcn/ui components.

## How It Works

1. Sync a component: `pnpm sync:shadcn button`
2. Script fetches latest from shadcn registry
3. Transforms imports to workspace format
4. **Automatically applies patches** from `.shadcn-overrides/{component}.ts`
5. Writes final file with sync header

## Creating an Override

1. Create `.shadcn-overrides/{component}.ts`:

```ts
import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'button',
  patches: [
    {
      id: 'my-patch-id', // Unique identifier
      description: 'What it does', // Short description
      reason: "Why it's needed", // Business reason
      find: `exact string`, // Must be unique in file
      replace: `replacement`, // What to replace with
    },
  ],
};

export default override;
```

2. Re-sync the component: `pnpm sync:shadcn button`

## Current Overrides

### alert.ts

- `alert-action`: Adds `AlertAction` component

### alert-dialog.ts

- `alert-dialog-media`: Adds `AlertDialogMedia` component
- `alert-dialog-media-export`: Exports AlertDialogMedia

### avatar.ts

- `avatar-badge`: Adds `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`

### button.ts

- `icon-xs-size`: Adds `icon-xs` size variant (size-6)
- `button-props-export`: Exports `ButtonProps` type

### carousel.ts

- `use-carousel-export`: Exports `useCarousel` hook

### item.ts

- `item-xs-size`: Adds `xs` size variant

### popover.ts

- `popover-header-components`: Adds `PopoverHeader`, `PopoverTitle`, `PopoverDescription`

### resizable.ts

- `resizable-panel-group-alias`: Adds `ResizablePanelGroupComponent` alias

### tabs.ts

- `tabs-list-variants`: Adds `tabsListVariants` with `default` and `line` variants
- `tabs-list-variants-export`: Exports `tabsListVariants`

## Guidelines

- **Find strings must be unique** - Include enough context
- **Add `// LOCAL OVERRIDE - {id}`** comments in replacements
- **Document why** - Future maintainers need context
- Keep patches minimal and focused

## Verification

After syncing, verify:

```bash
pnpm check-types
pnpm lint
```

## Related Files

- `scripts/sync-shadcn.ts` - Sync script with override logic
- `docs/SYNC_WORKFLOW.md` - Full sync documentation
