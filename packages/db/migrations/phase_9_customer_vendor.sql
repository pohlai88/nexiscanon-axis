-- Phase 9: Customer & Vendor Management Migration
-- Date: 2026-01-23
-- Purpose: Add customer and vendor entity tables

-- =====================================================
-- Customers Table
-- =====================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Customer details
  customer_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  
  -- Contact information
  contact_info JSONB,
  
  -- Addresses
  billing_address JSONB,
  shipping_address JSONB,
  
  -- Business terms
  payment_terms VARCHAR(50),
  credit_limit VARCHAR(20),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  tax_exempt BOOLEAN NOT NULL DEFAULT false,
  tax_id VARCHAR(50),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Additional details
  notes TEXT,
  tags JSONB DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Audit
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(customer_name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_tenant_number ON customers(tenant_id, customer_number);

-- =====================================================
-- Vendors Table
-- =====================================================

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Vendor details
  vendor_number VARCHAR(50) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  
  -- Contact information
  contact_info JSONB,
  
  -- Addresses
  address JSONB,
  remittance_address JSONB,
  
  -- Business terms
  payment_terms VARCHAR(50),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  tax_id VARCHAR(50),
  
  -- Banking details
  banking_info JSONB,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  
  -- Additional details
  notes TEXT,
  tags JSONB DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Audit
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for vendors
CREATE INDEX IF NOT EXISTS idx_vendors_tenant_id ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(vendor_name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendors_tenant_number ON vendors(tenant_id, vendor_number);

-- =====================================================
-- Summary
-- =====================================================
-- Tables added: 2 (customers, vendors)
-- Indexes added: 8 (4 per table)
-- Foreign keys: Both tables link to tenants and users
-- Business value: Full CRM/VRM capability
