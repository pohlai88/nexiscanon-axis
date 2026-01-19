// packages/validation/src/erp/base/permissions.ts
// ERP Base Permissions - action-scoped permission strings

/**
 * ERP Base Permission Namespace
 *
 * Format: erp.<module>.<entity>.<action>
 *
 * Actions:
 * - create: Create new records
 * - read: View records
 * - update: Modify existing records
 * - archive: Soft delete (set isActive=false)
 * - admin: Full control (for sequences, settings)
 */

// ---- UoM Permissions ----

export const UOM_PERMISSIONS = {
  CREATE: "erp.base.uom.create",
  READ: "erp.base.uom.read",
  UPDATE: "erp.base.uom.update",
  ARCHIVE: "erp.base.uom.archive",
} as const;

export type UomPermission = (typeof UOM_PERMISSIONS)[keyof typeof UOM_PERMISSIONS];

// ---- Sequence Permissions ----

export const SEQUENCE_PERMISSIONS = {
  ADMIN: "erp.base.sequence.admin", // Full sequence management (security-sensitive)
} as const;

export type SequencePermission = (typeof SEQUENCE_PERMISSIONS)[keyof typeof SEQUENCE_PERMISSIONS];

// ---- Partner Permissions ----

export const PARTNER_PERMISSIONS = {
  CREATE: "erp.base.partner.create",
  READ: "erp.base.partner.read",
  UPDATE: "erp.base.partner.update",
  ARCHIVE: "erp.base.partner.archive",
} as const;

export type PartnerPermission = (typeof PARTNER_PERMISSIONS)[keyof typeof PARTNER_PERMISSIONS];

// ---- Product Permissions ----

export const PRODUCT_PERMISSIONS = {
  CREATE: "erp.base.product.create",
  READ: "erp.base.product.read",
  UPDATE: "erp.base.product.update",
  ARCHIVE: "erp.base.product.archive",
} as const;

export type ProductPermission = (typeof PRODUCT_PERMISSIONS)[keyof typeof PRODUCT_PERMISSIONS];

// ---- All ERP Base Permissions ----

export const ERP_BASE_PERMISSIONS = {
  ...UOM_PERMISSIONS,
  ...SEQUENCE_PERMISSIONS,
  ...PARTNER_PERMISSIONS,
  ...PRODUCT_PERMISSIONS,
} as const;

export type ErpBasePermission = (typeof ERP_BASE_PERMISSIONS)[keyof typeof ERP_BASE_PERMISSIONS];

// ---- Permission Descriptions (for UI/docs) ----

export const ERP_BASE_PERMISSION_DESCRIPTIONS: Record<ErpBasePermission, string> = {
  // UoM
  [UOM_PERMISSIONS.CREATE]: "Create units of measure",
  [UOM_PERMISSIONS.READ]: "View units of measure",
  [UOM_PERMISSIONS.UPDATE]: "Modify units of measure",
  [UOM_PERMISSIONS.ARCHIVE]: "Archive units of measure",

  // Sequence
  [SEQUENCE_PERMISSIONS.ADMIN]: "Manage document sequences (admin only)",

  // Partner
  [PARTNER_PERMISSIONS.CREATE]: "Create partners (customers/vendors)",
  [PARTNER_PERMISSIONS.READ]: "View partners",
  [PARTNER_PERMISSIONS.UPDATE]: "Modify partners",
  [PARTNER_PERMISSIONS.ARCHIVE]: "Archive partners",

  // Product
  [PRODUCT_PERMISSIONS.CREATE]: "Create products",
  [PRODUCT_PERMISSIONS.READ]: "View products",
  [PRODUCT_PERMISSIONS.UPDATE]: "Modify products",
  [PRODUCT_PERMISSIONS.ARCHIVE]: "Archive products",
};
