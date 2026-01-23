-- Phase 6: Inventory Management Migration
-- Date: 2026-01-23
-- Tables: products, inventory_movements, stock_levels

-- ============================================================================
-- Table 1: products (Product Catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tenant
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Product Identity
  sku varchar(100) NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  
  -- Classification
  product_type varchar(50) NOT NULL, -- 'inventory' | 'service' | 'non-inventory'
  category varchar(100),
  
  -- Inventory Control
  is_tracked boolean NOT NULL DEFAULT true,
  track_by_serial boolean NOT NULL DEFAULT false,
  track_by_lot boolean NOT NULL DEFAULT false,
  
  -- Pricing
  default_unit_cost numeric(19,4),
  default_unit_price numeric(19,4),
  currency varchar(3) DEFAULT 'USD',
  
  -- Accounting (GL account links)
  asset_account_id uuid REFERENCES accounts(id), -- Inventory Asset
  cogs_account_id uuid REFERENCES accounts(id),  -- Cost of Goods Sold
  revenue_account_id uuid REFERENCES accounts(id), -- Revenue
  
  -- Status
  is_active varchar(10) NOT NULL DEFAULT 'true',
  
  -- Metadata
  metadata jsonb DEFAULT '{}' NOT NULL,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id),
  modified_by uuid NOT NULL REFERENCES users(id)
);

-- Unique constraint: tenant + SKU
CREATE UNIQUE INDEX IF NOT EXISTS products_tenant_sku_unique 
  ON products(tenant_id, sku);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(tenant_id, product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(tenant_id, is_active);

-- ============================================================================
-- Table 2: inventory_movements (Stock Movements)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_movements (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tenant
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Movement Identity
  movement_number varchar(100) NOT NULL,
  movement_date timestamptz NOT NULL,
  movement_type varchar(50) NOT NULL, -- 'receipt' | 'issue' | 'adjustment' | 'transfer'
  
  -- Product
  product_id uuid NOT NULL REFERENCES products(id),
  
  -- Quantity
  quantity numeric(19,4) NOT NULL,
  unit_of_measure varchar(50) DEFAULT 'EA',
  
  -- Costing
  unit_cost numeric(19,4),
  total_cost numeric(19,4),
  currency varchar(3) DEFAULT 'USD',
  
  -- Location (optional for future)
  location_id uuid,
  
  -- Document Linkage (B01 integration)
  document_id uuid REFERENCES documents(id), -- Link to posting spine
  source_document_type varchar(50), -- 'purchase_order' | 'sales_order' | 'adjustment'
  source_document_id uuid,
  
  -- Status
  status varchar(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'posted' | 'void'
  posted_at timestamptz,
  
  -- Reason
  reason varchar(255),
  notes text,
  
  -- Metadata
  metadata jsonb DEFAULT '{}' NOT NULL,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id),
  modified_by uuid NOT NULL REFERENCES users(id),
  
  -- Check constraint: quantity validation based on movement type
  CONSTRAINT inventory_movements_quantity_check CHECK (
    (movement_type = 'receipt' AND quantity > 0) OR
    (movement_type = 'issue' AND quantity > 0) OR
    (movement_type = 'adjustment') OR
    (movement_type = 'transfer' AND quantity > 0)
  )
);

-- Unique constraint: tenant + movement number
CREATE UNIQUE INDEX IF NOT EXISTS inventory_movements_tenant_number_unique 
  ON inventory_movements(tenant_id, movement_number);

-- Indexes for inventory_movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant ON inventory_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(tenant_id, movement_date);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(tenant_id, movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_status ON inventory_movements(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_document ON inventory_movements(document_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_source ON inventory_movements(source_document_id);

-- ============================================================================
-- Table 3: stock_levels (Current Inventory Levels)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_levels (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tenant
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Product
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Location (optional for future)
  location_id uuid,
  
  -- Quantities
  quantity_on_hand numeric(19,4) NOT NULL DEFAULT 0,
  quantity_available numeric(19,4) NOT NULL DEFAULT 0, -- on_hand - committed
  quantity_committed numeric(19,4) NOT NULL DEFAULT 0, -- reserved for orders
  
  -- Costing (Weighted Average)
  average_unit_cost numeric(19,4) NOT NULL DEFAULT 0,
  total_value numeric(19,4) NOT NULL DEFAULT 0, -- quantity_on_hand * average_unit_cost
  currency varchar(3) DEFAULT 'USD',
  
  -- Last Activity
  last_movement_date timestamptz,
  last_receipt_date timestamptz,
  last_issue_date timestamptz,
  
  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Check constraint: quantities validation
  CONSTRAINT stock_levels_quantities_check CHECK (
    quantity_on_hand >= 0 AND
    quantity_available >= 0 AND
    quantity_committed >= 0 AND
    quantity_available = quantity_on_hand - quantity_committed
  )
);

-- Unique constraint: tenant + product + location
CREATE UNIQUE INDEX IF NOT EXISTS stock_levels_tenant_product_unique 
  ON stock_levels(tenant_id, product_id, location_id);

-- Indexes for stock_levels
CREATE INDEX IF NOT EXISTS idx_stock_levels_tenant ON stock_levels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_low_stock 
  ON stock_levels(tenant_id, quantity_available) 
  WHERE quantity_available < 10;

-- ============================================================================
-- Migration Complete
-- ============================================================================
