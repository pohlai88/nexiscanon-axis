/**
 * Alert component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'alert',
  patches: [
    {
      id: 'alert-action',
      description: 'Add AlertAction component for action buttons in alerts',
      reason: 'Used for dismiss buttons and other alert actions',
      find: `export { Alert, AlertTitle, AlertDescription }`,
      replace: `function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }`,
    },
  ],
};

export default override;
