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
  "chart", // Chart patterns and visualizations
  "calendar", // Calendar and date picker patterns
  "marketing", // Marketing pages and sections
  "ecommerce", // Ecommerce patterns
  "erp", // ERP-specific patterns
  "afanda", // AFANDA collaboration patterns
  "cobalt", // Cobalt-specific patterns
  "quorum", // Quorum-specific patterns
  "audit", // Audit and compliance patterns
  "grid", // Grid layouts
  "input", // Input patterns
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL NAVIGATION BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "AppSidebar01",
    slug: "app-sidebar-01",
    category: "navigation",
    description: "Main application sidebar with navigation items.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/app-sidebar-01",
      exportName: "AppSidebar01",
    },
    componentDependencies: ["sidebar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CollapsibleSidebar01",
    slug: "collapsible-sidebar-01",
    category: "navigation",
    description: "Collapsible sidebar with expand/collapse functionality.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/collapsible-sidebar-01",
      exportName: "CollapsibleSidebar01",
    },
    componentDependencies: ["sidebar", "collapsible"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "FloatingSidebar01",
    slug: "floating-sidebar-01",
    category: "navigation",
    description: "Floating sidebar that overlays content.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/floating-sidebar-01",
      exportName: "FloatingSidebar01",
    },
    componentDependencies: ["sidebar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DocsSidebar01",
    slug: "docs-sidebar-01",
    category: "navigation",
    description: "Documentation sidebar with nested navigation.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/docs-sidebar-01",
      exportName: "DocsSidebar01",
    },
    componentDependencies: ["sidebar", "scroll-area"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SubmenuSidebar01",
    slug: "submenu-sidebar-01",
    category: "navigation",
    description: "Sidebar with submenu support.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/submenu-sidebar-01",
      exportName: "SubmenuSidebar01",
    },
    componentDependencies: ["sidebar", "collapsible"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "SidebarCalendars",
    slug: "sidebar-calendars",
    category: "navigation",
    description: "Sidebar with integrated calendars.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/sidebar-calendars",
      exportName: "SidebarCalendars",
    },
    componentDependencies: ["sidebar", "calendar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SidebarOptInForm",
    slug: "sidebar-opt-in-form",
    category: "navigation",
    description: "Sidebar with opt-in form.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/sidebar-opt-in-form",
      exportName: "SidebarOptInForm",
    },
    componentDependencies: ["sidebar", "button", "input"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DatePickerSidebar",
    slug: "date-picker-sidebar",
    category: "navigation",
    description: "Sidebar with date picker.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/date-picker-sidebar",
      exportName: "DatePickerSidebar",
    },
    componentDependencies: ["sidebar", "calendar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavDropdown",
    slug: "nav-dropdown",
    category: "navigation",
    description: "Navigation dropdown component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-dropdown",
      exportName: "NavDropdown",
    },
    componentDependencies: ["dropdown-menu"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavFavorites",
    slug: "nav-favorites",
    category: "navigation",
    description: "Navigation favorites component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-favorites",
      exportName: "NavFavorites",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavMain",
    slug: "nav-main",
    category: "navigation",
    description: "Main navigation component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-main",
      exportName: "NavMain",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavProjects",
    slug: "nav-projects",
    category: "navigation",
    description: "Projects navigation component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-projects",
      exportName: "NavProjects",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavSecondary",
    slug: "nav-secondary",
    category: "navigation",
    description: "Secondary navigation component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-secondary",
      exportName: "NavSecondary",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavUser",
    slug: "nav-user",
    category: "navigation",
    description: "User navigation component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-user",
      exportName: "NavUser",
    },
    componentDependencies: ["dropdown-menu", "avatar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NavWorkspaces",
    slug: "nav-workspaces",
    category: "navigation",
    description: "Workspaces navigation component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/nav-workspaces",
      exportName: "NavWorkspaces",
    },
    componentDependencies: ["dropdown-menu"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "TeamSwitcher",
    slug: "team-switcher",
    category: "navigation",
    description: "Team switcher component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/team-switcher",
      exportName: "TeamSwitcher",
    },
    componentDependencies: ["dropdown-menu"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "VersionSwitcher",
    slug: "version-switcher",
    category: "navigation",
    description: "Version switcher component.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/sidebars/version-switcher",
      exportName: "VersionSwitcher",
    },
    componentDependencies: ["dropdown-menu"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SiteHeader01",
    slug: "site-header-01",
    category: "navigation",
    description: "Site header with navigation.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/site-header-01",
      exportName: "SiteHeader01",
    },
    componentDependencies: ["button", "navigation-menu"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NotificationCenter01",
    slug: "notification-center-01",
    category: "navigation",
    description: "Notification center with list of notifications.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/notifications/notification-center-01",
      exportName: "NotificationCenter01",
    },
    componentDependencies: ["popover", "button", "scroll-area"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL FORM & AUTH BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "ForgotPasswordForm01",
    slug: "forgot-password-form-01",
    category: "auth",
    description: "Forgot password form with email input.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/forgot-password-form-01",
      exportName: "ForgotPasswordForm01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "ResetPasswordForm01",
    slug: "reset-password-form-01",
    category: "auth",
    description: "Reset password form with new password input.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/reset-password-form-01",
      exportName: "ResetPasswordForm01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "MagicLinkForm01",
    slug: "magic-link-form-01",
    category: "auth",
    description: "Magic link authentication form.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/magic-link-form-01",
      exportName: "MagicLinkForm01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "OTPForm01",
    slug: "otp-form-01",
    category: "auth",
    description: "OTP verification form.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/otp-form-01",
      exportName: "OTPForm01",
    },
    componentDependencies: ["button", "input-otp", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SignupForm01",
    slug: "signup-form-01",
    category: "auth",
    description: "User signup form.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/signup-form-01",
      exportName: "SignupForm01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LoginForm01",
    slug: "login-form-01",
    category: "auth",
    description: "User login form variant 1.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/login-form-01",
      exportName: "LoginForm01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LoginForm02",
    slug: "login-form-02",
    category: "auth",
    description: "User login form variant 2.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/login-form-02",
      exportName: "LoginForm02",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LoginWithImage01",
    slug: "login-with-image-01",
    category: "auth",
    description: "Login form with side image.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/auth/login-with-image-01",
      exportName: "LoginWithImage01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CrudForm01",
    slug: "crud-form-01",
    category: "form",
    description: "CRUD form with validation.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/forms/crud-form-01",
      exportName: "CrudForm01",
    },
    componentDependencies: ["button", "input", "label", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "MultiStepForm01",
    slug: "multi-step-form-01",
    category: "form",
    description: "Multi-step form with progress.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/forms/multi-step-form-01",
      exportName: "MultiStepForm01",
    },
    componentDependencies: ["button", "card", "progress"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL FEEDBACK BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "SkeletonCard01",
    slug: "skeleton-card-01",
    category: "feedback",
    description: "Skeleton loading state for cards.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/loading/skeleton-card-01",
      exportName: "SkeletonCard01",
    },
    componentDependencies: ["skeleton", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SkeletonForm01",
    slug: "skeleton-form-01",
    category: "feedback",
    description: "Skeleton loading state for forms.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/loading/skeleton-form-01",
      exportName: "SkeletonForm01",
    },
    componentDependencies: ["skeleton"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SkeletonTable01",
    slug: "skeleton-table-01",
    category: "feedback",
    description: "Skeleton loading state for tables.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/loading/skeleton-table-01",
      exportName: "SkeletonTable01",
    },
    componentDependencies: ["skeleton", "table"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL DASHBOARD BLOCKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "DashboardLayout01",
    slug: "dashboard-layout-01",
    category: "dashboard",
    description: "Dashboard layout with grid.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/dashboards/dashboard-layout-01",
      exportName: "DashboardLayout01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DashboardDialog01",
    slug: "dashboard-dialog-01",
    category: "dashboard",
    description: "Dashboard dialog for settings.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/dashboards/dashboard-dialog-01",
      exportName: "DashboardDialog01",
    },
    componentDependencies: ["dialog", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DashboardShell01",
    slug: "dashboard-shell-01",
    category: "dashboard",
    description: "Dashboard shell with header and content.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/dashboards/dashboard-shell-01",
      exportName: "DashboardShell01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DashboardHeader01",
    slug: "dashboard-header-01",
    category: "dashboard",
    description: "Dashboard header with title and actions.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/dashboards/dashboard-header-01",
      exportName: "DashboardHeader01",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "Widgets01",
    slug: "widgets-01",
    category: "dashboard",
    description: "Dashboard widgets collection.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/dashboards/widgets-01",
      exportName: "Widgets01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "StatsGrid01",
    slug: "stats-grid-01",
    category: "dashboard",
    description: "Stats grid with KPI cards.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/dashboards/stats-grid-01",
      exportName: "StatsGrid01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "ProfileCard01",
    slug: "profile-card-01",
    category: "dashboard",
    description: "User profile card.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/cards/profile-card-01",
      exportName: "ProfileCard01",
    },
    componentDependencies: ["card", "avatar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SectionCards01",
    slug: "section-cards-01",
    category: "dashboard",
    description: "Section cards with content.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/cards/section-cards-01",
      exportName: "SectionCards01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHART BLOCKS (29 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "ActivityChart01",
    slug: "activity-chart-01",
    category: "chart",
    description: "Activity chart visualization.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/activity-chart-01",
      exportName: "ActivityChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "AreaChart01",
    slug: "area-chart-01",
    category: "chart",
    description: "Basic area chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/area-chart-01",
      exportName: "AreaChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "AreaChartGradient01",
    slug: "area-chart-gradient-01",
    category: "chart",
    description: "Area chart with gradient fill.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/area-chart-gradient-01",
      exportName: "AreaChartGradient01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "AreaChartLegend01",
    slug: "area-chart-legend-01",
    category: "chart",
    description: "Area chart with legend.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/area-chart-legend-01",
      exportName: "AreaChartLegend01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "AreaChartStep01",
    slug: "area-chart-step-01",
    category: "chart",
    description: "Step area chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/area-chart-step-01",
      exportName: "AreaChartStep01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "BarChart01",
    slug: "bar-chart-01",
    category: "chart",
    description: "Basic bar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/bar-chart-01",
      exportName: "BarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "BarChartActive01",
    slug: "bar-chart-active-01",
    category: "chart",
    description: "Bar chart with active state.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/bar-chart-active-01",
      exportName: "BarChartActive01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "BarChartInteractive01",
    slug: "bar-chart-interactive-01",
    category: "chart",
    description: "Interactive bar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/bar-chart-interactive-01",
      exportName: "BarChartInteractive01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "BarChartMultiple01",
    slug: "bar-chart-multiple-01",
    category: "chart",
    description: "Multiple series bar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/bar-chart-multiple-01",
      exportName: "BarChartMultiple01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DonutChart01",
    slug: "donut-chart-01",
    category: "chart",
    description: "Donut chart visualization.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/donut-chart-01",
      exportName: "DonutChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "HorizontalBarChart01",
    slug: "horizontal-bar-chart-01",
    category: "chart",
    description: "Horizontal bar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/horizontal-bar-chart-01",
      exportName: "HorizontalBarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LabeledBarChart01",
    slug: "labeled-bar-chart-01",
    category: "chart",
    description: "Bar chart with labels.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/labeled-bar-chart-01",
      exportName: "LabeledBarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LabeledLineChart01",
    slug: "labeled-line-chart-01",
    category: "chart",
    description: "Line chart with labels.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/labeled-line-chart-01",
      exportName: "LabeledLineChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LineChart01",
    slug: "line-chart-01",
    category: "chart",
    description: "Basic line chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/line-chart-01",
      exportName: "LineChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LineChartDots01",
    slug: "line-chart-dots-01",
    category: "chart",
    description: "Line chart with dots.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/line-chart-dots-01",
      exportName: "LineChartDots01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LineChartMultiple01",
    slug: "line-chart-multiple-01",
    category: "chart",
    description: "Multiple series line chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/line-chart-multiple-01",
      exportName: "LineChartMultiple01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "LineChartStep01",
    slug: "line-chart-step-01",
    category: "chart",
    description: "Step line chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/line-chart-step-01",
      exportName: "LineChartStep01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "MixedBarChart01",
    slug: "mixed-bar-chart-01",
    category: "chart",
    description: "Mixed bar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/mixed-bar-chart-01",
      exportName: "MixedBarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NegativeBarChart01",
    slug: "negative-bar-chart-01",
    category: "chart",
    description: "Bar chart with negative values.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/negative-bar-chart-01",
      exportName: "NegativeBarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "PieChart01",
    slug: "pie-chart-01",
    category: "chart",
    description: "Basic pie chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/pie-chart-01",
      exportName: "PieChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "PieChartLegend01",
    slug: "pie-chart-legend-01",
    category: "chart",
    description: "Pie chart with legend.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/pie-chart-legend-01",
      exportName: "PieChartLegend01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "PieChartSimple01",
    slug: "pie-chart-simple-01",
    category: "chart",
    description: "Simple pie chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/pie-chart-simple-01",
      exportName: "PieChartSimple01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "RadarChart01",
    slug: "radar-chart-01",
    category: "chart",
    description: "Basic radar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/radar-chart-01",
      exportName: "RadarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "RadarChartDots01",
    slug: "radar-chart-dots-01",
    category: "chart",
    description: "Radar chart with dots.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/radar-chart-dots-01",
      exportName: "RadarChartDots01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "RadarChartMultiple01",
    slug: "radar-chart-multiple-01",
    category: "chart",
    description: "Multiple series radar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/radar-chart-multiple-01",
      exportName: "RadarChartMultiple01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "RadialChart01",
    slug: "radial-chart-01",
    category: "chart",
    description: "Basic radial chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/radial-chart-01",
      exportName: "RadialChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "RadialChartStacked01",
    slug: "radial-chart-stacked-01",
    category: "chart",
    description: "Stacked radial chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/radial-chart-stacked-01",
      exportName: "RadialChartStacked01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "StackedAreaChart01",
    slug: "stacked-area-chart-01",
    category: "chart",
    description: "Stacked area chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/stacked-area-chart-01",
      exportName: "StackedAreaChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "StackedBarChart01",
    slug: "stacked-bar-chart-01",
    category: "chart",
    description: "Stacked bar chart.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/charts/stacked-bar-chart-01",
      exportName: "StackedBarChart01",
    },
    componentDependencies: ["chart", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CALENDAR BLOCKS (16 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "CalendarBounded01",
    slug: "calendar-bounded-01",
    category: "calendar",
    description: "Calendar with date bounds.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-bounded-01",
      exportName: "CalendarBounded01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarDisabledDates01",
    slug: "calendar-disabled-dates-01",
    category: "calendar",
    description: "Calendar with disabled dates.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-disabled-dates-01",
      exportName: "CalendarDisabledDates01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarDisabledWeekends01",
    slug: "calendar-disabled-weekends-01",
    category: "calendar",
    description: "Calendar with disabled weekends.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-disabled-weekends-01",
      exportName: "CalendarDisabledWeekends01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarDropdown01",
    slug: "calendar-dropdown-01",
    category: "calendar",
    description: "Calendar in dropdown.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-dropdown-01",
      exportName: "CalendarDropdown01",
    },
    componentDependencies: ["calendar", "popover", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarLocalized01",
    slug: "calendar-localized-01",
    category: "calendar",
    description: "Localized calendar.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-localized-01",
      exportName: "CalendarLocalized01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarMinDays01",
    slug: "calendar-min-days-01",
    category: "calendar",
    description: "Calendar with minimum days selection.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-min-days-01",
      exportName: "CalendarMinDays01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarMultiMonth01",
    slug: "calendar-multi-month-01",
    category: "calendar",
    description: "Multi-month calendar.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-multi-month-01",
      exportName: "CalendarMultiMonth01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarPresets01",
    slug: "calendar-presets-01",
    category: "calendar",
    description: "Calendar with date presets.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-presets-01",
      exportName: "CalendarPresets01",
    },
    componentDependencies: ["calendar", "button", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarSimple01",
    slug: "calendar-simple-01",
    category: "calendar",
    description: "Simple calendar.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-simple-01",
      exportName: "CalendarSimple01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarTimeRange01",
    slug: "calendar-time-range-01",
    category: "calendar",
    description: "Calendar with time range selection.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-time-range-01",
      exportName: "CalendarTimeRange01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarWeekNumbers01",
    slug: "calendar-week-numbers-01",
    category: "calendar",
    description: "Calendar with week numbers.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-week-numbers-01",
      exportName: "CalendarWeekNumbers01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarWithTime01",
    slug: "calendar-with-time-01",
    category: "calendar",
    description: "Calendar with time picker.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-with-time-01",
      exportName: "CalendarWithTime01",
    },
    componentDependencies: ["calendar", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CalendarWithToday01",
    slug: "calendar-with-today-01",
    category: "calendar",
    description: "Calendar with today button.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/calendar-with-today-01",
      exportName: "CalendarWithToday01",
    },
    componentDependencies: ["calendar", "button", "card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DateRangePicker01",
    slug: "date-range-picker-01",
    category: "calendar",
    description: "Date range picker.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/date-range-picker-01",
      exportName: "DateRangePicker01",
    },
    componentDependencies: ["calendar", "popover", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "DatetimePicker01",
    slug: "datetime-picker-01",
    category: "calendar",
    description: "Datetime picker with time selection.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/datetime-picker-01",
      exportName: "DatetimePicker01",
    },
    componentDependencies: ["calendar", "popover", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "NaturalDatePicker01",
    slug: "natural-date-picker-01",
    category: "calendar",
    description: "Natural language date picker.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/calendars/natural-date-picker-01",
      exportName: "NaturalDatePicker01",
    },
    componentDependencies: ["calendar", "natural-date-input"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKETING BLOCKS (10 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "HeroSection01",
    slug: "hero-section-01",
    category: "marketing",
    description: "Hero section with CTA.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/hero-section-01",
      exportName: "HeroSection01",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "HeroSection02",
    slug: "hero-section-02",
    category: "marketing",
    description: "Hero section variant 2.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/hero-section-02",
      exportName: "HeroSection02",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "FeaturesSection01",
    slug: "features-section-01",
    category: "marketing",
    description: "Features section with grid.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/features-section-01",
      exportName: "FeaturesSection01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "Pricing01",
    slug: "pricing-01",
    category: "marketing",
    description: "Pricing section with tiers.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/pricing-01",
      exportName: "Pricing01",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "Testimonials01",
    slug: "testimonials-01",
    category: "marketing",
    description: "Testimonials section.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/testimonials-01",
      exportName: "Testimonials01",
    },
    componentDependencies: ["card", "avatar"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "FAQ01",
    slug: "faq-01",
    category: "marketing",
    description: "FAQ section with accordion.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/faq-01",
      exportName: "FAQ01",
    },
    componentDependencies: ["accordion"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "Footer01",
    slug: "footer-01",
    category: "marketing",
    description: "Footer with links and social.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/footer-01",
      exportName: "Footer01",
    },
    componentDependencies: [],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CTASection01",
    slug: "cta-section-01",
    category: "marketing",
    description: "Call-to-action section.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/cta-section-01",
      exportName: "CTASection01",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "Navbar01",
    slug: "navbar-01",
    category: "marketing",
    description: "Marketing navigation bar.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/navbar-01",
      exportName: "Navbar01",
    },
    componentDependencies: ["button", "navigation-menu"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "SocialProof01",
    slug: "social-proof-01",
    category: "marketing",
    description: "Social proof section with logos.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/marketing/social-proof-01",
      exportName: "SocialProof01",
    },
    componentDependencies: [],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOMMERCE BLOCKS (5 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "ProductList01",
    slug: "product-list-01",
    category: "ecommerce",
    description: "Product list with grid.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/ecommerce/product-list-01",
      exportName: "ProductList01",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "ProductOverview01",
    slug: "product-overview-01",
    category: "ecommerce",
    description: "Product overview page.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/ecommerce/product-overview-01",
      exportName: "ProductOverview01",
    },
    componentDependencies: ["card", "button", "tabs"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "ShoppingCart01",
    slug: "shopping-cart-01",
    category: "ecommerce",
    description: "Shopping cart with items.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/ecommerce/shopping-cart-01",
      exportName: "ShoppingCart01",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "CheckoutPage01",
    slug: "checkout-page-01",
    category: "ecommerce",
    description: "Checkout page with form.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/ecommerce/checkout-page-01",
      exportName: "CheckoutPage01",
    },
    componentDependencies: ["card", "button", "input", "label"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "OrderSummary01",
    slug: "order-summary-01",
    category: "ecommerce",
    description: "Order summary card.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/ecommerce/order-summary-01",
      exportName: "OrderSummary01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERP BLOCKS (5 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "TrialBalanceTable",
    slug: "trial-balance-table",
    category: "erp",
    description: "Trial balance table for accounting.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/erp/trial-balance-table",
      exportName: "TrialBalanceTable",
    },
    componentDependencies: ["table", "card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "ReconciliationWidget",
    slug: "reconciliation-widget",
    category: "erp",
    description: "Bank reconciliation widget.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/erp/reconciliation-widget",
      exportName: "ReconciliationWidget",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "InventoryValuationCard",
    slug: "inventory-valuation-card",
    category: "erp",
    description: "Inventory valuation card.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/erp/inventory-valuation-card",
      exportName: "InventoryValuationCard",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "ARAgingTable",
    slug: "ar-aging-table",
    category: "erp",
    description: "Accounts receivable aging table.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/erp/ar-aging-table",
      exportName: "ARAgingTable",
    },
    componentDependencies: ["table", "card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "APAgingTable",
    slug: "ap-aging-table",
    category: "erp",
    description: "Accounts payable aging table.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/erp/ap-aging-table",
      exportName: "APAgingTable",
    },
    componentDependencies: ["table", "card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AFANDA BLOCKS (5 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "ApprovalQueue",
    slug: "approval-queue",
    category: "afanda",
    description: "Approval queue for workflow items.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/afanda/approval-queue",
      exportName: "ApprovalQueue",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "ConsultationThread",
    slug: "consultation-thread",
    category: "afanda",
    description: "Consultation thread for collaboration.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/afanda/consultation-thread",
      exportName: "ConsultationThread",
    },
    componentDependencies: ["card", "avatar", "button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "EscalationLadder",
    slug: "escalation-ladder",
    category: "afanda",
    description: "Escalation ladder for approvals.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/afanda/escalation-ladder",
      exportName: "EscalationLadder",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "ReadReceiptSystem",
    slug: "read-receipt-system",
    category: "afanda",
    description: "Read receipt tracking system.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/afanda/read-receipt-system",
      exportName: "ReadReceiptSystem",
    },
    componentDependencies: ["avatar"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "SharingBoard",
    slug: "sharing-board",
    category: "afanda",
    description: "Sharing board for collaboration.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/afanda/sharing-board",
      exportName: "SharingBoard",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COBALT BLOCKS (4 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "AutofillEngine",
    slug: "autofill-engine",
    category: "cobalt",
    description: "AI-powered autofill engine.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/cobalt/autofill-engine",
      exportName: "AutofillEngine",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "CrudSAPInterface",
    slug: "crud-sap-interface",
    category: "cobalt",
    description: "CRUD interface for SAP integration.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/cobalt/crud-sap-interface",
      exportName: "CrudSAPInterface",
    },
    componentDependencies: ["card", "button", "table"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "PredictiveForm",
    slug: "predictive-form",
    category: "cobalt",
    description: "AI-powered predictive form.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/cobalt/predictive-form",
      exportName: "PredictiveForm",
    },
    componentDependencies: ["input", "button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "SummitButton",
    slug: "summit-button",
    category: "cobalt",
    description: "Summit button for critical actions.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/cobalt/summit-button",
      exportName: "SummitButton",
    },
    componentDependencies: ["button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // QUORUM BLOCKS (5 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "CommandK",
    slug: "command-k",
    category: "quorum",
    description: "Command K palette for quick actions.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/quorum/command-k",
      exportName: "CommandK",
    },
    componentDependencies: ["command", "dialog"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: false, recommended: "quorum" },
  },
  {
    $schema: "axis://block/v1",
    name: "DrilldownDashboard",
    slug: "drilldown-dashboard",
    category: "quorum",
    description: "Drilldown dashboard for SMEs.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/quorum/drilldown-dashboard",
      exportName: "DrilldownDashboard",
    },
    componentDependencies: ["card", "button"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: false, recommended: "quorum" },
  },
  {
    $schema: "axis://block/v1",
    name: "ExceptionHunter",
    slug: "exception-hunter",
    category: "quorum",
    description: "Exception hunter for anomaly detection.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/quorum/exception-hunter",
      exportName: "ExceptionHunter",
    },
    componentDependencies: ["card", "alert"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: false, recommended: "quorum" },
  },
  {
    $schema: "axis://block/v1",
    name: "SixW1HManifest",
    slug: "six-w1h-manifest",
    category: "quorum",
    description: "Six W + 1H manifest for context.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/quorum/six-w1h-manifest",
      exportName: "SixW1HManifest",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: false, recommended: "quorum" },
  },
  {
    $schema: "axis://block/v1",
    name: "TrendAnalysisWidget",
    slug: "trend-analysis-widget",
    category: "quorum",
    description: "Trend analysis widget for insights.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/quorum/trend-analysis-widget",
      exportName: "TrendAnalysisWidget",
    },
    componentDependencies: ["card", "chart"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: false, recommended: "quorum" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT BLOCKS (4 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "AuditTrailViewer",
    slug: "audit-trail-viewer",
    category: "audit",
    description: "Audit trail viewer for compliance.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/audit/audit-trail-viewer",
      exportName: "AuditTrailViewer",
    },
    componentDependencies: ["table", "card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "DangerZoneIndicator",
    slug: "danger-zone-indicator",
    category: "audit",
    description: "Danger zone indicator for critical actions.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/audit/danger-zone-indicator",
      exportName: "DangerZoneIndicator",
    },
    componentDependencies: ["alert", "button"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "PolicyOverrideRecord",
    slug: "policy-override-record",
    category: "audit",
    description: "Policy override record for tracking.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/audit/policy-override-record",
      exportName: "PolicyOverrideRecord",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },
  {
    $schema: "axis://block/v1",
    name: "RiskScoreDisplay",
    slug: "risk-score-display",
    category: "audit",
    description: "Risk score display for compliance.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/audit/risk-score-display",
      exportName: "RiskScoreDisplay",
    },
    componentDependencies: ["card", "badge"],
    blockDependencies: [],
    persona: { quorum: false, cobalt: true, recommended: "cobalt" },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRID & INPUT BLOCKS (2 total)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    $schema: "axis://block/v1",
    name: "BentoGrid01",
    slug: "bento-grid-01",
    category: "grid",
    description: "Bento grid layout.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/grids/bento-grid-01",
      exportName: "BentoGrid01",
    },
    componentDependencies: ["card"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
  },
  {
    $schema: "axis://block/v1",
    name: "Combobox01",
    slug: "combobox-01",
    category: "input",
    description: "Combobox input pattern.",
    source: {
      package: "@workspace/design-system",
      path: "blocks/inputs/combobox-01",
      exportName: "Combobox01",
    },
    componentDependencies: ["combobox", "popover"],
    blockDependencies: [],
    persona: { quorum: true, cobalt: true, recommended: "both" },
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
