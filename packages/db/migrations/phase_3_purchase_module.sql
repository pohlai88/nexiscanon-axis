-- Phase 3: Purchase Module Migration
-- Date: 2026-01-23
-- Tables: purchase_requests, purchase_orders, purchase_bills
-- Pattern: Mirrors sales module structure

-- ============================================================================
-- TABLE 1: purchase_requests (Internal purchase requests awaiting approval)
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Request details
  request_number TEXT NOT NULL,
  request_date TIMESTAMPTZ NOT NULL,
  
  -- Status workflow: draft | submitted | approved | rejected | converted
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Requester
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  
  -- Vendor (optional at request stage)
  vendor_id UUID, -- FK to vendors table (when implemented)
  vendor_name TEXT,
  
  -- Financial details
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(15, 4) NOT NULL,
  tax_total DECIMAL(15, 4) NOT NULL,
  total_amount DECIMAL(15, 4) NOT NULL,
  
  -- Line items (JSONB)
  line_items JSONB NOT NULL,
  
  -- Additional details
  justification TEXT,
  approval_notes TEXT,
  
  -- Conversion tracking
  converted_to_po_id UUID, -- FK to purchase_orders
  converted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Audit fields (F01 LAW F01-02)
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (F01 LAW F01-04)
CREATE INDEX IF NOT EXISTS idx_purchase_requests_tenant_id ON purchase_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester_id ON purchase_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_request_date ON purchase_requests(request_date);

-- Unique constraint: request_number per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_requests_tenant_number 
  ON purchase_requests(tenant_id, request_number);

-- ============================================================================
-- TABLE 2: purchase_orders (Confirmed purchase orders sent to vendors)
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- PO details
  po_number TEXT NOT NULL,
  po_date TIMESTAMPTZ NOT NULL,
  expected_delivery_date TIMESTAMPTZ,
  
  -- Status workflow: pending | sent | acknowledged | received | invoiced | cancelled
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Vendor
  vendor_id UUID, -- FK to vendors table (when implemented)
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  
  -- Link to purchase request
  request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
  
  -- Financial details
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(15, 4) NOT NULL,
  tax_total DECIMAL(15, 4) NOT NULL,
  total_amount DECIMAL(15, 4) NOT NULL,
  
  -- Line items (JSONB)
  line_items JSONB NOT NULL,
  
  -- Delivery details
  delivery_address JSONB,
  
  -- Additional details
  payment_terms TEXT,
  notes TEXT,
  
  -- Conversion tracking
  bill_id UUID, -- FK to purchase_bills
  received_at TIMESTAMPTZ,
  invoiced_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Audit fields (F01 LAW F01-02)
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (F01 LAW F01-04)
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_request_id ON purchase_orders(request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_date ON purchase_orders(po_date);

-- Unique constraint: po_number per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_orders_tenant_number 
  ON purchase_orders(tenant_id, po_number);

-- ============================================================================
-- TABLE 3: purchase_bills (Vendor bills with AP posting integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchase_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Bill details
  bill_number TEXT NOT NULL,
  bill_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  
  -- Status workflow: draft | received | approved | posted | paid | cancelled
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Vendor
  vendor_id UUID, -- FK to vendors table (when implemented)
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  
  -- Link to purchase order
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  
  -- Financial details
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(15, 4) NOT NULL,
  tax_total DECIMAL(15, 4) NOT NULL,
  total_amount DECIMAL(15, 4) NOT NULL,
  amount_paid DECIMAL(15, 4) NOT NULL DEFAULT 0,
  amount_due DECIMAL(15, 4) NOT NULL,
  
  -- Line items (JSONB) with account_code for posting
  line_items JSONB NOT NULL,
  
  -- Additional details
  payment_terms TEXT,
  notes TEXT,
  
  -- B01 POSTING SPINE INTEGRATION
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  posted_at TIMESTAMPTZ,
  
  -- Payment tracking
  last_payment_date TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Audit fields (F01 LAW F01-02)
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  modified_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (F01 LAW F01-04)
CREATE INDEX IF NOT EXISTS idx_purchase_bills_tenant_id ON purchase_bills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_bills_status ON purchase_bills(status);
CREATE INDEX IF NOT EXISTS idx_purchase_bills_vendor_id ON purchase_bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_bills_po_id ON purchase_bills(po_id);
CREATE INDEX IF NOT EXISTS idx_purchase_bills_document_id ON purchase_bills(document_id); -- B01 integration
CREATE INDEX IF NOT EXISTS idx_purchase_bills_bill_date ON purchase_bills(bill_date);
CREATE INDEX IF NOT EXISTS idx_purchase_bills_due_date ON purchase_bills(due_date);

-- Unique constraint: bill_number per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_bills_tenant_number 
  ON purchase_bills(tenant_id, bill_number);

-- ============================================================================
-- ADD FOREIGN KEY FOR CONVERSION TRACKING
-- ============================================================================

-- Add FK from purchase_requests.converted_to_po_id to purchase_orders.id
ALTER TABLE purchase_requests 
  DROP CONSTRAINT IF EXISTS fk_purchase_requests_converted_to_po;
ALTER TABLE purchase_requests 
  ADD CONSTRAINT fk_purchase_requests_converted_to_po 
  FOREIGN KEY (converted_to_po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL;

-- Add FK from purchase_orders.bill_id to purchase_bills.id
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS fk_purchase_orders_bill;
ALTER TABLE purchase_orders 
  ADD CONSTRAINT fk_purchase_orders_bill 
  FOREIGN KEY (bill_id) REFERENCES purchase_bills(id) ON DELETE SET NULL;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- Tables created: 3 (purchase_requests, purchase_orders, purchase_bills)
-- Indexes created: 18 (6 + 5 + 7)
-- Unique constraints: 3
-- Foreign keys: 2 cross-references + standard FKs
-- Total production tables after migration: 16 (13 existing + 3 purchase)
