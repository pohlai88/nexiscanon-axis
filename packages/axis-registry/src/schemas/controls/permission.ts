/**
 * Permission Schema (B08)
 *
 * Atomic action definitions.
 */

import { z } from "zod";
import { PERMISSION_DOMAIN, PERMISSION_ACTION, PERMISSION_SCOPE } from "./constants";

// ============================================================================
// Permission Schema
// ============================================================================

export const permissionSchema = z.object({
  id: z.uuid(),

  // Identity
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),

  // Classification
  domain: z.enum(PERMISSION_DOMAIN),
  resource: z.string().min(1).max(50),
  action: z.enum(PERMISSION_ACTION),

  // Scope
  defaultScope: z.enum(PERMISSION_SCOPE).default("own"),

  // System flag
  isSystem: z.boolean().default(false),

  createdAt: z.string().datetime(),
});

export type Permission = z.infer<typeof permissionSchema>;

// ============================================================================
// Common Permission Codes
// ============================================================================

export const PERMISSION_CODES = {
  // Sales
  SALES_ORDER_CREATE: "sales.order.create",
  SALES_ORDER_APPROVE: "sales.order.approve",
  SALES_INVOICE_POST: "sales.invoice.post",
  SALES_INVOICE_VOID: "sales.invoice.void",

  // Purchase
  PURCHASE_PO_CREATE: "purchase.po.create",
  PURCHASE_PO_APPROVE: "purchase.po.approve",
  PURCHASE_BILL_POST: "purchase.bill.post",

  // Inventory
  INVENTORY_ADJUST: "inventory.adjustment.create",
  INVENTORY_TRANSFER: "inventory.transfer.create",
  INVENTORY_COUNT: "inventory.count.create",

  // Accounting
  ACCOUNTING_JOURNAL_CREATE: "accounting.journal.create",
  ACCOUNTING_JOURNAL_POST: "accounting.journal.post",
  ACCOUNTING_PERIOD_CLOSE: "accounting.period.close",

  // Controls
  CONTROLS_ROLE_MANAGE: "controls.role.configure",
  CONTROLS_POLICY_MANAGE: "controls.policy.configure",
  CONTROLS_OVERRIDE: "controls.dangerzone.override",
} as const;
