/**
 * Vendor Service
 * 
 * CRUD operations for vendor master data.
 * Supports full VRM (Vendor Relationship Management) capabilities.
 */

import { eq, and, sql, desc, like, or } from "drizzle-orm";
import type { Database } from "../client/neon";
import { vendors, type Vendor, type VendorContactInfo, type VendorAddress } from "../schema/vendor";

/**
 * Input for creating a vendor.
 */
export interface CreateVendorInput {
  tenantId: string;
  vendorNumber: string;
  vendorName: string;
  displayName?: string;
  contactInfo?: VendorContactInfo;
  address?: VendorAddress;
  remittanceAddress?: VendorAddress;
  paymentTerms?: string;
  currency?: string;
  taxId?: string;
  bankingInfo?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
  };
  isPreferred?: boolean;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Input for updating a vendor.
 */
export interface UpdateVendorInput {
  vendorId: string;
  vendorName?: string;
  displayName?: string;
  contactInfo?: VendorContactInfo;
  address?: VendorAddress;
  remittanceAddress?: VendorAddress;
  paymentTerms?: string;
  taxId?: string;
  bankingInfo?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
  };
  isPreferred?: boolean;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a new vendor.
 */
export async function createVendor(
  db: Database,
  input: CreateVendorInput
): Promise<Vendor> {
  const [vendor] = await db
    .insert(vendors)
    .values({
      tenantId: input.tenantId,
      vendorNumber: input.vendorNumber,
      vendorName: input.vendorName,
      displayName: input.displayName,
      contactInfo: input.contactInfo,
      address: input.address,
      remittanceAddress: input.remittanceAddress,
      paymentTerms: input.paymentTerms,
      currency: input.currency || "USD",
      taxId: input.taxId,
      bankingInfo: input.bankingInfo,
      isPreferred: input.isPreferred ?? false,
      notes: input.notes,
      tags: input.tags || [],
      metadata: input.metadata || {},
      status: "active",
      isActive: true,
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!vendor) {
    throw new Error("Failed to create vendor");
  }

  return vendor;
}

/**
 * Update an existing vendor.
 */
export async function updateVendor(
  db: Database,
  input: UpdateVendorInput
): Promise<Vendor> {
  const [vendor] = await db
    .update(vendors)
    .set({
      vendorName: input.vendorName,
      displayName: input.displayName,
      contactInfo: input.contactInfo,
      address: input.address,
      remittanceAddress: input.remittanceAddress,
      paymentTerms: input.paymentTerms,
      taxId: input.taxId,
      bankingInfo: input.bankingInfo,
      isPreferred: input.isPreferred,
      notes: input.notes,
      tags: input.tags,
      metadata: input.metadata,
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(vendors.id, input.vendorId))
    .returning();

  if (!vendor) {
    throw new Error(`Vendor not found: ${input.vendorId}`);
  }

  return vendor;
}

/**
 * Get vendor by ID.
 */
export async function getVendorById(
  db: Database,
  vendorId: string
): Promise<Vendor | undefined> {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1);

  return vendor;
}

/**
 * Get vendor by number (unique per tenant).
 */
export async function getVendorByNumber(
  db: Database,
  tenantId: string,
  vendorNumber: string
): Promise<Vendor | undefined> {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.tenantId, tenantId),
        eq(vendors.vendorNumber, vendorNumber)
      )
    )
    .limit(1);

  return vendor;
}

/**
 * Get all vendors for a tenant.
 */
export async function getVendorsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    status?: "active" | "inactive" | "suspended";
    preferredOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<Vendor[]> {
  let query = db
    .select()
    .from(vendors)
    .where(eq(vendors.tenantId, tenantId))
    .$dynamic();

  if (options?.status) {
    query = query.where(eq(vendors.status, options.status));
  }

  if (options?.preferredOnly) {
    query = query.where(eq(vendors.isPreferred, true));
  }

  query = query.orderBy(desc(vendors.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return await query;
}

/**
 * Search vendors by name or email.
 */
export async function searchVendors(
  db: Database,
  tenantId: string,
  searchTerm: string,
  options?: {
    limit?: number;
  }
): Promise<Vendor[]> {
  const pattern = `%${searchTerm}%`;

  let query = db
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.tenantId, tenantId),
        or(
          like(vendors.vendorName, pattern),
          like(vendors.displayName, pattern),
          sql`${vendors.contactInfo}->>'email' ILIKE ${pattern}`
        )
      )
    )
    .orderBy(vendors.vendorName)
    .$dynamic();

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return await query;
}

/**
 * Get preferred vendors for a tenant.
 */
export async function getPreferredVendors(
  db: Database,
  tenantId: string
): Promise<Vendor[]> {
  return await getVendorsByTenant(db, tenantId, { 
    status: "active",
    preferredOnly: true 
  });
}

/**
 * Update vendor status.
 */
export async function updateVendorStatus(
  db: Database,
  vendorId: string,
  status: "active" | "inactive" | "suspended",
  userId: string
): Promise<Vendor> {
  const [vendor] = await db
    .update(vendors)
    .set({
      status,
      isActive: status === "active",
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(vendors.id, vendorId))
    .returning();

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  return vendor;
}

/**
 * Toggle preferred vendor status.
 */
export async function togglePreferredVendor(
  db: Database,
  vendorId: string,
  userId: string
): Promise<Vendor> {
  const vendor = await getVendorById(db, vendorId);

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  const [updated] = await db
    .update(vendors)
    .set({
      isPreferred: !vendor.isPreferred,
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(vendors.id, vendorId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to update vendor: ${vendorId}`);
  }

  return updated;
}

/**
 * Get vendors with outstanding balances (placeholder for future enhancement).
 */
export async function getVendorsWithBalance(
  db: Database,
  tenantId: string
): Promise<Vendor[]> {
  // TODO: Join with bills and payments to calculate actual balances
  // For now, return all active vendors
  return await getVendorsByTenant(db, tenantId, { status: "active" });
}

/**
 * Delete a vendor (soft delete by setting inactive).
 */
export async function deactivateVendor(
  db: Database,
  vendorId: string,
  userId: string
): Promise<Vendor> {
  return await updateVendorStatus(db, vendorId, "inactive", userId);
}

/**
 * Count vendors by tenant.
 */
export async function countVendors(
  db: Database,
  tenantId: string,
  status?: "active" | "inactive" | "suspended"
): Promise<number> {
  let query = db
    .select({ count: sql<number>`count(*)::int` })
    .from(vendors)
    .where(eq(vendors.tenantId, tenantId))
    .$dynamic();

  if (status) {
    query = query.where(eq(vendors.status, status));
  }

  const [result] = await query;
  return result?.count ?? 0;
}

/**
 * Get vendor by tags.
 */
export async function getVendorsByTag(
  db: Database,
  tenantId: string,
  tag: string
): Promise<Vendor[]> {
  return await db
    .select()
    .from(vendors)
    .where(
      and(
        eq(vendors.tenantId, tenantId),
        sql`${vendors.tags} @> ${JSON.stringify([tag])}::jsonb`
      )
    )
    .orderBy(vendors.vendorName);
}
