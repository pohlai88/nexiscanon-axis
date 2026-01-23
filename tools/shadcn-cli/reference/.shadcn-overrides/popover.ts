/**
 * Popover component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'popover',
  patches: [
    {
      id: 'popover-header-components',
      description:
        'Add PopoverHeader, PopoverTitle, PopoverDescription components',
      reason: 'Provide structured header components for popovers',
      find: `export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }`,
      replace: `function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}`,
    },
  ],
};

export default override;
