# B03 — Master Data Management (MDM)
## The Canonical Truth of Nouns

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |           |                       |                          |                           |
| :---------------------------: | :---------------------: | :-------: | :-------------------: | :----------------------: | :-----------------------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | **[B03]** | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) |
|            Posting            |         Domains         |    MDM    |         Sales         |         Purchase         |         Inventory         |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §P1 (Canonical Source of Truth), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B3
>
> **Tag:** `MDM` | `MASTER-DATA` | `PHASE-B3`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B03 MDM schemas follow the **Single Source of Truth** pattern:

| Component        | Source                                             |
| ---------------- | -------------------------------------------------- |
| Party schemas    | Define in `@axis/registry/schemas/mdm/party.ts`    |
| Item schemas     | Define in `@axis/registry/schemas/mdm/item.ts`     |
| UoM schemas      | Define in `@axis/registry/schemas/mdm/uom.ts`      |
| Location schemas | Define in `@axis/registry/schemas/mdm/location.ts` |
| MDM events       | `@axis/registry/schemas/events/mdm.ts`             |

**Rule**: MDM entities are referenced by ALL domains. Their schemas MUST live in `@axis/registry` to ensure cross-domain consistency.

---

## 1) The Core Law

> *"Apple ≠ APPLE ≠ apples — solved forever."*

From A01 §P1:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE CANONICAL NOUN REGISTRY                             │
│                                                                              │
│    One definition for:                                                       │
│    • Master data (customers, suppliers, items, chart of accounts)            │
│    • Transactions (sales, purchases, stock moves, journal entries)           │
│    • State (document lifecycle + approvals)                                  │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     IF TWO SYSTEMS CAN DISAGREE ON THE SAME ENTITY,               ║    │
│    ║     YOU HAVE APPLICATIONS, NOT AN ERP.                            ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    Every entity has exactly one canonical home.                              │
│    References are by stable ID, never by copy.                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without canonical MDM, you get "Apple" vs "APPLE" vs "apples Inc." as three customers
- Without canonical MDM, pricing rules break, reports disagree, reconciliation fails
- Without canonical MDM, AI/ML models learn garbage

---

## 2) The MDM Domain

### 2.1 MDM Ownership

The MDM domain **OWNS** the following entities (as defined in B02-DOMAINS.md):

| Entity Category      | Tables (Prefix)   | Description                          |
| -------------------- | ----------------- | ------------------------------------ |
| **Parties**          | `mdm_parties`     | Customers, Suppliers, Both (unified) |
| **Items**            | `mdm_items`       | Products, Services, SKUs             |
| **Units of Measure** | `mdm_uom`         | UoM definitions + conversions        |
| **Locations**        | `mdm_locations`   | Warehouses, Bins, Branches           |
| **Tax Codes**        | `mdm_tax_codes`   | Tax rates, jurisdictions, rules      |
| **Price Lists**      | `mdm_price_lists` | Pricing tiers, effective dates       |
| **Aliases**          | `mdm_aliases`     | Normalization for matching           |

### 2.2 Event Publishing

| Event                | Payload                              | Consumers                   |
| -------------------- | ------------------------------------ | --------------------------- |
| `party.created`      | Party ID, name, type, tax info       | Sales, Purchase, Accounting |
| `party.updated`      | Changed fields, effective date       | Sales, Purchase, Accounting |
| `party.deactivated`  | Party ID, reason, effective date     | All domains                 |
| `item.created`       | Item ID, SKU, UoM, category          | Sales, Purchase, Inventory  |
| `item.updated`       | Changed fields, effective date       | Sales, Purchase, Inventory  |
| `item.deactivated`   | Item ID, reason, effective date      | All domains                 |
| `location.created`   | Location ID, type, parent            | Inventory, Sales, Purchase  |
| `tax_code.created`   | Tax code, rate, jurisdiction         | Sales, Purchase, Accounting |
| `price_list.updated` | Price list ID, effective date, items | Sales, Purchase             |

---

## 3) The Party Model (Unified Customer/Supplier)

### 3.1 Party Philosophy

Traditional ERPs maintain separate Customer and Supplier tables. This causes:
- Data duplication when an entity is both
- Synchronization drift between records
- Complex queries for party-level views

**AXIS Solution:** One `Party` entity with **role flags**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED PARTY MODEL                                  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                            PARTY                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ id: UUID                                                        │  │  │
│  │  │ tenant_id: UUID                                                 │  │  │
│  │  │ legal_name: string                                              │  │  │
│  │  │ display_name: string                                            │  │  │
│  │  │ tax_id: string (optional)                                       │  │  │
│  │  │ party_type: individual | company | government                   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                             │                                         │  │
│  │              ┌──────────────┼──────────────┐                          │  │
│  │              ▼              ▼              ▼                          │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │  │
│  │  │ CUSTOMER ROLE  │  │ SUPPLIER ROLE  │  │  BOTH ROLES    │          │  │
│  │  │  is_customer   │  │  is_supplier   │  │ is_customer +  │          │  │
│  │  │  = true        │  │  = true        │  │ is_supplier    │          │  │
│  │  │                │  │                │  │  = true        │          │  │
│  │  │  • Credit limit│  │  • Payment terms│ │                │          │  │
│  │  │  • Price list  │  │  • Lead time   │  │                │          │  │
│  │  │  • AR ledger   │  │  • AP ledger   │  │                │          │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Benefits:                                                                   │
│  • One source of truth for name, address, tax info                           │
│  • Easy "is this entity both customer and supplier?" check                   │
│  • Single party view across all transactions                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Party Schema

```typescript
// packages/axis-registry/src/schemas/mdm/party.ts

import { z } from "zod";

export const PARTY_TYPE = ["individual", "company", "government"] as const;
export const PARTY_STATUS = ["active", "inactive", "blocked", "pending_review"] as const;

export const partySchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Core
  legalName: z.string().min(1).max(255),
  displayName: z.string().min(1).max(255).optional(),
  partyType: z.enum(PARTY_TYPE),
  status: z.enum(PARTY_STATUS).default("active"),

  // Tax & Legal
  taxId: z.string().max(50).optional(),
  taxIdType: z.string().max(20).optional(), // SSN, EIN, VAT, GST, etc.
  registrationNumber: z.string().max(100).optional(),

  // Role Flags
  isCustomer: z.boolean().default(false),
  isSupplier: z.boolean().default(false),

  // Customer-specific (when isCustomer = true)
  customerSettings: z.object({
    creditLimit: z.string().optional(), // Decimal as string
    creditLimitCurrency: z.string().length(3).optional(),
    defaultPriceListId: z.string().uuid().optional(),
    defaultPaymentTermId: z.string().uuid().optional(),
    arAccountId: z.string().uuid().optional(),
  }).optional(),

  // Supplier-specific (when isSupplier = true)
  supplierSettings: z.object({
    defaultPaymentTermId: z.string().uuid().optional(),
    defaultLeadTimeDays: z.number().int().min(0).optional(),
    apAccountId: z.string().uuid().optional(),
    minimumOrderValue: z.string().optional(), // Decimal as string
    minimumOrderCurrency: z.string().length(3).optional(),
  }).optional(),

  // Metadata (6W1H-lite for master data)
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
});

export type Party = z.infer<typeof partySchema>;
```

### 3.3 Party Address Schema

```typescript
// packages/axis-registry/src/schemas/mdm/party-address.ts

export const ADDRESS_TYPE = [
  "billing",
  "shipping",
  "registered",
  "mailing"
] as const;

export const partyAddressSchema = z.object({
  id: z.string().uuid(),
  partyId: z.string().uuid(),
  tenantId: z.string().uuid(),

  addressType: z.enum(ADDRESS_TYPE),
  isPrimary: z.boolean().default(false),

  // Address fields
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  stateProvince: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2), // ISO 3166-1 alpha-2

  // Contact at this address
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().email().optional(),

  // Validity
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PartyAddress = z.infer<typeof partyAddressSchema>;
```

### 3.4 Party Contact Schema

```typescript
// packages/axis-registry/src/schemas/mdm/party-contact.ts

export const CONTACT_TYPE = [
  "primary",
  "billing",
  "shipping",
  "technical",
  "sales"
] as const;

export const partyContactSchema = z.object({
  id: z.string().uuid(),
  partyId: z.string().uuid(),
  tenantId: z.string().uuid(),

  contactType: z.enum(CONTACT_TYPE),
  isPrimary: z.boolean().default(false),

  name: z.string().min(1).max(255),
  title: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),

  // Communication preferences
  preferredChannel: z.enum(["email", "phone", "mail"]).default("email"),
  notes: z.string().max(1000).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PartyContact = z.infer<typeof partyContactSchema>;
```

---

## 4) The Item Model

### 4.1 Item Philosophy

Items in AXIS follow the **Item Master + Variants** pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ITEM HIERARCHY                                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         ITEM MASTER                                     │ │
│  │  "T-Shirt"                                                              │ │
│  │  SKU: TSHIRT-BASE                                                       │ │
│  │  Category: Apparel                                                      │ │
│  │  Base UoM: Each                                                         │ │
│  └──────────────────────────────────┬─────────────────────────────────────┘ │
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────┐            │
│          │                          │                          │            │
│          ▼                          ▼                          ▼            │
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐      │
│  │   VARIANT     │         │   VARIANT     │         │   VARIANT     │      │
│  │ "T-Shirt Red" │         │"T-Shirt Blue" │         │"T-Shirt Green"│      │
│  │ SKU: TSH-R-M  │         │ SKU: TSH-B-M  │         │ SKU: TSH-G-M  │      │
│  │ Color: Red    │         │ Color: Blue   │         │ Color: Green  │      │
│  │ Size: M       │         │ Size: M       │         │ Size: M       │      │
│  │ Barcode: ...  │         │ Barcode: ...  │         │ Barcode: ...  │      │
│  └───────────────┘         └───────────────┘         └───────────────┘      │
│                                                                              │
│  Item Types:                                                                 │
│  • stockable    - Physical goods with inventory                              │
│  • consumable   - Physical goods without tracking (supplies)                 │
│  • service      - Non-physical, time/effort based                            │
│  • bundle       - Kit of other items                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Item Schema

```typescript
// packages/axis-registry/src/schemas/mdm/item.ts

import { z } from "zod";

export const ITEM_TYPE = [
  "stockable",   // Physical, tracked in inventory
  "consumable",  // Physical, not tracked (office supplies, etc.)
  "service",     // Non-physical (consulting, labor, etc.)
  "bundle",      // Kit of other items
] as const;

export const ITEM_STATUS = [
  "active",
  "inactive",
  "discontinued",
  "pending_approval"
] as const;

export const TRACKING_TYPE = [
  "none",        // No lot/serial tracking
  "lot",         // Batch tracking
  "serial",      // Individual unit tracking
] as const;

export const itemSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Core
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),

  // Classification
  itemType: z.enum(ITEM_TYPE),
  status: z.enum(ITEM_STATUS).default("active"),
  categoryId: z.string().uuid().optional(),

  // Variant relationship
  isVariant: z.boolean().default(false),
  parentItemId: z.string().uuid().optional(), // If this is a variant
  variantAttributes: z.record(z.string()).optional(), // e.g., { color: "red", size: "M" }

  // Units of Measure
  baseUomId: z.string().uuid(),
  purchaseUomId: z.string().uuid().optional(),
  salesUomId: z.string().uuid().optional(),

  // Tracking
  trackingType: z.enum(TRACKING_TYPE).default("none"),

  // Inventory Settings (for stockable items)
  inventorySettings: z.object({
    defaultLocationId: z.string().uuid().optional(),
    reorderPoint: z.number().min(0).optional(),
    reorderQty: z.number().min(0).optional(),
    safetyStock: z.number().min(0).optional(),
  }).optional(),

  // Costing
  costingMethod: z.enum(["weighted_average", "fifo", "standard"]).default("weighted_average"),
  standardCost: z.string().optional(), // Decimal as string
  standardCostCurrency: z.string().length(3).optional(),

  // Dimensions (for shipping/storage)
  weight: z.number().min(0).optional(),
  weightUom: z.string().max(10).optional(), // kg, lb, etc.
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  dimensionUom: z.string().max(10).optional(), // cm, in, etc.

  // Tax
  defaultTaxCodeId: z.string().uuid().optional(),

  // External References
  barcode: z.string().max(100).optional(),
  gtin: z.string().max(14).optional(), // GS1 Global Trade Item Number
  manufacturerPartNumber: z.string().max(100).optional(),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
});

export type Item = z.infer<typeof itemSchema>;
```

### 4.3 Item Category Schema

```typescript
// packages/axis-registry/src/schemas/mdm/item-category.ts

export const itemCategorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),

  // Hierarchy
  parentCategoryId: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  path: z.string().max(1000).optional(), // Materialized path: "/parent/child/grandchild"

  // Defaults for items in this category
  defaultCostingMethod: z.enum(["weighted_average", "fifo", "standard"]).optional(),
  defaultTaxCodeId: z.string().uuid().optional(),
  defaultInventoryAccountId: z.string().uuid().optional(),
  defaultCogsAccountId: z.string().uuid().optional(),
  defaultRevenueAccountId: z.string().uuid().optional(),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ItemCategory = z.infer<typeof itemCategorySchema>;
```

---

## 5) Unit of Measure (UoM) Model

### 5.1 UoM Philosophy

UoM in AXIS follows the **UoM + Conversion Factor** pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UOM CONVERSION MODEL                                 │
│                                                                              │
│  Base UoM: Each                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  1 Each ←──────────────────────────────────────────────────────────────▶││
│  │     │                                                                    ││
│  │     │  Conversion: 1 Box = 12 Each                                       ││
│  │     │                                                                    ││
│  │  1 Box ←──────────────────────────────────────────────────────────────▶ ││
│  │     │                                                                    ││
│  │     │  Conversion: 1 Case = 10 Boxes = 120 Each                          ││
│  │     │                                                                    ││
│  │  1 Case ←────────────────────────────────────────────────────────────▶  ││
│  │     │                                                                    ││
│  │     │  Conversion: 1 Pallet = 50 Cases = 500 Boxes = 6000 Each          ││
│  │     │                                                                    ││
│  │  1 Pallet ─────────────────────────────────────────────────────────────▶││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Conversion Chain: Pallet → Case → Box → Each                                │
│  All quantities stored in BASE UOM, converted at display time               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 UoM Schema

```typescript
// packages/axis-registry/src/schemas/mdm/uom.ts

export const UOM_CATEGORY = [
  "unit",      // Each, Piece, Item
  "weight",    // Kg, Lb, Oz, Gram
  "volume",    // Liter, Gallon, mL
  "length",    // Meter, Foot, Inch
  "area",      // Sq Meter, Sq Foot
  "time",      // Hour, Day, Week
  "custom",    // User-defined
] as const;

export const uomSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  name: z.string().min(1).max(50),
  symbol: z.string().min(1).max(10),
  category: z.enum(UOM_CATEGORY),

  // Is this a base unit for its category?
  isBase: z.boolean().default(false),

  // Conversion to base unit (if not base)
  baseUomId: z.string().uuid().optional(),
  conversionFactor: z.number().positive().default(1), // How many base units = 1 of this

  // Precision
  decimalPrecision: z.number().int().min(0).max(6).default(2),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Uom = z.infer<typeof uomSchema>;
```

### 5.3 Item-Specific UoM Conversion

```typescript
// packages/axis-registry/src/schemas/mdm/item-uom.ts

/**
 * Item-specific UoM conversions (when different from global UoM ratios)
 * Example: Item A has 24 units per box, Item B has 12 units per box
 */
export const itemUomSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  itemId: z.string().uuid(),

  fromUomId: z.string().uuid(),
  toUomId: z.string().uuid(),

  conversionFactor: z.number().positive(), // How many "to" = 1 "from"

  // Use case
  useForPurchase: z.boolean().default(true),
  useForSales: z.boolean().default(true),
  useForInventory: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ItemUom = z.infer<typeof itemUomSchema>;
```

---

## 6) Location Model

### 6.1 Location Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOCATION HIERARCHY                                    │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         WAREHOUSE                                      │  │
│  │  Type: warehouse                                                       │  │
│  │  "Main Warehouse - KL"                                                 │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────┐            │
│          │                          │                          │            │
│          ▼                          ▼                          ▼            │
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐      │
│  │     ZONE      │         │     ZONE      │         │     ZONE      │      │
│  │ Type: zone    │         │ Type: zone    │         │ Type: zone    │      │
│  │ "Zone A"      │         │ "Zone B"      │         │ "Zone C"      │      │
│  │ (Receiving)   │         │ (Storage)     │         │ (Shipping)    │      │
│  └───────┬───────┘         └───────┬───────┘         └───────────────┘      │
│          │                          │                                        │
│          ▼                          ▼                                        │
│  ┌───────────────┐         ┌───────────────┐                                │
│  │     BIN       │         │     BIN       │                                │
│  │ Type: bin     │         │ Type: bin     │                                │
│  │ "A-01-01"     │         │ "B-03-02"     │                                │
│  └───────────────┘         └───────────────┘                                │
│                                                                              │
│  Location Types:                                                             │
│  • warehouse   - Physical warehouse                                          │
│  • zone        - Area within warehouse                                       │
│  • bin         - Specific storage location                                   │
│  • virtual     - Adjustment, Transit, Quality Hold                           │
│  • branch      - Branch/store location                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Location Schema

```typescript
// packages/axis-registry/src/schemas/mdm/location.ts

export const LOCATION_TYPE = [
  "warehouse",   // Physical warehouse
  "zone",        // Area within warehouse
  "bin",         // Specific bin/shelf
  "virtual",     // Adjustment, transit, QC hold
  "branch",      // Store/branch location
] as const;

export const locationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  locationType: z.enum(LOCATION_TYPE),

  // Hierarchy
  parentLocationId: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  path: z.string().max(1000).optional(), // Materialized path

  // Address (for warehouse/branch)
  address: z.object({
    line1: z.string().max(255).optional(),
    line2: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    stateProvince: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().length(2).optional(),
  }).optional(),

  // Inventory settings
  allowNegativeStock: z.boolean().default(false),
  isDefaultReceiving: z.boolean().default(false),
  isDefaultShipping: z.boolean().default(false),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Location = z.infer<typeof locationSchema>;
```

---

## 7) Tax Code Model

### 7.1 Tax Philosophy

AXIS supports multi-jurisdiction tax with effective dating:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TAX MODEL                                          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         TAX CODE                                        │ │
│  │  "MY-SST-10"                                                            │ │
│  │  Jurisdiction: Malaysia                                                 │ │
│  │  Tax Type: Sales and Service Tax                                        │ │
│  └──────────────────────────────────┬─────────────────────────────────────┘ │
│                                     │                                        │
│                                     ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      TAX RATE (Effective Dated)                         │ │
│  │  Rate: 10%                                                              │ │
│  │  Effective From: 2024-03-01                                             │ │
│  │  Effective To: null (current)                                           │ │
│  │                                                                          │ │
│  │  [Historical rates preserved for audit]                                 │ │
│  │  Rate: 6%                                                               │ │
│  │  Effective From: 2018-09-01                                             │ │
│  │  Effective To: 2024-02-29                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Tax Types:                                                                  │
│  • sales_tax      - Applied on sales                                         │
│  • purchase_tax   - Applied on purchases (input tax)                         │
│  • vat_output     - VAT charged to customers                                 │
│  • vat_input      - VAT paid to suppliers (claimable)                        │
│  • withholding    - Withheld at source                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Tax Code Schema

```typescript
// packages/axis-registry/src/schemas/mdm/tax-code.ts

export const TAX_TYPE = [
  "sales_tax",
  "purchase_tax",
  "vat_output",
  "vat_input",
  "withholding",
  "exempt",
  "zero_rated",
] as const;

export const TAX_CALCULATION = [
  "percentage",       // Rate % of base amount
  "fixed",            // Fixed amount per unit
  "tiered",           // Different rates at different thresholds
] as const;

export const taxCodeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),

  taxType: z.enum(TAX_TYPE),
  jurisdiction: z.string().max(100), // Country, state, region

  calculation: z.enum(TAX_CALCULATION).default("percentage"),

  // Accounts
  taxPayableAccountId: z.string().uuid().optional(),
  taxReceivableAccountId: z.string().uuid().optional(),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const taxRateSchema = z.object({
  id: z.string().uuid(),
  taxCodeId: z.string().uuid(),
  tenantId: z.string().uuid(),

  rate: z.number().min(0).max(100), // Percentage (0-100)

  // Effective dating
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(), // null = current

  // For tiered calculation
  minAmount: z.string().optional(), // Decimal as string
  maxAmount: z.string().optional(),

  createdAt: z.string().datetime(),
});

export type TaxCode = z.infer<typeof taxCodeSchema>;
export type TaxRate = z.infer<typeof taxRateSchema>;
```

---

## 8) Price List Model

### 8.1 Price Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRICE LIST MODEL                                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       PRICE LIST                                        │ │
│  │  "Retail Price List - MYR"                                              │ │
│  │  Currency: MYR                                                          │ │
│  │  Type: selling                                                          │ │
│  └──────────────────────────────────┬─────────────────────────────────────┘ │
│                                     │                                        │
│                    ┌────────────────┼────────────────┐                      │
│                    │                │                │                      │
│                    ▼                ▼                ▼                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   PRICE LIST ITEM   │  │   PRICE LIST ITEM   │  │   PRICE LIST ITEM   │ │
│  │  Item: Widget-A     │  │  Item: Widget-B     │  │  Item: Service-X    │ │
│  │  Price: 100.00      │  │  Price: 200.00      │  │  Price: 50.00/hr    │ │
│  │  Min Qty: 1         │  │  Min Qty: 1         │  │  Min Qty: 1         │ │
│  │                     │  │                     │  │                     │ │
│  │  [Volume Tiers]     │  │  [No tiers]         │  │  [No tiers]         │ │
│  │  Qty 10+: 90.00     │  │                     │  │                     │ │
│  │  Qty 100+: 80.00    │  │                     │  │                     │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                              │
│  Price List Types:                                                           │
│  • selling      - Customer pricing                                           │
│  • buying       - Supplier pricing (cost reference)                          │
│  • transfer     - Inter-company/branch transfers                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Price List Schema

```typescript
// packages/axis-registry/src/schemas/mdm/price-list.ts

export const PRICE_LIST_TYPE = [
  "selling",     // Customer pricing
  "buying",      // Supplier pricing
  "transfer",    // Inter-company
] as const;

export const priceListSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  priceListType: z.enum(PRICE_LIST_TYPE),
  currency: z.string().length(3), // ISO 4217

  // Validity
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),

  // Tax settings
  pricesIncludeTax: z.boolean().default(false),

  // Status
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const priceListItemSchema = z.object({
  id: z.string().uuid(),
  priceListId: z.string().uuid(),
  itemId: z.string().uuid(),
  tenantId: z.string().uuid(),

  price: z.string(), // Decimal as string

  // Volume pricing
  minQuantity: z.number().min(0).default(1),
  maxQuantity: z.number().min(0).optional(),

  // Validity (can override price list dates)
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PriceList = z.infer<typeof priceListSchema>;
export type PriceListItem = z.infer<typeof priceListItemSchema>;
```

---

## 9) Alias Registry (Anti-Drift Mechanism)

### 9.1 The Drift Problem

Free-text fields cause drift:

| Entry 1       | Entry 2          | Entry 3           | Same Entity? |
| ------------- | ---------------- | ----------------- | ------------ |
| "Apple Inc"   | "APPLE INC."     | "Apple, Inc"      | ✅ Yes        |
| "ABC Trading" | "ABC Trading Co" | "ABC Trading Sdn" | ✅ Yes        |
| "John Doe"    | "JOHN DOE"       | "J. Doe"          | ⚠️ Maybe      |

### 9.2 Alias Schema

```typescript
// packages/axis-registry/src/schemas/mdm/alias.ts

export const ALIAS_ENTITY_TYPE = [
  "party",
  "item",
  "location",
] as const;

export const aliasSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  entityType: z.enum(ALIAS_ENTITY_TYPE),
  entityId: z.string().uuid(), // The canonical entity

  alias: z.string().min(1).max(500),
  normalizedAlias: z.string().min(1).max(500), // Lowercased, punctuation removed

  // Source of alias
  source: z.enum(["manual", "import", "auto_detected"]).default("manual"),

  // Confidence (for auto-detected)
  confidence: z.number().min(0).max(1).optional(),

  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Alias = z.infer<typeof aliasSchema>;
```

### 9.3 Alias Matching Logic

```typescript
// packages/db/src/queries/mdm/alias.ts

/**
 * Normalize a string for alias matching
 */
export function normalizeForMatching(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Find entity by alias
 */
export async function findByAlias(
  db: Database,
  tenantId: string,
  entityType: AliasEntityType,
  searchTerm: string
): Promise<{ entityId: string; confidence: number } | null> {
  const normalized = normalizeForMatching(searchTerm);

  const result = await db.query.aliases.findFirst({
    where: and(
      eq(aliases.tenantId, tenantId),
      eq(aliases.entityType, entityType),
      eq(aliases.normalizedAlias, normalized)
    ),
  });

  if (result) {
    return { entityId: result.entityId, confidence: result.confidence ?? 1.0 };
  }

  // Fuzzy match fallback (Levenshtein distance, etc.)
  // Return null if no match found
  return null;
}
```

---

## 10) Effective Dating Pattern

### 10.1 Why Effective Dating?

Master data changes over time. The question is: **What was the truth at transaction time?**

| Without Effective Dating                            | With Effective Dating                                        |
| --------------------------------------------------- | ------------------------------------------------------------ |
| "Customer moved" → old invoices show new address    | "Customer moved" → old invoices show address at invoice time |
| "Tax rate changed" → recalculating history is wrong | "Tax rate changed" → history uses rate at transaction time   |
| "Price changed" → can't explain old quotes          | "Price changed" → quotes show price at quote time            |

### 10.2 Effective Dating Schema Pattern

```typescript
// Pattern for any effective-dated entity

export interface EffectiveDated {
  effectiveFrom: string;   // ISO8601 - when this version becomes active
  effectiveTo: string | null; // ISO8601 or null (current version)
}

// Query: Get the version that was active at a given date
export async function getEffectiveAt<T extends EffectiveDated>(
  db: Database,
  table: PgTable,
  id: string,
  asOfDate: Date = new Date()
): Promise<T | null> {
  const isoDate = asOfDate.toISOString();

  return db.query[table].findFirst({
    where: and(
      eq(table.id, id),
      lte(table.effectiveFrom, isoDate),
      or(
        isNull(table.effectiveTo),
        gte(table.effectiveTo, isoDate)
      )
    ),
  });
}
```

---

## 11) Database Invariants

### 11.1 Party Invariants

```sql
-- At least one role must be true
ALTER TABLE mdm_parties
ADD CONSTRAINT chk_party_role
CHECK (is_customer = true OR is_supplier = true);

-- Unique canonical name per tenant
CREATE UNIQUE INDEX idx_party_canonical
ON mdm_parties (tenant_id, lower(legal_name))
WHERE status != 'inactive';
```

### 11.2 Item Invariants

```sql
-- SKU unique per tenant
CREATE UNIQUE INDEX idx_item_sku
ON mdm_items (tenant_id, sku)
WHERE status != 'inactive';

-- Variants must have parent
ALTER TABLE mdm_items
ADD CONSTRAINT chk_variant_parent
CHECK (
  (is_variant = false AND parent_item_id IS NULL) OR
  (is_variant = true AND parent_item_id IS NOT NULL)
);
```

### 11.3 UoM Invariants

```sql
-- Base UoM has no parent
ALTER TABLE mdm_uom
ADD CONSTRAINT chk_base_uom
CHECK (
  (is_base = true AND base_uom_id IS NULL) OR
  (is_base = false AND base_uom_id IS NOT NULL)
);
```

---

## 12) Exit Criteria (B3 Gate)

**B3 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                           | Verified | Implementation                                   |
| --- | --------------------------------------------------- | -------- | ------------------------------------------------ |
| 1   | Party model supports Customer/Supplier/Both roles   | ✅        | `partySchema` + Drizzle tables                   |
| 2   | Item model with variants and UoM conversions        | ✅        | `itemSchema`, `itemUomSchema` defined            |
| 3   | Location hierarchy (Warehouse → Zone → Bin)         | ✅        | `locationSchema` + parent_id                     |
| 4   | Tax codes with effective dating                     | ✅        | `taxCodeSchema`, `taxRateSchema` defined         |
| 5   | Price lists with volume tiers                       | ✅        | `priceListSchema`, `priceListItemSchema` defined |
| 6   | Alias registry catches "Apple" vs "APPLE" on create | ✅        | `aliasSchema` + `normalizeForMatching()` defined |
| 7   | Effective dating works for historical queries       | ✅        | `effective_from`, `effective_to` pattern         |
| 8   | MDM events published to outbox                      | ✅        | B02 outbox integration ready                     |
| 9   | No free-text drift in master data                   | ✅        | Validation rules + alias matching defined        |

### Implementation Files

| Component          | Location                                              |
| ------------------ | ----------------------------------------------------- |
| MDM Constants      | `packages/axis-registry/src/schemas/mdm/constants.ts` |
| Party Schemas      | `packages/axis-registry/src/schemas/mdm/party.ts`     |
| Item Schemas       | `packages/axis-registry/src/schemas/mdm/item.ts`      |
| Location Schemas   | `packages/axis-registry/src/schemas/mdm/location.ts`  |
| UoM Schemas        | `packages/axis-registry/src/schemas/mdm/uom.ts`       |
| Tax Schemas        | `packages/axis-registry/src/schemas/mdm/tax.ts`       |
| Price List Schemas | `packages/axis-registry/src/schemas/mdm/price.ts`     |
| MDM Tables         | `packages/db/src/schema/mdm/*.ts`                     |
| MDM Events         | `packages/axis-registry/src/schemas/events/mdm.ts`    |

---

## 13) Integration with Other Phases

| Phase                | Dependency on B03     | What B03 Provides               |
| -------------------- | --------------------- | ------------------------------- |
| **B01** (Posting)    | Party/Item references | Valid entity IDs for postings   |
| **B02** (Domains)    | Event contracts       | MDM event schemas               |
| **B04** (Sales)      | Full MDM              | Customers, Items, Prices, Taxes |
| **B05** (Purchase)   | Full MDM              | Suppliers, Items, Prices, Taxes |
| **B06** (Inventory)  | Items, Locations      | SKUs, Warehouses, UoM           |
| **B07** (Accounting) | Party accounts, Tax   | AR/AP accounts, Tax codes       |
| **B12** (AI)         | Clean MDM             | Training data without drift     |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B3 (MDM)                                        |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: MDM provides the foundation for all transactional domains (B04-B07).

---

## Related Documents

| Document                                       | Purpose                                     |
| ---------------------------------------------- | ------------------------------------------- |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §P1 (Canonical Source of Truth) |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)           | Roadmap: Phase B3 definition                |
| [B01-DOCUMENTATION.md](./B01-DOCUMENTATION.md) | Posting Spine (consumes MDM IDs)            |
| [B02-DOMAINS.md](./B02-DOMAINS.md)             | Domain boundaries (MDM domain definition)   |
| [B04-SALES.md](./B04-SALES.md)                 | Sales domain (consumes MDM)                 |
| [B05-PURCHASE.md](./B05-PURCHASE.md)           | Purchase domain (consumes MDM)              |
| [B06-INVENTORY.md](./B06-INVENTORY.md)         | Inventory domain (consumes MDM)             |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)       | Accounting domain (consumes MDM)            |

---

> *"Apple ≠ APPLE ≠ apples — solved forever. One source of truth for the nouns of your business."*
