-- Phase 10: Foreign Key Integration Migration
-- Date: 2026-01-23
-- Purpose: Link sales/purchase orders to customer/vendor entities

-- =====================================================
-- Part 1: Add customer_id FK to sales tables
-- =====================================================

-- Add customer_id column to sales_orders
ALTER TABLE sales_orders 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT;

-- Create index for customer_id lookups
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);

-- Add customer_id column to sales_invoices
ALTER TABLE sales_invoices 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT;

-- Create index for customer_id lookups
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_id ON sales_invoices(customer_id);

-- =====================================================
-- Part 2: Add vendor FK constraint to purchase tables
-- =====================================================

-- Vendor_id column already exists in purchase_orders, just add FK constraint
-- First, ensure existing vendor_id values are NULL or valid
-- (In production with data, you'd migrate data first)

-- Add FK constraint to existing vendor_id column
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS purchase_orders_vendor_id_fkey,
  ADD CONSTRAINT purchase_orders_vendor_id_fkey 
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;

-- Create index for vendor_id lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);

-- Add vendor_id column to purchase_bills
ALTER TABLE purchase_bills 
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT;

-- Create index for vendor_id lookups
CREATE INDEX IF NOT EXISTS idx_purchase_bills_vendor_id ON purchase_bills(vendor_id);

-- =====================================================
-- Summary
-- =====================================================
-- Columns added: 3 (customer_id to sales_orders, sales_invoices; vendor_id to purchase_bills)
-- FK constraints: 4 (all with ON DELETE RESTRICT for data protection)
-- Indexes: 4 (for efficient lookups)
-- Migration strategy: Additive only (preserves existing customerName/vendorName columns)
-- Backward compatible: Text fields remain, FKs optional until data migrated
