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
