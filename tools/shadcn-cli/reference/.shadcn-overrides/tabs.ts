/**
 * Tabs component overrides
 */

import type { ComponentOverride } from './types';

const override: ComponentOverride = {
  component: 'tabs',
  patches: [
    {
      id: 'tabs-list-variants',
      description: 'Add tabsListVariants with default and line variants',
      reason:
        'Support different tab list styles (solid background vs underline)',
      find: `function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(`,
      replace: `const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }),`,
    },
    {
      id: 'tabs-list-variants-export',
      description: 'Export tabsListVariants',
      reason: 'Allow external access to tabs list variant styles',
      find: `export { Tabs, TabsList, TabsTrigger, TabsContent }`,
      replace: `export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }`,
    },
  ],
};

export default override;
