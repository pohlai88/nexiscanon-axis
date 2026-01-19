# help011-erp-base-schema-draft.md

**Status:** SUPPORTING (Help)  
**Goal:** Concrete schema definition for `erp.base` module before implementation.

---

## 0) What erp.base Provides

`erp.base` is the foundation module for all ERP modules. It provides:

1. **Partners** - Customers, vendors, or both
2. **Products** - Goods and services
3. **Units of Measure (UoM)** - Quantity units
4. **Sequences** - Document numbering
5. **Currencies** - Currency reference data (optional: could be global)

All other ERP modules depend on `erp.base`.

---

## 1) Partners Table

Partners represent business counterparties (customers, vendors, or both).

### 1.1 SQL Schema

```sql
CREATE TABLE erp_partners (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    -- Business identity
    code TEXT NOT NULL,                    -- e.g., "CUST-000001"
    name TEXT NOT NULL,
    display_name TEXT,                     -- optional trading name
    party_type TEXT NOT NULL CHECK (party_type IN ('CUSTOMER', 'VENDOR', 'BOTH')),
    
    -- Tax/Legal
    tax_id TEXT,                           -- VAT number, EIN, etc.
    company_registry TEXT,                 -- company registration number
    
    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,
    
    -- Address (flattened for v0; normalize later if needed)
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country_code TEXT CHECK (country_code IS NULL OR length(country_code) = 2),
    
    -- Defaults
    default_currency_code TEXT CHECK (default_currency_code IS NULL OR length(default_currency_code) = 3),
    default_payment_terms_days INTEGER CHECK (default_payment_terms_days IS NULL OR default_payment_terms_days >= 0),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES users(id),
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Notes
    internal_notes TEXT,
    
    -- Constraints
    UNIQUE (tenant_id, code)
);

-- Indexes
CREATE INDEX idx_erp_partners_tenant ON erp_partners(tenant_id);
CREATE INDEX idx_erp_partners_tenant_type ON erp_partners(tenant_id, party_type) WHERE is_active = true;
CREATE INDEX idx_erp_partners_tenant_name ON erp_partners(tenant_id, name);
```

### 1.2 Drizzle Schema

```typescript
// packages/db/src/erp/base/partners.ts

import { pgTable, uuid, text, boolean, timestamp, integer, index, unique } from 'drizzle-orm/pg-core';
import { tenants } from '../../schema';
import { users } from '../../schema';

export const erpPartners = pgTable('erp_partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  
  // Business identity
  code: text('code').notNull(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  partyType: text('party_type').notNull(), // CUSTOMER, VENDOR, BOTH
  
  // Tax/Legal
  taxId: text('tax_id'),
  companyRegistry: text('company_registry'),
  
  // Contact
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  
  // Address
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: text('city'),
  stateProvince: text('state_province'),
  postalCode: text('postal_code'),
  countryCode: text('country_code'),
  
  // Defaults
  defaultCurrencyCode: text('default_currency_code'),
  defaultPaymentTermsDays: integer('default_payment_terms_days'),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  version: integer('version').notNull().default(1),
  
  // Notes
  internalNotes: text('internal_notes'),
}, (table) => ({
  tenantIdx: index('idx_erp_partners_tenant').on(table.tenantId),
  uniqueCode: unique('uq_erp_partners_tenant_code').on(table.tenantId, table.code),
}));
```

---

## 2) Products Table

Products represent sellable/purchasable items (goods or services).

### 2.1 SQL Schema

```sql
CREATE TABLE erp_products (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    -- Business identity
    sku TEXT NOT NULL,                     -- stock keeping unit
    name TEXT NOT NULL,
    description TEXT,
    
    -- Classification
    product_type TEXT NOT NULL CHECK (product_type IN ('GOODS', 'SERVICE')) DEFAULT 'GOODS',
    category TEXT,                         -- user-defined category (free text for v0)
    
    -- Pricing
    default_sale_price_cents BIGINT NOT NULL DEFAULT 0 CHECK (default_sale_price_cents >= 0),
    default_purchase_price_cents BIGINT NOT NULL DEFAULT 0 CHECK (default_purchase_price_cents >= 0),
    currency_code TEXT NOT NULL DEFAULT 'USD' CHECK (length(currency_code) = 3),
    
    -- UoM
    default_uom_id UUID REFERENCES erp_uoms(id),
    
    -- Inventory (for GOODS)
    is_stockable BOOLEAN NOT NULL DEFAULT true,      -- false for services
    track_inventory BOOLEAN NOT NULL DEFAULT true,   -- whether to track stock levels
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_sellable BOOLEAN NOT NULL DEFAULT true,
    is_purchasable BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES users(id),
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Notes
    internal_notes TEXT,
    
    -- Constraints
    UNIQUE (tenant_id, sku)
);

-- Indexes
CREATE INDEX idx_erp_products_tenant ON erp_products(tenant_id);
CREATE INDEX idx_erp_products_tenant_active ON erp_products(tenant_id) WHERE is_active = true;
CREATE INDEX idx_erp_products_tenant_category ON erp_products(tenant_id, category);
```

### 2.2 Drizzle Schema

```typescript
// packages/db/src/erp/base/products.ts

import { pgTable, uuid, text, boolean, timestamp, integer, bigint, index, unique } from 'drizzle-orm/pg-core';
import { tenants } from '../../schema';
import { users } from '../../schema';
import { erpUoms } from './uoms';

export const erpProducts = pgTable('erp_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  
  // Business identity
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  
  // Classification
  productType: text('product_type').notNull().default('GOODS'), // GOODS, SERVICE
  category: text('category'),
  
  // Pricing (in cents)
  defaultSalePriceCents: bigint('default_sale_price_cents', { mode: 'number' }).notNull().default(0),
  defaultPurchasePriceCents: bigint('default_purchase_price_cents', { mode: 'number' }).notNull().default(0),
  currencyCode: text('currency_code').notNull().default('USD'),
  
  // UoM
  defaultUomId: uuid('default_uom_id').references(() => erpUoms.id),
  
  // Inventory
  isStockable: boolean('is_stockable').notNull().default(true),
  trackInventory: boolean('track_inventory').notNull().default(true),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  isSellable: boolean('is_sellable').notNull().default(true),
  isPurchasable: boolean('is_purchasable').notNull().default(true),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
  version: integer('version').notNull().default(1),
  
  // Notes
  internalNotes: text('internal_notes'),
}, (table) => ({
  tenantIdx: index('idx_erp_products_tenant').on(table.tenantId),
  uniqueSku: unique('uq_erp_products_tenant_sku').on(table.tenantId, table.sku),
}));
```

---

## 3) Units of Measure (UoM) Table

### 3.1 SQL Schema

```sql
CREATE TABLE erp_uoms (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    -- Definition
    code TEXT NOT NULL,                    -- e.g., "KG", "PCS", "HR"
    name TEXT NOT NULL,                    -- e.g., "Kilogram", "Pieces", "Hour"
    category TEXT NOT NULL,                -- e.g., "weight", "quantity", "time", "length", "volume"
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    UNIQUE (tenant_id, code)
);

-- Indexes
CREATE INDEX idx_erp_uoms_tenant ON erp_uoms(tenant_id);
CREATE INDEX idx_erp_uoms_tenant_category ON erp_uoms(tenant_id, category);
```

### 3.2 Drizzle Schema

```typescript
// packages/db/src/erp/base/uoms.ts

import { pgTable, uuid, text, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { tenants } from '../../schema';

export const erpUoms = pgTable('erp_uoms', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('idx_erp_uoms_tenant').on(table.tenantId),
  uniqueCode: unique('uq_erp_uoms_tenant_code').on(table.tenantId, table.code),
}));
```

### 3.3 Default Seed Data

```typescript
// packages/domain/src/addons/erp.base/seeds/uoms.ts

export const DEFAULT_UOMS = [
  // Quantity
  { code: 'UNIT', name: 'Unit', category: 'quantity' },
  { code: 'PCS', name: 'Pieces', category: 'quantity' },
  { code: 'DOZ', name: 'Dozen', category: 'quantity' },
  
  // Weight
  { code: 'KG', name: 'Kilogram', category: 'weight' },
  { code: 'G', name: 'Gram', category: 'weight' },
  { code: 'LB', name: 'Pound', category: 'weight' },
  { code: 'OZ', name: 'Ounce', category: 'weight' },
  
  // Length
  { code: 'M', name: 'Meter', category: 'length' },
  { code: 'CM', name: 'Centimeter', category: 'length' },
  { code: 'FT', name: 'Foot', category: 'length' },
  { code: 'IN', name: 'Inch', category: 'length' },
  
  // Volume
  { code: 'L', name: 'Liter', category: 'volume' },
  { code: 'ML', name: 'Milliliter', category: 'volume' },
  { code: 'GAL', name: 'Gallon', category: 'volume' },
  
  // Time
  { code: 'HR', name: 'Hour', category: 'time' },
  { code: 'DAY', name: 'Day', category: 'time' },
  { code: 'MIN', name: 'Minute', category: 'time' },
];
```

---

## 4) Sequences Table

### 4.1 SQL Schema

```sql
CREATE TABLE erp_sequences (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    -- Configuration
    sequence_key TEXT NOT NULL,            -- e.g., "SALES_ORDER", "INVOICE"
    prefix TEXT NOT NULL,                  -- e.g., "SO-", "INV-"
    next_value BIGINT NOT NULL DEFAULT 1,
    padding INTEGER NOT NULL DEFAULT 6,    -- number of digits (e.g., 6 = 000001)
    
    -- Yearly reset
    year_reset BOOLEAN NOT NULL DEFAULT true,
    current_year INTEGER,
    
    -- Constraints
    UNIQUE (tenant_id, sequence_key)
);

-- Indexes
CREATE INDEX idx_erp_sequences_tenant ON erp_sequences(tenant_id);
```

### 4.2 Drizzle Schema

```typescript
// packages/db/src/erp/base/sequences.ts

import { pgTable, uuid, text, bigint, integer, boolean, index, unique } from 'drizzle-orm/pg-core';
import { tenants } from '../../schema';

export const erpSequences = pgTable('erp_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  
  sequenceKey: text('sequence_key').notNull(),
  prefix: text('prefix').notNull(),
  nextValue: bigint('next_value', { mode: 'number' }).notNull().default(1),
  padding: integer('padding').notNull().default(6),
  
  yearReset: boolean('year_reset').notNull().default(true),
  currentYear: integer('current_year'),
}, (table) => ({
  tenantIdx: index('idx_erp_sequences_tenant').on(table.tenantId),
  uniqueKey: unique('uq_erp_sequences_tenant_key').on(table.tenantId, table.sequenceKey),
}));
```

### 4.3 Default Seed Data

```typescript
// packages/domain/src/addons/erp.base/seeds/sequences.ts

export const DEFAULT_SEQUENCES = [
  { sequenceKey: 'PARTNER', prefix: 'P-', padding: 6, yearReset: false },
  { sequenceKey: 'PRODUCT', prefix: 'SKU-', padding: 6, yearReset: false },
  { sequenceKey: 'SALES_ORDER', prefix: 'SO-', padding: 6, yearReset: true },
  { sequenceKey: 'PURCHASE_ORDER', prefix: 'PO-', padding: 6, yearReset: true },
  { sequenceKey: 'INVOICE', prefix: 'INV-', padding: 6, yearReset: true },
  { sequenceKey: 'STOCK_MOVE', prefix: 'SM-', padding: 8, yearReset: true },
];
```

### 4.4 Sequence Service

```typescript
// packages/domain/src/addons/erp.base/services/sequence-service.ts

export interface SequenceService {
  getNextDocNo(ctx: TenantContext, sequenceKey: string): Promise<string>;
}

// Implementation uses SQL function or atomic UPDATE ... RETURNING
```

---

## 5) Currencies Table (Optional for v0)

If multi-currency is needed, add a currencies reference table.

### 5.1 SQL Schema

```sql
-- Global table (not tenant-scoped)
CREATE TABLE erp_currencies (
    code TEXT PRIMARY KEY CHECK (length(code) = 3),  -- ISO 4217
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,                             -- e.g., "$", "€", "£"
    decimal_places INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Seed with common currencies
INSERT INTO erp_currencies (code, name, symbol, decimal_places) VALUES
    ('USD', 'US Dollar', '$', 2),
    ('EUR', 'Euro', '€', 2),
    ('GBP', 'British Pound', '£', 2),
    ('JPY', 'Japanese Yen', '¥', 0),
    ('CNY', 'Chinese Yuan', '¥', 2),
    ('CAD', 'Canadian Dollar', 'CA$', 2),
    ('AUD', 'Australian Dollar', 'A$', 2),
    ('INR', 'Indian Rupee', '₹', 2),
    ('SGD', 'Singapore Dollar', 'S$', 2),
    ('MYR', 'Malaysian Ringgit', 'RM', 2);
```

---

## 6) Zod Contracts for erp.base

### 6.1 Partner DTOs

```typescript
// packages/validation/src/erp/base/partner.ts

import { z } from 'zod';

export const PartyType = z.enum(['CUSTOMER', 'VENDOR', 'BOTH']);

export const CreatePartnerInput = z.object({
  code: z.string().min(1).max(50).optional(),  // auto-generated if not provided
  name: z.string().min(1).max(255),
  displayName: z.string().max(255).optional(),
  partyType: PartyType,
  taxId: z.string().max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  stateProvince: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  countryCode: z.string().length(2).optional(),
  defaultCurrencyCode: z.string().length(3).optional(),
  defaultPaymentTermsDays: z.number().int().nonnegative().optional(),
});

export const UpdatePartnerInput = CreatePartnerInput.partial();

export const PartnerOutput = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  displayName: z.string().nullable(),
  partyType: PartyType,
  taxId: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PartnerListOutput = z.array(PartnerOutput);
```

### 6.2 Product DTOs

```typescript
// packages/validation/src/erp/base/product.ts

import { z } from 'zod';

export const ProductType = z.enum(['GOODS', 'SERVICE']);

export const CreateProductInput = z.object({
  sku: z.string().min(1).max(50).optional(),  // auto-generated if not provided
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  productType: ProductType.default('GOODS'),
  category: z.string().max(100).optional(),
  defaultSalePriceCents: z.number().int().nonnegative().default(0),
  defaultPurchasePriceCents: z.number().int().nonnegative().default(0),
  currencyCode: z.string().length(3).default('USD'),
  defaultUomId: z.string().uuid().optional(),
  isStockable: z.boolean().default(true),
  trackInventory: z.boolean().default(true),
  isSellable: z.boolean().default(true),
  isPurchasable: z.boolean().default(true),
});

export const UpdateProductInput = CreateProductInput.partial();

export const ProductOutput = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  productType: ProductType,
  category: z.string().nullable(),
  defaultSalePriceCents: z.number(),
  defaultPurchasePriceCents: z.number(),
  currencyCode: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

---

## 7) API Routes for erp.base

### 7.1 Partners

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/erp/base/partners` | List partners |
| `POST` | `/api/erp/base/partners` | Create partner |
| `GET` | `/api/erp/base/partners/[id]` | Get partner |
| `PATCH` | `/api/erp/base/partners/[id]` | Update partner |
| `DELETE` | `/api/erp/base/partners/[id]` | Deactivate partner |

### 7.2 Products

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/erp/base/products` | List products |
| `POST` | `/api/erp/base/products` | Create product |
| `GET` | `/api/erp/base/products/[id]` | Get product |
| `PATCH` | `/api/erp/base/products/[id]` | Update product |
| `DELETE` | `/api/erp/base/products/[id]` | Deactivate product |

### 7.3 UoMs

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/erp/base/uoms` | List UoMs |
| `POST` | `/api/erp/base/uoms` | Create UoM |

---

## 8) Permissions for erp.base

```typescript
// packages/validation/src/erp/base/permissions.ts

export const ERP_BASE_PERMISSIONS = {
  // Partners
  'erp.base.partner.read': 'View partners',
  'erp.base.partner.create': 'Create partners',
  'erp.base.partner.update': 'Update partners',
  'erp.base.partner.delete': 'Deactivate partners',
  
  // Products
  'erp.base.product.read': 'View products',
  'erp.base.product.create': 'Create products',
  'erp.base.product.update': 'Update products',
  'erp.base.product.delete': 'Deactivate products',
  
  // UoMs
  'erp.base.uom.read': 'View units of measure',
  'erp.base.uom.create': 'Create units of measure',
} as const;
```

---

## 9) Checklist Before Implementing erp.base

- [ ] Create `packages/db/src/erp/base/` folder structure
- [ ] Add Drizzle schema files (partners, products, uoms, sequences)
- [ ] Run `pnpm db:generate` to create migration
- [ ] Create Zod contracts in `packages/validation/src/erp/base/`
- [ ] Create addon manifest in `packages/domain/src/addons/erp.base/manifest.ts`
- [ ] Implement services: `PartnerService`, `ProductService`, `SequenceService`
- [ ] Implement seed function for tenant defaults
- [ ] Create API routes (spec-only)
- [ ] Add invariant tests (tenant isolation, code uniqueness)

---

**End of Doc**
