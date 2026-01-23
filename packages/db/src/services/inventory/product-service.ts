/**
 * Product Service (Inventory Module)
 * 
 * Product catalog management.
 */

import { eq, and, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { products, type Product } from "../../schema/inventory/product";

/**
 * Create product input.
 */
export interface CreateProductInput {
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  productType: string; // 'inventory' | 'service' | 'non-inventory'
  category?: string;
  isTracked?: boolean;
  defaultUnitCost?: number;
  defaultUnitPrice?: number;
  currency?: string;
  assetAccountId?: string; // Inventory Asset account
  cogsAccountId?: string; // Cost of Goods Sold account
  revenueAccountId?: string; // Revenue account
  metadata?: Record<string, unknown>;
  userId: string;
}

/**
 * Create a product.
 */
export async function createProduct(
  db: Database,
  input: CreateProductInput
): Promise<Product> {
  const [product] = await db
    .insert(products)
    .values({
      tenantId: input.tenantId,
      sku: input.sku,
      name: input.name,
      description: input.description,
      productType: input.productType,
      category: input.category,
      isTracked: input.isTracked ?? true,
      trackBySerial: false,
      trackByLot: false,
      defaultUnitCost: input.defaultUnitCost?.toFixed(4),
      defaultUnitPrice: input.defaultUnitPrice?.toFixed(4),
      currency: input.currency || "USD",
      assetAccountId: input.assetAccountId,
      cogsAccountId: input.cogsAccountId,
      revenueAccountId: input.revenueAccountId,
      isActive: "true",
      metadata: input.metadata || {},
      createdBy: input.userId,
      modifiedBy: input.userId,
    })
    .returning();

  if (!product) {
    throw new Error("Failed to create product");
  }

  return product;
}

/**
 * Update product.
 */
export async function updateProduct(
  db: Database,
  productId: string,
  updates: Partial<CreateProductInput>
): Promise<Product> {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    modifiedBy: updates.userId,
  };

  if (updates.name) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.defaultUnitCost !== undefined)
    updateData.defaultUnitCost = updates.defaultUnitCost.toFixed(4);
  if (updates.defaultUnitPrice !== undefined)
    updateData.defaultUnitPrice = updates.defaultUnitPrice.toFixed(4);
  if (updates.assetAccountId !== undefined)
    updateData.assetAccountId = updates.assetAccountId;
  if (updates.cogsAccountId !== undefined)
    updateData.cogsAccountId = updates.cogsAccountId;
  if (updates.revenueAccountId !== undefined)
    updateData.revenueAccountId = updates.revenueAccountId;
  if (updates.metadata !== undefined)
    updateData.metadata = updates.metadata;

  const [product] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, productId))
    .returning();

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  return product;
}

/**
 * Get product by ID.
 */
export async function getProductById(
  db: Database,
  productId: string
): Promise<Product | null> {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return product || null;
}

/**
 * Get product by SKU.
 */
export async function getProductBySku(
  db: Database,
  tenantId: string,
  sku: string
): Promise<Product | null> {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.sku, sku)))
    .limit(1);

  return product || null;
}

/**
 * Get products by tenant.
 */
export async function getProductsByTenant(
  db: Database,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    productType?: string;
    activeOnly?: boolean;
  }
): Promise<Product[]> {
  const conditions = [eq(products.tenantId, tenantId)];

  if (options?.productType) {
    conditions.push(eq(products.productType, options.productType));
  }

  if (options?.activeOnly) {
    conditions.push(eq(products.isActive, "true"));
  }

  const query = db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);

  return await query;
}

/**
 * Deactivate product (soft delete).
 */
export async function deactivateProduct(
  db: Database,
  productId: string,
  userId: string
): Promise<Product> {
  const [product] = await db
    .update(products)
    .set({
      isActive: "false",
      modifiedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  return product;
}
