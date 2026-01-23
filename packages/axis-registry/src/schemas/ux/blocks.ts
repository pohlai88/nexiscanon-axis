/**
 * UI Blocks Registry (B10)
 *
 * Registry of reusable UI blocks/patterns for AXIS applications.
 * These are higher-level compositions of shadcn/ui components.
 *
 * Following the B10-UX document patterns for Quorum & Cobalt experiences.
 */

import { z } from "zod";

// ============================================================================
// Block Categories
// ============================================================================

export const BLOCK_CATEGORY = [
  "shell", // Application shells, layouts
  "navigation", // Sidebar, navigation, command palette
  "form", // Form sections, wizards, field groups
  "table", // Data tables, lists, grids
  "feedback", // Empty states, error states, loading
  "dashboard", // Cards, widgets, KPIs
  "auth", // Login, register, password reset
] as const;

export type BlockCategory = (typeof BLOCK_CATEGORY)[number];

// ============================================================================
// Block Registry Schema
// ============================================================================

export const blockRegistryItemSchema = z.object({
  $schema: z.literal("axis://block/v1").default("axis://block/v1"),

  // Identity
  name: z.string().describe("Block name (PascalCase with number suffix)"),
  slug: z.string().describe("URL-safe identifier"),

  // Categorization
  category: z.enum(BLOCK_CATEGORY),
  description: z.string().describe("Short description of the block"),

  // Source
  source: z.object({
    package: z
      .enum(["@workspace/design-system"])
      .default("@workspace/design-system"),
    path: z.string().describe("Path within package"),
    exportName: z.string().describe("Named export"),
  }),

  // Dependencies
  componentDependencies: z
    .array(z.string())
    .default([])
    .describe("Required components from @workspace/design-system"),
  blockDependencies: z
    .array(z.string())
    .default([])
    .describe("Other blocks this depends on"),

  // Persona suitability
  persona: z.object({
    quorum: z.boolean().default(true),
    cobalt: z.boolean().default(true),
    recommended: z
      .enum(["quorum", "cobalt", "both"] as const)
      .default("both")
      .describe("Which persona this is optimized for"),
  }),

  // Variants
  variants: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        props: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .default([]),

  // Props schema (simplified)
  props: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean().default(false),
        defaultValue: z.unknown().optional(),
        description: z.string().optional(),
      })
    )
    .default([]),
});

export type BlockRegistryItem = z.infer<typeof blockRegistryItemSchema>;

// ============================================================================
// Block Registry - All Blocks
// ============================================================================

// Use Partial to allow optional fields with defaults
type BlockRegistryInput = Omit<BlockRegistryItem, "variants" | "props"> & {
  variants?: BlockRegistryItem["variants"];
  props?: BlockRegistryItem["props"];
};

const BLOCK_REGISTRY_INPUT: BlockRegistryInput[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SHELL BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "ApplicationShell01",
    slug: "application-shell-01",
    category: "shell",
    description:
      "Main application shell with sidebar navigation, header, and content area.",
    source: {
      package: "@workspace/design-system",
      path: "shells/ApplicationShell01",
      exportName: "ApplicationShell01",
    },
    componentDependencies: [
      "button",
      "avatar",
      "dropdown-menu",
      "scroll-area",
      "tooltip",
    ],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      {
        name: "persona",
        type: '"quorum" | "cobalt"',
        required: true,
        description: "Which persona experience to render",
      },
      {
        name: "navigation",
        type: "NavigationItem[]",
        required: true,
        description: "Navigation items for sidebar",
      },
      {
        name: "user",
        type: "UserInfo",
        required: true,
        description: "Current user information",
      },
      {
        name: "children",
        type: "React.ReactNode",
        required: true,
        description: "Page content",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "CommandPalette01",
    slug: "command-palette-01",
    category: "navigation",
    description: "Command palette with search, recent items, and actions (Cmd+K).",
    source: {
      package: "@workspace/design-system",
      path: "blocks/CommandPalette01",
      exportName: "CommandPalette01",
    },
    componentDependencies: ["dialog"],
    blockDependencies: [],
    persona: {
      quorum: false,
      cobalt: true,
      recommended: "cobalt",
    },
    props: [
      {
        name: "commands",
        type: "Command[]",
        required: true,
        description: "Available commands",
      },
      {
        name: "recentItems",
        type: "RecentItem[]",
        required: false,
        description: "Recently accessed items",
      },
    ],
  },
  {
    $schema: "axis://block/v1",
    name: "Breadcrumbs01",
    slug: "breadcrumbs-01",
    category: "navigation",
    description: "Breadcrumb navigation with home icon and current page.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/Breadcrumbs01",
      exportName: "Breadcrumbs01",
    },
    componentDependencies: [],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      {
        name: "items",
        type: "BreadcrumbItem[]",
        required: true,
        description: "Breadcrumb path items",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "FormSection01",
    slug: "form-section-01",
    category: "form",
    description: "Form section with title, description, and content area.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/FormSection01",
      exportName: "FormSection01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      { name: "title", type: "string", required: true },
      { name: "description", type: "string", required: false },
      { name: "children", type: "React.ReactNode", required: true },
      { name: "collapsible", type: "boolean", required: false, defaultValue: false },
    ],
  },
  {
    $schema: "axis://block/v1",
    name: "Wizard01",
    slug: "wizard-01",
    category: "form",
    description: "Multi-step wizard with progress indicator and validation.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/Wizard01",
      exportName: "Wizard01",
    },
    componentDependencies: ["button", "card", "progress"],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: false,
      recommended: "quorum",
    },
    props: [
      { name: "steps", type: "WizardStep[]", required: true },
      { name: "onComplete", type: "(data: Record<string, unknown>) => Promise<void>", required: true },
      { name: "onCancel", type: "() => void", required: false },
      { name: "title", type: "string", required: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLE BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "DataFortress01",
    slug: "data-fortress-01",
    category: "table",
    description:
      "Full-featured data table with search, filters, sorting, and bulk actions.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/DataFortress01",
      exportName: "DataFortress01",
    },
    componentDependencies: [
      "table",
      "input",
      "button",
      "dropdown-menu",
      "checkbox",
    ],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      { name: "data", type: "T[]", required: true },
      { name: "columns", type: "ColumnDef<T>[]", required: true },
      { name: "onRowClick", type: "(row: T) => void", required: false },
      { name: "searchable", type: "boolean", required: false, defaultValue: true },
      { name: "persona", type: '"quorum" | "cobalt"', required: false, defaultValue: "quorum" },
    ],
  },
  {
    $schema: "axis://block/v1",
    name: "BulkActionBar01",
    slug: "bulk-action-bar-01",
    category: "table",
    description: "Floating action bar for bulk operations on selected items.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/BulkActionBar01",
      exportName: "BulkActionBar01",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: {
      quorum: false,
      cobalt: true,
      recommended: "cobalt",
    },
    props: [
      { name: "selectedIds", type: "string[]", required: true },
      { name: "actions", type: "BulkAction[]", required: true },
      { name: "onClearSelection", type: "() => void", required: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FEEDBACK BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "EmptyState01",
    slug: "empty-state-01",
    category: "feedback",
    description: "Empty state with icon, title, description, and CTA button.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/EmptyState01",
      exportName: "EmptyState01",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      { name: "icon", type: "LucideIcon", required: false },
      { name: "title", type: "string", required: true },
      { name: "description", type: "string", required: false },
      { name: "action", type: "{ label: string; onClick: () => void }", required: false },
    ],
  },
  {
    $schema: "axis://block/v1",
    name: "ErrorState01",
    slug: "error-state-01",
    category: "feedback",
    description: "Error state with retry action and support link.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/ErrorState01",
      exportName: "ErrorState01",
    },
    componentDependencies: ["button", "alert"],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      { name: "title", type: "string", required: false, defaultValue: "Something went wrong" },
      { name: "description", type: "string", required: false },
      { name: "onRetry", type: "() => void", required: false },
      { name: "error", type: "Error", required: false },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "StatCard01",
    slug: "stat-card-01",
    category: "dashboard",
    description: "KPI card with value, trend indicator, and sparkline.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/StatCard01",
      exportName: "StatCard01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: {
      quorum: true,
      cobalt: true,
      recommended: "both",
    },
    props: [
      { name: "title", type: "string", required: true },
      { name: "value", type: "string | number", required: true },
      { name: "change", type: "{ value: number; direction: 'up' | 'down' | 'flat' }", required: false },
      { name: "sparklineData", type: "number[]", required: false },
    ],
  },
];

// Apply defaults to create the full registry
export const BLOCK_REGISTRY: BlockRegistryItem[] = BLOCK_REGISTRY_INPUT.map(
  (block) => ({
    ...block,
    variants: block.variants ?? [],
    props: block.props ?? [],
  })
);

// ============================================================================
// Block Registry Schema (Full)
// ============================================================================

export const blockRegistrySchema = z.object({
  $schema: z.literal("axis://block-registry/v1").default("axis://block-registry/v1"),
  version: z.string().default("1.0.0"),
  blocks: z.array(blockRegistryItemSchema),
});

export type BlockRegistry = z.infer<typeof blockRegistrySchema>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a block by slug
 */
export function getBlock(slug: string): BlockRegistryItem | undefined {
  return BLOCK_REGISTRY.find((b) => b.slug === slug);
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: BlockCategory): BlockRegistryItem[] {
  return BLOCK_REGISTRY.filter((b) => b.category === category);
}

/**
 * Get blocks available for a persona
 */
export function getBlocksForPersona(
  persona: "quorum" | "cobalt"
): BlockRegistryItem[] {
  return BLOCK_REGISTRY.filter((b) => b.persona[persona]);
}

/**
 * Get blocks recommended for a persona
 */
export function getRecommendedBlocks(
  persona: "quorum" | "cobalt"
): BlockRegistryItem[] {
  return BLOCK_REGISTRY.filter(
    (b) => b.persona.recommended === persona || b.persona.recommended === "both"
  );
}
