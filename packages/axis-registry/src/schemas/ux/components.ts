/**
 * UI Component Registry (B10)
 *
 * Registry of all shadcn/ui components available in @workspace/design-system.
 * Following the shadcn registry pattern: self-describing, categorized, with dependencies.
 *
 * Source: @workspace/design-system/src/components/*
 */

import { z } from "zod";

// ============================================================================
// Component Categories
// ============================================================================

export const COMPONENT_CATEGORY = [
  "form", // Input, Button, Checkbox, etc.
  "layout", // Card, Separator, Tabs, etc.
  "feedback", // Alert, Badge, Skeleton, etc.
  "overlay", // Dialog, DropdownMenu, Tooltip, etc.
  "display", // Avatar, Table, etc.
  "navigation", // Breadcrumb, Pagination, etc.
  "data", // DataTable, Charts, etc.
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORY)[number];

// ============================================================================
// Component Variants
// ============================================================================

export const BUTTON_VARIANT = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;

export const BUTTON_SIZE = [
  "default",
  "sm",
  "lg",
  "icon",
  "icon-sm",
  "icon-lg",
] as const;

export const BADGE_VARIANT = [
  "default",
  "secondary",
  "destructive",
  "outline",
] as const;

export const ALERT_VARIANT = ["default", "destructive"] as const;

// ============================================================================
// Component Registry Schema
// ============================================================================

export const componentRegistryItemSchema = z.object({
  $schema: z
    .literal("axis://component/v1")
    .default("axis://component/v1"),

  // Identity
  name: z.string().describe("Component name (PascalCase)"),
  slug: z.string().describe("URL-safe identifier (kebab-case)"),

  // Categorization
  category: z.enum(COMPONENT_CATEGORY),
  description: z.string().describe("Short description of the component"),

  // Source
  source: z.object({
    package: z
      .literal("@workspace/design-system")
      .default("@workspace/design-system"),
    path: z.string().describe("Path within package, e.g., 'components/button'"),
    exportName: z.string().describe("Named export, e.g., 'Button'"),
  }),

  // Dependencies
  dependencies: z
    .array(z.string())
    .default([])
    .describe("NPM package dependencies"),
  registryDependencies: z
    .array(z.string())
    .default([])
    .describe("Other components this depends on"),

  // Radix UI
  radixPrimitive: z
    .string()
    .optional()
    .describe("Radix UI primitive if applicable"),

  // Persona visibility
  persona: z
    .object({
      quorum: z.boolean().default(true).describe("Available in Quorum"),
      cobalt: z.boolean().default(true).describe("Available in Cobalt"),
    })
    .default({ quorum: true, cobalt: true }),

  // Documentation
  docs: z
    .object({
      usage: z.string().optional(),
      examples: z.array(z.string()).default([]),
      apiReference: z.string().optional(),
    })
    .optional(),
});

export type ComponentRegistryItem = z.infer<typeof componentRegistryItemSchema>;

// ============================================================================
// Component Registry - All Components
// ============================================================================

export const COMPONENT_REGISTRY: ComponentRegistryItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FORM COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Button",
    slug: "button",
    category: "form",
    description:
      "Displays a button or a component that looks like a button with variants.",
    source: {
      package: "@workspace/design-system",
      path: "components/button",
      exportName: "Button",
    },
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
    ],
    registryDependencies: [],
    radixPrimitive: "Slot",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Input",
    slug: "input",
    category: "form",
    description: "Displays a form input field.",
    source: {
      package: "@workspace/design-system",
      path: "components/input",
      exportName: "Input",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Label",
    slug: "label",
    category: "form",
    description: "Renders an accessible label for form controls.",
    source: {
      package: "@workspace/design-system",
      path: "components/label",
      exportName: "Label",
    },
    dependencies: ["@radix-ui/react-label"],
    registryDependencies: [],
    radixPrimitive: "Label",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Checkbox",
    slug: "checkbox",
    category: "form",
    description: "A control that allows the user to toggle between checked and not checked.",
    source: {
      package: "@workspace/design-system",
      path: "components/checkbox",
      exportName: "Checkbox",
    },
    dependencies: ["@radix-ui/react-checkbox", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "Checkbox",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Switch",
    slug: "switch",
    category: "form",
    description: "A control that allows the user to toggle between on and off.",
    source: {
      package: "@workspace/design-system",
      path: "components/switch",
      exportName: "Switch",
    },
    dependencies: ["@radix-ui/react-switch"],
    registryDependencies: [],
    radixPrimitive: "Switch",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Select",
    slug: "select",
    category: "form",
    description: "Displays a list of options for the user to pick from.",
    source: {
      package: "@workspace/design-system",
      path: "components/select",
      exportName: "Select",
    },
    dependencies: ["@radix-ui/react-select", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "Select",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "FormField",
    slug: "form",
    category: "form",
    description: "Building blocks for forms with validation support.",
    source: {
      package: "@workspace/design-system",
      path: "components/form",
      exportName: "FormField",
    },
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["label"],
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Card",
    slug: "card",
    category: "layout",
    description: "Displays a card with header, content, and footer sections.",
    source: {
      package: "@workspace/design-system",
      path: "components/card",
      exportName: "Card",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Separator",
    slug: "separator",
    category: "layout",
    description: "Visually or semantically separates content.",
    source: {
      package: "@workspace/design-system",
      path: "components/separator",
      exportName: "Separator",
    },
    dependencies: ["@radix-ui/react-separator"],
    registryDependencies: [],
    radixPrimitive: "Separator",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "ScrollArea",
    slug: "scroll-area",
    category: "layout",
    description: "Augments native scroll functionality for custom styling.",
    source: {
      package: "@workspace/design-system",
      path: "components/scroll-area",
      exportName: "ScrollArea",
    },
    dependencies: ["@radix-ui/react-scroll-area"],
    registryDependencies: [],
    radixPrimitive: "ScrollArea",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Tabs",
    slug: "tabs",
    category: "layout",
    description: "A set of layered sections of content displayed one at a time.",
    source: {
      package: "@workspace/design-system",
      path: "components/tabs",
      exportName: "Tabs",
    },
    dependencies: ["@radix-ui/react-tabs"],
    registryDependencies: [],
    radixPrimitive: "Tabs",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Accordion",
    slug: "accordion",
    category: "layout",
    description: "A vertically stacked set of interactive headings.",
    source: {
      package: "@workspace/design-system",
      path: "components/accordion",
      exportName: "Accordion",
    },
    dependencies: ["@radix-ui/react-accordion", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "Accordion",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Table",
    slug: "table",
    category: "layout",
    description: "A responsive table component.",
    source: {
      package: "@workspace/design-system",
      path: "components/table",
      exportName: "Table",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FEEDBACK COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Alert",
    slug: "alert",
    category: "feedback",
    description: "Displays a callout for important information.",
    source: {
      package: "@workspace/design-system",
      path: "components/alert",
      exportName: "Alert",
    },
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Badge",
    slug: "badge",
    category: "feedback",
    description: "Displays a badge or a component that looks like a badge.",
    source: {
      package: "@workspace/design-system",
      path: "components/badge",
      exportName: "Badge",
    },
    dependencies: ["class-variance-authority", "@radix-ui/react-slot"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Skeleton",
    slug: "skeleton",
    category: "feedback",
    description: "Used to show a placeholder while content is loading.",
    source: {
      package: "@workspace/design-system",
      path: "components/skeleton",
      exportName: "Skeleton",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Spinner",
    slug: "spinner",
    category: "feedback",
    description: "A loading spinner indicator.",
    source: {
      package: "@workspace/design-system",
      path: "components/spinner",
      exportName: "Spinner",
    },
    dependencies: ["class-variance-authority"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Progress",
    slug: "progress",
    category: "feedback",
    description: "Displays an indicator showing completion progress.",
    source: {
      package: "@workspace/design-system",
      path: "components/progress",
      exportName: "Progress",
    },
    dependencies: ["@radix-ui/react-progress"],
    registryDependencies: [],
    radixPrimitive: "Progress",
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OVERLAY COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Dialog",
    slug: "dialog",
    category: "overlay",
    description: "A window overlaid on the primary window.",
    source: {
      package: "@workspace/design-system",
      path: "components/dialog",
      exportName: "Dialog",
    },
    dependencies: ["@radix-ui/react-dialog", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "Dialog",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "DropdownMenu",
    slug: "dropdown-menu",
    category: "overlay",
    description: "Displays a menu to the user triggered by a button.",
    source: {
      package: "@workspace/design-system",
      path: "components/dropdown-menu",
      exportName: "DropdownMenu",
    },
    dependencies: ["@radix-ui/react-dropdown-menu", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "DropdownMenu",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Tooltip",
    slug: "tooltip",
    category: "overlay",
    description: "A popup that displays information related to an element.",
    source: {
      package: "@workspace/design-system",
      path: "components/tooltip",
      exportName: "Tooltip",
    },
    dependencies: ["@radix-ui/react-tooltip"],
    registryDependencies: [],
    radixPrimitive: "Tooltip",
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISPLAY COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Avatar",
    slug: "avatar",
    category: "display",
    description: "An image element with a fallback for representing the user.",
    source: {
      package: "@workspace/design-system",
      path: "components/avatar",
      exportName: "Avatar",
    },
    dependencies: ["@radix-ui/react-avatar"],
    registryDependencies: [],
    radixPrimitive: "Avatar",
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL FORM COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Textarea",
    slug: "textarea",
    category: "form",
    description: "Multi-line text input field.",
    source: {
      package: "@workspace/design-system",
      path: "components/textarea",
      exportName: "Textarea",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "RadioGroup",
    slug: "radio-group",
    category: "form",
    description: "A set of checkable buttons where only one can be checked at a time.",
    source: {
      package: "@workspace/design-system",
      path: "components/radio-group",
      exportName: "RadioGroup",
    },
    dependencies: ["@radix-ui/react-radio-group", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "RadioGroup",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Slider",
    slug: "slider",
    category: "form",
    description: "An input where the user selects a value from within a given range.",
    source: {
      package: "@workspace/design-system",
      path: "components/slider",
      exportName: "Slider",
    },
    dependencies: ["@radix-ui/react-slider"],
    registryDependencies: [],
    radixPrimitive: "Slider",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Combobox",
    slug: "combobox",
    category: "form",
    description: "Autocomplete input and command palette with a list of suggestions.",
    source: {
      package: "@workspace/design-system",
      path: "components/combobox",
      exportName: "Combobox",
    },
    dependencies: ["@radix-ui/react-popover", "lucide-react"],
    registryDependencies: ["button", "command", "popover"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Command",
    slug: "command",
    category: "form",
    description: "Fast, composable, unstyled command menu for React.",
    source: {
      package: "@workspace/design-system",
      path: "components/command",
      exportName: "Command",
    },
    dependencies: ["cmdk", "lucide-react"],
    registryDependencies: ["dialog"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "InputOTP",
    slug: "input-otp",
    category: "form",
    description: "Accessible one-time password component with customizable length.",
    source: {
      package: "@workspace/design-system",
      path: "components/input-otp",
      exportName: "InputOTP",
    },
    dependencies: ["input-otp"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "NativeSelect",
    slug: "native-select",
    category: "form",
    description: "Native HTML select element with custom styling.",
    source: {
      package: "@workspace/design-system",
      path: "components/native-select",
      exportName: "NativeSelect",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "NaturalDateInput",
    slug: "natural-date-input",
    category: "form",
    description: "Natural language date input with parsing.",
    source: {
      package: "@workspace/design-system",
      path: "components/natural-date-input",
      exportName: "NaturalDateInput",
    },
    dependencies: ["date-fns"],
    registryDependencies: ["input"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "InputGroup",
    slug: "input-group",
    category: "form",
    description: "Input with prefix and suffix addons.",
    source: {
      package: "@workspace/design-system",
      path: "components/input-group",
      exportName: "InputGroup",
    },
    dependencies: [],
    registryDependencies: ["input"],
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL LAYOUT COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Breadcrumb",
    slug: "breadcrumb",
    category: "layout",
    description: "Displays the path to the current resource using a hierarchy of links.",
    source: {
      package: "@workspace/design-system",
      path: "components/breadcrumb",
      exportName: "Breadcrumb",
    },
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Collapsible",
    slug: "collapsible",
    category: "layout",
    description: "An interactive component which expands/collapses a panel.",
    source: {
      package: "@workspace/design-system",
      path: "components/collapsible",
      exportName: "Collapsible",
    },
    dependencies: ["@radix-ui/react-collapsible"],
    registryDependencies: [],
    radixPrimitive: "Collapsible",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Resizable",
    slug: "resizable",
    category: "layout",
    description: "Accessible resizable panel groups and layouts with keyboard support.",
    source: {
      package: "@workspace/design-system",
      path: "components/resizable",
      exportName: "ResizablePanelGroup",
    },
    dependencies: ["react-resizable-panels"],
    registryDependencies: [],
    persona: { quorum: false, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Sheet",
    slug: "sheet",
    category: "layout",
    description: "Extends the Dialog component to display content that complements the main content of the screen.",
    source: {
      package: "@workspace/design-system",
      path: "components/sheet",
      exportName: "Sheet",
    },
    dependencies: ["@radix-ui/react-dialog", "class-variance-authority", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "Dialog",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Drawer",
    slug: "drawer",
    category: "layout",
    description: "A drawer component for mobile and desktop.",
    source: {
      package: "@workspace/design-system",
      path: "components/drawer",
      exportName: "Drawer",
    },
    dependencies: ["vaul"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Sidebar",
    slug: "sidebar",
    category: "navigation",
    description: "A composable, themeable and customizable sidebar component.",
    source: {
      package: "@workspace/design-system",
      path: "components/sidebar",
      exportName: "Sidebar",
    },
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    registryDependencies: ["button", "separator", "sheet", "skeleton", "tooltip"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "NavigationMenu",
    slug: "navigation-menu",
    category: "navigation",
    description: "A collection of links for navigating websites.",
    source: {
      package: "@workspace/design-system",
      path: "components/navigation-menu",
      exportName: "NavigationMenu",
    },
    dependencies: ["@radix-ui/react-navigation-menu", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "NavigationMenu",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Pagination",
    slug: "pagination",
    category: "navigation",
    description: "Pagination with page navigation, next and previous links.",
    source: {
      package: "@workspace/design-system",
      path: "components/pagination",
      exportName: "Pagination",
    },
    dependencies: ["lucide-react"],
    registryDependencies: ["button"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Carousel",
    slug: "carousel",
    category: "layout",
    description: "A carousel with motion and swipe built using Embla.",
    source: {
      package: "@workspace/design-system",
      path: "components/carousel",
      exportName: "Carousel",
    },
    dependencies: ["embla-carousel-react", "lucide-react"],
    registryDependencies: ["button"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "AspectRatio",
    slug: "aspect-ratio",
    category: "layout",
    description: "Displays content within a desired ratio.",
    source: {
      package: "@workspace/design-system",
      path: "components/aspect-ratio",
      exportName: "AspectRatio",
    },
    dependencies: ["@radix-ui/react-aspect-ratio"],
    registryDependencies: [],
    radixPrimitive: "AspectRatio",
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL FEEDBACK COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Sonner",
    slug: "sonner",
    category: "feedback",
    description: "An opinionated toast component for React.",
    source: {
      package: "@workspace/design-system",
      path: "components/sonner",
      exportName: "Toaster",
    },
    dependencies: ["sonner"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Empty",
    slug: "empty",
    category: "feedback",
    description: "Empty state placeholder component.",
    source: {
      package: "@workspace/design-system",
      path: "components/empty",
      exportName: "Empty",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL OVERLAY COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "AlertDialog",
    slug: "alert-dialog",
    category: "overlay",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
    source: {
      package: "@workspace/design-system",
      path: "components/alert-dialog",
      exportName: "AlertDialog",
    },
    dependencies: ["@radix-ui/react-alert-dialog"],
    registryDependencies: ["button"],
    radixPrimitive: "AlertDialog",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Popover",
    slug: "popover",
    category: "overlay",
    description: "Displays rich content in a portal, triggered by a button.",
    source: {
      package: "@workspace/design-system",
      path: "components/popover",
      exportName: "Popover",
    },
    dependencies: ["@radix-ui/react-popover"],
    registryDependencies: [],
    radixPrimitive: "Popover",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "HoverCard",
    slug: "hover-card",
    category: "overlay",
    description: "For sighted users to preview content available behind a link.",
    source: {
      package: "@workspace/design-system",
      path: "components/hover-card",
      exportName: "HoverCard",
    },
    dependencies: ["@radix-ui/react-hover-card"],
    registryDependencies: [],
    radixPrimitive: "HoverCard",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "ContextMenu",
    slug: "context-menu",
    category: "overlay",
    description: "Displays a menu to the user triggered by right-click.",
    source: {
      package: "@workspace/design-system",
      path: "components/context-menu",
      exportName: "ContextMenu",
    },
    dependencies: ["@radix-ui/react-context-menu", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "ContextMenu",
    persona: { quorum: false, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Menubar",
    slug: "menubar",
    category: "overlay",
    description: "A visually persistent menu common in desktop applications.",
    source: {
      package: "@workspace/design-system",
      path: "components/menubar",
      exportName: "Menubar",
    },
    dependencies: ["@radix-ui/react-menubar", "lucide-react"],
    registryDependencies: [],
    radixPrimitive: "Menubar",
    persona: { quorum: false, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "ResponsiveModal",
    slug: "responsive-modal",
    category: "overlay",
    description: "A modal that adapts to mobile (drawer) and desktop (dialog).",
    source: {
      package: "@workspace/design-system",
      path: "components/responsive-modal",
      exportName: "ResponsiveModal",
    },
    dependencies: [],
    registryDependencies: ["dialog", "drawer"],
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL DISPLAY COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Chart",
    slug: "chart",
    category: "display",
    description: "Beautiful charts built using Recharts.",
    source: {
      package: "@workspace/design-system",
      path: "components/chart",
      exportName: "ChartContainer",
    },
    dependencies: ["recharts", "lucide-react"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Calendar",
    slug: "calendar",
    category: "display",
    description: "A date field component that allows users to enter and edit date.",
    source: {
      package: "@workspace/design-system",
      path: "components/calendar",
      exportName: "Calendar",
    },
    dependencies: ["react-day-picker", "lucide-react"],
    registryDependencies: ["button"],
    persona: { quorum: true, cobalt: true },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://component/v1",
    name: "Toggle",
    slug: "toggle",
    category: "form",
    description: "A two-state button that can be either on or off.",
    source: {
      package: "@workspace/design-system",
      path: "components/toggle",
      exportName: "Toggle",
    },
    dependencies: ["@radix-ui/react-toggle", "class-variance-authority"],
    registryDependencies: [],
    radixPrimitive: "Toggle",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "ToggleGroup",
    slug: "toggle-group",
    category: "form",
    description: "A set of two-state buttons that can be toggled on or off.",
    source: {
      package: "@workspace/design-system",
      path: "components/toggle-group",
      exportName: "ToggleGroup",
    },
    dependencies: ["@radix-ui/react-toggle-group", "class-variance-authority"],
    registryDependencies: ["toggle"],
    radixPrimitive: "ToggleGroup",
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "ButtonGroup",
    slug: "button-group",
    category: "form",
    description: "A group of buttons with shared styling.",
    source: {
      package: "@workspace/design-system",
      path: "components/button-group",
      exportName: "ButtonGroup",
    },
    dependencies: [],
    registryDependencies: ["button"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Field",
    slug: "field",
    category: "form",
    description: "Form field wrapper with label, description, and error message.",
    source: {
      package: "@workspace/design-system",
      path: "components/field",
      exportName: "Field",
    },
    dependencies: [],
    registryDependencies: ["label"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Item",
    slug: "item",
    category: "layout",
    description: "Generic list item component.",
    source: {
      package: "@workspace/design-system",
      path: "components/item",
      exportName: "Item",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "Kbd",
    slug: "kbd",
    category: "display",
    description: "Displays keyboard shortcuts.",
    source: {
      package: "@workspace/design-system",
      path: "components/kbd",
      exportName: "Kbd",
    },
    dependencies: [],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "SortableList",
    slug: "sortable-list",
    category: "layout",
    description: "A sortable list component with drag and drop.",
    source: {
      package: "@workspace/design-system",
      path: "components/sortable-list",
      exportName: "SortableList",
    },
    dependencies: ["@dnd-kit/core", "@dnd-kit/sortable"],
    registryDependencies: [],
    persona: { quorum: false, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "DataTable",
    slug: "data-table",
    category: "data",
    description: "Powerful table component built on top of TanStack Table.",
    source: {
      package: "@workspace/design-system",
      path: "components/data-table",
      exportName: "DataTable",
    },
    dependencies: ["@tanstack/react-table"],
    registryDependencies: ["table", "button", "input"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "DataTableColumnHeader",
    slug: "data-table-column-header",
    category: "data",
    description: "Column header for data table with sorting.",
    source: {
      package: "@workspace/design-system",
      path: "components/data-table-column-header",
      exportName: "DataTableColumnHeader",
    },
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: ["button", "dropdown-menu"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "DataTablePagination",
    slug: "data-table-pagination",
    category: "data",
    description: "Pagination controls for data table.",
    source: {
      package: "@workspace/design-system",
      path: "components/data-table-pagination",
      exportName: "DataTablePagination",
    },
    dependencies: ["@tanstack/react-table", "lucide-react"],
    registryDependencies: ["button", "select"],
    persona: { quorum: true, cobalt: true },
  },
  {
    $schema: "axis://component/v1",
    name: "ThemeProvider",
    slug: "theme-provider",
    category: "layout",
    description: "Theme provider for managing dark/light mode.",
    source: {
      package: "@workspace/design-system",
      path: "components/theme-provider",
      exportName: "ThemeProvider",
    },
    dependencies: ["next-themes"],
    registryDependencies: [],
    persona: { quorum: true, cobalt: true },
  },
];

// ============================================================================
// Component Registry Schema (Full)
// ============================================================================

export const componentRegistrySchema = z.object({
  $schema: z
    .literal("axis://component-registry/v1")
    .default("axis://component-registry/v1"),
  version: z.string().default("1.0.0"),
  components: z.array(componentRegistryItemSchema),
});

export type ComponentRegistry = z.infer<typeof componentRegistrySchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a component by slug
 */
export function getComponent(slug: string): ComponentRegistryItem | undefined {
  return COMPONENT_REGISTRY.find((c) => c.slug === slug);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(
  category: ComponentCategory
): ComponentRegistryItem[] {
  return COMPONENT_REGISTRY.filter((c) => c.category === category);
}

/**
 * Get components available for a persona
 */
export function getComponentsForPersona(
  persona: "quorum" | "cobalt"
): ComponentRegistryItem[] {
  return COMPONENT_REGISTRY.filter((c) => c.persona[persona]);
}

/**
 * Get the import statement for a component
 */
export function getComponentImport(component: ComponentRegistryItem): string {
  return `import { ${component.source.exportName} } from "${component.source.package}";`;
}
