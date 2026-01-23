/**
 * Button component overrides
 *
 * These patches are automatically applied after syncing from shadcn/ui.
 * Run: pnpm sync:shadcn button
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'button',
  patches: [
    {
      id: 'icon-xs-size',
      description: 'Add icon-xs size variant for compact icon buttons',
      reason: 'Required by combobox.tsx for chip remove buttons',
      find: `icon: "size-9",`,
      replace: `icon: "size-9",
        "icon-xs": "size-6", // LOCAL OVERRIDE - icon-xs-size`,
    },
    {
      id: 'button-props-export',
      description: 'Export ButtonProps type for type-safe prop spreading',
      reason: 'Required by apps for type-safe button prop spreading',
      find: `export { Button, buttonVariants }`,
      replace: `// LOCAL OVERRIDE - button-props-export
type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export { Button, buttonVariants }
export type { ButtonProps }`,
    },
  ],
};

export default override;
