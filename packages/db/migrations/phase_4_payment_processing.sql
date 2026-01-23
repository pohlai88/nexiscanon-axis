-- Phase 4: Payment Processing Migration
-- Date: 2026-01-23
-- Tables: customer_payments, vendor_payments
-- Purpose: Complete cash flow cycle (AR collection + AP disbursement)

-- ============================================================================
-- TABLE 1: customer_payments (Payments received from customers - AR collection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_number TEXT NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  
  -- Customer
  customer_id UUID, -- FK to customers table (when implemented)
  customer_name TEXT NOT NULL,
  
  -- Payment method: cash | check | wire | card | ach
  payment_method TEXT NOT NULL,
  reference_number TEXT, -- Check #, transaction ID, etc.
  
  -- Financial details
  amount DECIMAL(15, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unapplied_amount DECIMAL(15, 4) NOT NULL,
  
  -- Bank account
  bank_account_id UUID, -- FK to bank_accounts (when implemented)
  
  -- Invoice linkage (optional)
  invoice_id UUID REFERENCES sales_invoices(id) ON DELETE SET NULL,
  
  -- Status workflow: pending | cleared | reconciled | void
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Additional details
  notes TEXT,
  
  -- B01 POSTING SPINE INTEGRATION
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata TEXT NOT NULL DEFAULT '{}',
  
  -- Audit fields (F01 LAW F01-02)
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (F01 LAW F01-04)
CREATE INDEX IF NOT EXISTS idx_customer_payments_tenant_id ON customer_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_invoice_id ON customer_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_bank_account_id ON customer_payments(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_document_id ON customer_payments(document_id); -- B01 integration
CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_date ON customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_status ON customer_payments(status);

-- Unique constraint: payment_number per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_payments_tenant_number 
  ON customer_payments(tenant_id, payment_number);

-- ============================================================================
-- TABLE 2: vendor_payments (Payments made to vendors - AP disbursement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_number TEXT NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  
  -- Vendor
  vendor_id UUID, -- FK to vendors table (when implemented)
  vendor_name TEXT NOT NULL,
  
  -- Payment method: cash | check | wire | card | ach
  payment_method TEXT NOT NULL,
  reference_number TEXT, -- Check #, transaction ID, etc.
  
  -- Financial details
  amount DECIMAL(15, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unapplied_amount DECIMAL(15, 4) NOT NULL,
  
  -- Bank account
  bank_account_id UUID, -- FK to bank_accounts (when implemented)
  
  -- Bill linkage (optional)
  bill_id UUID REFERENCES purchase_bills(id) ON DELETE SET NULL,
  
  -- Status workflow: pending | cleared | reconciled | void
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Additional details
  notes TEXT,
  
  -- B01 POSTING SPINE INTEGRATION
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata TEXT NOT NULL DEFAULT '{}',
  
  -- Audit fields (F01 LAW F01-02)
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (F01 LAW F01-04)
CREATE INDEX IF NOT EXISTS idx_vendor_payments_tenant_id ON vendor_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_bill_id ON vendor_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_bank_account_id ON vendor_payments(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_document_id ON vendor_payments(document_id); -- B01 integration
CREATE INDEX IF NOT EXISTS idx_vendor_payments_payment_date ON vendor_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_status ON vendor_payments(status);

-- Unique constraint: payment_number per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendor_payments_tenant_number 
  ON vendor_payments(tenant_id, payment_number);

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- Tables created: 2 (customer_payments, vendor_payments)
-- Indexes created: 14 (7 + 7)
-- Unique constraints: 2
-- Foreign keys: invoice_id, bill_id, documents (B01 integration)
-- Total production tables after migration: 18 (16 existing + 2 payment)
