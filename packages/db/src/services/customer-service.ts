/**
 * Customer Service
 * 
 * CRUD operations for customer master data.
 * Supports full CRM capabilities.
 */

import { eq, and, sql, desc, like, or } from "drizzle-orm";
import type { Database } from "../client/neon";
import { customers, type Customer, type ContactInfo, type Address } from "../schema/customer";

/**
 * Input for creating a customer.
 */
export interface CreateCustomerInput {
  tenantId: string;
  customerNumber: string;
  customerName: string;
  displayName?: string;
  contactInfo?: ContactInfo;
  billingAddress?: Address;
  shippingAddress?: Address;
  paymentTerms?: string;
  creditLimit?: string;
  currency?: string;
  taxExempt?: boolean;
  taxId?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Input for updating a customer.
 */
export interface UpdateCustomerInput {
  customerId: string;
  customerName?: string;
  displayName?: string;
  contactInfo?: ContactInfo;
  billingAddress?: Address;
  shippingAddress?: Address;
  paymentTerms?: string;
  creditLimit?: string;
  taxExempt?: boolean;
  taxId?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a new customer.
 */
export async function createCustomer(
  db: Database,
  input: CreateCustomerInput
): Promise<Customer> {
  const [customer] = await db
    .insert(customers)
    .values({
      tenantId: input.tenantId,
      customerNumber: input.customerNumber,
      customerName: input.customerName,
      displayName: input.displayName,
      contactInfo: input.contactInfo,
      billingAddress: input.billingAddress,
      shippingAddress: input.shippingAddress,
      paymentTerms: input.paymentTerms,
      creditLimit: input.creditLimit,
      currency: input.currency || "USD",
      taxExempt: input.taxExempt ?? false,
      taxId: input.taxId,
      notes: input.notes,
      tags: input.tags || [],
      metadata: input.metadata || {},
      status: "active",
      isActive: true,
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!customer) {
    throw new Error("Failed to create customer");
  }

  return customer;
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(
  db: Database,
  input: UpdateCustomerInput
): Promise<Customer> {
  const [customer] = await db
    .update(customers)
    .set({
      customerName: input.customerName,
      displayName: input.displayName,
      contactInfo: input.contactInfo,
      billingAddress: input.billingAddress,
      shippingAddress: input.shippingAddress,
      paymentTerms: input.paymentTerms,
      creditLimit: input.creditLimit,
      taxExempt: input.taxExempt,
      taxId: input.taxId,
      notes: input.notes,
      tags: input.tags,
      metadata: input.metadata,
      modifiedBy: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, input.customerId))
    .returning();

  if (!customer) {
    throw new Error(`Customer not found: ${input.customerId}`);
  }

  return customer;
}

/**
 * Get customer by ID.
 */
export async function getCustomerById(
  db: Database,
  customerId: string
): Promise<Customer | undefined> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  return customer;
}

/**
 * Get customer by number (unique per tenant).
 */
export async function getCustomerByNumber(
  db: Database,
  tenantId: string,
  customerNumber: string
): Promise<Customer | undefined> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        eq(customers.customerNumber, customerNumber)
      )
    )
    .limit(1);

  return customer;
}

/**
 * Get all customers for a tenant.
 */
export async function getCustomersByTenant(
  db: Database,
  tenantId: string,
  options?: {
    status?: "active" | "inactive" | "suspended";
    limit?: number;
    offset?: number;
  }
): Promise<Customer[]> {
  let query = db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId))
    .$dynamic();

  if (options?.status) {
    query = query.where(eq(customers.status, options.status));
  }

  query = query.orderBy(desc(customers.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return await query;
}

/**
 * Search customers by name or email.
 */
export async function searchCustomers(
  db: Database,
  tenantId: string,
  searchTerm: string,
  options?: {
    limit?: number;
  }
): Promise<Customer[]> {
  const pattern = `%${searchTerm}%`;

  let query = db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        or(
          like(customers.customerName, pattern),
          like(customers.displayName, pattern),
          sql`${customers.contactInfo}->>'email' ILIKE ${pattern}`
        )
      )
    )
    .orderBy(customers.customerName)
    .$dynamic();

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return await query;
}

/**
 * Update customer status.
 */
export async function updateCustomerStatus(
  db: Database,
  customerId: string,
  status: "active" | "inactive" | "suspended",
  userId: string
): Promise<Customer> {
  const [customer] = await db
    .update(customers)
    .set({
      status,
      isActive: status === "active",
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId))
    .returning();

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  return customer;
}

/**
 * Check if customer has available credit.
 */
export async function checkCustomerCredit(
  db: Database,
  customerId: string,
  requestedAmount: number
): Promise<{
  hasCredit: boolean;
  creditLimit: number | null;
  availableCredit: number | null;
}> {
  const customer = await getCustomerById(db, customerId);

  if (!customer) {
    throw new Error(`Customer not found: ${customerId}`);
  }

  if (!customer.creditLimit) {
    return {
      hasCredit: true, // No limit = unlimited credit
      creditLimit: null,
      availableCredit: null,
    };
  }

  const creditLimit = parseFloat(customer.creditLimit);

  // TODO: Calculate current outstanding balance from invoices/payments
  // For now, simplified check against limit
  const currentBalance = 0; // Placeholder
  const availableCredit = creditLimit - currentBalance;

  return {
    hasCredit: availableCredit >= requestedAmount,
    creditLimit,
    availableCredit,
  };
}

/**
 * Get customers with outstanding balances (placeholder for future enhancement).
 */
export async function getCustomersWithBalance(
  db: Database,
  tenantId: string
): Promise<Customer[]> {
  // TODO: Join with invoices and payments to calculate actual balances
  // For now, return all active customers
  return await getCustomersByTenant(db, tenantId, { status: "active" });
}

/**
 * Delete a customer (soft delete by setting inactive).
 */
export async function deactivateCustomer(
  db: Database,
  customerId: string,
  userId: string
): Promise<Customer> {
  return await updateCustomerStatus(db, customerId, "inactive", userId);
}

/**
 * Count customers by tenant.
 */
export async function countCustomers(
  db: Database,
  tenantId: string,
  status?: "active" | "inactive" | "suspended"
): Promise<number> {
  let query = db
    .select({ count: sql<number>`count(*)::int` })
    .from(customers)
    .where(eq(customers.tenantId, tenantId))
    .$dynamic();

  if (status) {
    query = query.where(eq(customers.status, status));
  }

  const [result] = await query;
  return result?.count ?? 0;
}
