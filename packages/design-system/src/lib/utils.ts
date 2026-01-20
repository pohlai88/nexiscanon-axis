import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Extended Tailwind merge configuration that recognizes custom theme variables.
 * This ensures proper class merging for semantic color tokens used in shadcn/ui.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        // Core semantic colors
        "background",
        "foreground",
        "card",
        "card-foreground",
        "popover",
        "popover-foreground",
        "primary",
        "primary-foreground",
        "secondary",
        "secondary-foreground",
        "muted",
        "muted-foreground",
        "accent",
        "accent-foreground",
        "destructive",
        "destructive-foreground",
        // Border and input colors
        "border",
        "input",
        "ring",
        // Sidebar colors
        "sidebar",
        "sidebar-foreground",
        "sidebar-primary",
        "sidebar-primary-foreground",
        "sidebar-accent",
        "sidebar-accent-foreground",
        "sidebar-border",
        "sidebar-ring",
        // Chart colors
        "chart-1",
        "chart-2",
        "chart-3",
        "chart-4",
        "chart-5",
      ],
    },
  },
});

/**
 * Intelligently merges Tailwind CSS classes with proper conflict resolution.
 *
 * This utility combines `clsx` for conditional class handling and `tailwind-merge`
 * for intelligent Tailwind utility conflict resolution. When conflicting utilities
 * are provided, the last one takes precedence.
 *
 * @param inputs - Class values to merge (strings, objects, arrays, or falsy values)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```tsx
 * // Resolves conflicting utilities
 * cn("px-2 px-4") // "px-4"
 * cn("text-red-500 text-blue-500") // "text-blue-500"
 *
 * // Handles conditional classes
 * cn("base-class", isActive && "active-class", className)
 *
 * // Works with theme variables
 * cn("bg-background text-foreground", "bg-primary") // "bg-primary text-foreground"
 * ```
 *
 * @see {@link https://github.com/dcastil/tailwind-merge} tailwind-merge documentation
 * @see {@link https://github.com/lukeed/clsx} clsx documentation
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
