/**
 * AXIS Design System - Zod v4 Contract-First Schemas
 *
 * This module provides schema-driven type generation using Zod v4.
 * All schemas use namespaced IDs (ds.*) to prevent collisions in z.globalRegistry.
 *
 * @see https://zod.dev/metadata - Zod v4 Metadata & Registries
 * @see https://zod.dev/json-schema - Zod v4 JSON Schema conversion
 */

import * as z from "zod";

// =============================================================================
// Global Registry Augmentation
// =============================================================================

declare module "zod" {
  interface GlobalMeta {
    /** Example values for documentation/AI */
    examples?: unknown[];
    /** Mark schema as deprecated */
    deprecated?: boolean;
    /** Associated component name */
    component?: string;
  }
}

// =============================================================================
// Component Variant Schemas
// =============================================================================

/**
 * Button variant schema
 * @namespace ds.button.variant
 */
export const buttonVariantSchema = z
  .enum(["default", "destructive", "outline", "secondary", "ghost", "link"])
  .meta({
    id: "ds.button.variant",
    title: "Button Variant",
    description: "Visual style variant for Button component",
    examples: ["default", "outline", "destructive"],
    component: "Button",
  });

export type ButtonVariant = z.infer<typeof buttonVariantSchema>;

/**
 * Button size schema
 * @namespace ds.button.size
 */
export const buttonSizeSchema = z
  .enum(["default", "sm", "lg", "icon"])
  .meta({
    id: "ds.button.size",
    title: "Button Size",
    description: "Size variant for Button component",
    examples: ["default", "sm", "lg"],
    component: "Button",
  });

export type ButtonSize = z.infer<typeof buttonSizeSchema>;

/**
 * Badge variant schema
 * @namespace ds.badge.variant
 */
export const badgeVariantSchema = z
  .enum(["default", "secondary", "destructive", "outline"])
  .meta({
    id: "ds.badge.variant",
    title: "Badge Variant",
    description: "Visual style variant for Badge component",
    examples: ["default", "secondary"],
    component: "Badge",
  });

export type BadgeVariant = z.infer<typeof badgeVariantSchema>;

/**
 * Alert variant schema
 * @namespace ds.alert.variant
 */
export const alertVariantSchema = z
  .enum(["default", "destructive"])
  .meta({
    id: "ds.alert.variant",
    title: "Alert Variant",
    description: "Visual style variant for Alert component",
    examples: ["default", "destructive"],
    component: "Alert",
  });

export type AlertVariant = z.infer<typeof alertVariantSchema>;

// =============================================================================
// Common Field Schemas
// =============================================================================

/**
 * Email field schema (Zod v4 top-level format)
 * @namespace ds.field.email
 */
export const emailFieldSchema = z.email().meta({
  id: "ds.field.email",
  title: "Email Address",
  description: "Valid email address field",
  examples: ["user@example.com"],
});

export type EmailField = z.infer<typeof emailFieldSchema>;

/**
 * URL field schema (Zod v4 top-level format)
 * @namespace ds.field.url
 */
export const urlFieldSchema = z.url().meta({
  id: "ds.field.url",
  title: "URL",
  description: "Valid URL field",
  examples: ["https://example.com"],
});

export type UrlField = z.infer<typeof urlFieldSchema>;

/**
 * UUID field schema (Zod v4 - stricter RFC compliance)
 * Use z.guid() for more permissive 8-4-4-4-12 hex patterns
 * @namespace ds.field.uuid
 */
export const uuidFieldSchema = z.uuid().meta({
  id: "ds.field.uuid",
  title: "UUID",
  description: "RFC-compliant UUID identifier",
  examples: ["550e8400-e29b-41d4-a716-446655440000"],
});

export type UuidField = z.infer<typeof uuidFieldSchema>;

// =============================================================================
// Schema Index for JSON Schema Generation
// =============================================================================

/**
 * Schema index for JSON Schema generation.
 * z.toJSONSchema() takes a SCHEMA, not the registry.
 *
 * @example
 * ```ts
 * const jsonSchemas = generateJSONSchemas();
 * // { buttonVariant: { type: "string", enum: [...] }, ... }
 * ```
 */
export const schemaIndex = {
  buttonVariant: buttonVariantSchema,
  buttonSize: buttonSizeSchema,
  badgeVariant: badgeVariantSchema,
  alertVariant: alertVariantSchema,
  emailField: emailFieldSchema,
  urlField: urlFieldSchema,
  uuidField: uuidFieldSchema,
} as const;

/**
 * Generate JSON Schemas for all indexed schemas.
 * Uses z.toJSONSchema(schema) per schema (correct Zod v4 pattern).
 *
 * @returns Record of schema name to JSON Schema
 */
export const generateJSONSchemas = () =>
  Object.fromEntries(
    Object.entries(schemaIndex).map(([key, schema]) => [
      key,
      z.toJSONSchema(schema),
    ])
  );

// =============================================================================
// Re-exports
// =============================================================================

export { z };
