/**
 * AlertDialog component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'alert-dialog',
  patches: [
    {
      id: 'alert-dialog-media',
      description:
        'Add AlertDialogMedia component for icons/images in dialog header',
      reason: 'Used for visual media in alert dialog headers',
      find: `function AlertDialogTitle({`,
      replace: `function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn("bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({`,
    },
    {
      id: 'alert-dialog-media-export',
      description: 'Export AlertDialogMedia',
      reason: 'Make AlertDialogMedia available for import',
      find: `AlertDialogHeader,
  AlertDialogOverlay,`,
      replace: `AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,`,
    },
  ],
};

export default override;
