-- Phase 8: Multi-Line Items Migration
-- Date: 2026-01-23
-- Purpose: Add line item tables for multi-product orders

-- =====================================================
-- Purchase Order Lines Table
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Parent order
  order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  
  -- Line details
  line_number INTEGER NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  description VARCHAR(500) NOT NULL,
  
  -- Quantities
  quantity_ordered DECIMAL(15,4) NOT NULL,
  quantity_received DECIMAL(15,4) NOT NULL DEFAULT 0,
  unit_of_measure VARCHAR(10) NOT NULL DEFAULT 'EA',
  
  -- Pricing
  unit_price DECIMAL(15,4) NOT NULL,
  line_subtotal DECIMAL(15,4) NOT NULL,
  tax_rate DECIMAL(5,4),
  tax_amount DECIMAL(15,4),
  line_total DECIMAL(15,4) NOT NULL,
  
  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Metadata
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT chk_po_line_quantity_ordered CHECK (quantity_ordered > 0),
  CONSTRAINT chk_po_line_quantity_received CHECK (quantity_received >= 0),
  CONSTRAINT chk_po_line_quantities CHECK (quantity_received <= quantity_ordered)
);

-- Indexes for purchase_order_lines
CREATE INDEX IF NOT EXISTS idx_po_lines_tenant_id ON purchase_order_lines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_order_id ON purchase_order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_product_id ON purchase_order_lines(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_po_lines_order_line_number ON purchase_order_lines(order_id, line_number);

-- =====================================================
-- Sales Order Lines Table
-- =====================================================

CREATE TABLE IF NOT EXISTS sales_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Parent order
  order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  
  -- Line details
  line_number INTEGER NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  description VARCHAR(500) NOT NULL,
  
  -- Quantities
  quantity_ordered DECIMAL(15,4) NOT NULL,
  quantity_fulfilled DECIMAL(15,4) NOT NULL DEFAULT 0,
  quantity_invoiced DECIMAL(15,4) NOT NULL DEFAULT 0,
  unit_of_measure VARCHAR(10) NOT NULL DEFAULT 'EA',
  
  -- Pricing
  unit_price DECIMAL(15,4) NOT NULL,
  line_subtotal DECIMAL(15,4) NOT NULL,
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(15,4),
  tax_rate DECIMAL(5,4),
  tax_amount DECIMAL(15,4),
  line_total DECIMAL(15,4) NOT NULL,
  
  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Metadata
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT chk_so_line_quantity_ordered CHECK (quantity_ordered > 0),
  CONSTRAINT chk_so_line_quantity_fulfilled CHECK (quantity_fulfilled >= 0),
  CONSTRAINT chk_so_line_quantity_invoiced CHECK (quantity_invoiced >= 0),
  CONSTRAINT chk_so_line_quantities CHECK (
    quantity_fulfilled <= quantity_ordered AND
    quantity_invoiced <= quantity_fulfilled
  )
);

-- Indexes for sales_order_lines
CREATE INDEX IF NOT EXISTS idx_so_lines_tenant_id ON sales_order_lines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_so_lines_order_id ON sales_order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_so_lines_product_id ON sales_order_lines(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_so_lines_order_line_number ON sales_order_lines(order_id, line_number);

-- =====================================================
-- Invoice Lines Table
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Parent invoice
  invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
  
  -- Line details
  line_number INTEGER NOT NULL,
  order_line_id UUID REFERENCES sales_order_lines(id),
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  description VARCHAR(500) NOT NULL,
  
  -- Quantities
  quantity DECIMAL(15,4) NOT NULL,
  unit_of_measure VARCHAR(10) NOT NULL DEFAULT 'EA',
  
  -- Pricing
  unit_price DECIMAL(15,4) NOT NULL,
  line_subtotal DECIMAL(15,4) NOT NULL,
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(15,4),
  tax_rate DECIMAL(5,4),
  tax_amount DECIMAL(15,4),
  line_total DECIMAL(15,4) NOT NULL,
  
  -- COGS tracking
  unit_cost DECIMAL(15,4), -- From inventory movement
  line_cogs DECIMAL(15,4), -- quantity * unit_cost
  
  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT chk_invoice_line_quantity CHECK (quantity > 0)
);

-- Indexes for invoice_lines
CREATE INDEX IF NOT EXISTS idx_invoice_lines_tenant_id ON invoice_lines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_order_line_id ON invoice_lines(order_line_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_product_id ON invoice_lines(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoice_lines_invoice_line_number ON invoice_lines(invoice_id, line_number);

-- =====================================================
-- Summary
-- =====================================================
-- Tables added: 3 (purchase_order_lines, sales_order_lines, invoice_lines)
-- Indexes added: 12 (4 per table)
-- Constraints added: Multiple CHECK constraints for data integrity
-- Foreign keys: All line tables link to parent documents and products
