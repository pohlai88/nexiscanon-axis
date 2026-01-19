# help012-erp-money-currency.md

**Status:** SUPPORTING (Help)  
**Source:** PostgreSQL Numeric Types + Industry Best Practices  
**Goal:** Eliminate money-handling bugs before they happen.

---

## 0) The Problem

Money handling is the #1 source of ERP bugs that cause real business harm:

- Floating-point precision loss (0.1 + 0.2 ≠ 0.3)
- Currency conversion errors
- Rounding inconsistencies
- Display vs storage confusion

This document codifies how AXIS ERP handles money.

---

## 1) Storage Decision: Integer Cents (Primary)

### 1.1 The Rule

**Store money as integers in the smallest currency unit (cents, pence, etc.)**

```sql
-- Good: integer cents
total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents >= 0)

-- Bad: floating point
total_amount FLOAT  -- NEVER DO THIS
```

### 1.2 Why Integer Cents

| Approach | Pros | Cons |
|----------|------|------|
| **BIGINT (cents)** | No precision issues, fast, simple math | Requires conversion for display |
| `NUMERIC(19,4)` | Sub-cent precision, familiar | Slightly slower, more complex |
| `FLOAT/REAL` | - | Precision loss, NEVER use for money |

**Decision:** Use `BIGINT` for most cases. Use `NUMERIC(19,4)` only for forex or commodity pricing where sub-cent precision is required.

### 1.3 Capacity

`BIGINT` can store up to 9,223,372,036,854,775,807 cents = ~92 quadrillion dollars. More than enough.

---

## 2) Field Naming Convention

### 2.1 Cents Fields

Name fields explicitly with `_cents` suffix:

```typescript
// Drizzle schema
unitPriceCents: bigint('unit_price_cents', { mode: 'number' }).notNull(),
lineAmountCents: bigint('line_amount_cents', { mode: 'number' }).notNull(),
subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull(),
taxAmountCents: bigint('tax_amount_cents', { mode: 'number' }).notNull(),
totalAmountCents: bigint('total_amount_cents', { mode: 'number' }).notNull(),
```

### 2.2 Decimal Fields (When Used)

If using `NUMERIC`, don't add suffix—just document:

```typescript
// Only if sub-cent precision needed
exchangeRate: numeric('exchange_rate', { precision: 19, scale: 6 }).notNull(),
```

---

## 3) Currency Code Association

### 3.1 Rule

Every money field MUST have an associated currency code, either:
- On the same record (document header)
- Inherited from a parent (line inherits from order)

### 3.2 Schema Pattern

```sql
-- Document header has currency
CREATE TABLE erp_sales_orders (
    ...
    currency_code TEXT NOT NULL DEFAULT 'USD' CHECK (length(currency_code) = 3),
    subtotal_cents BIGINT NOT NULL DEFAULT 0,
    tax_amount_cents BIGINT NOT NULL DEFAULT 0,
    total_amount_cents BIGINT NOT NULL DEFAULT 0,
    ...
);

-- Lines inherit currency from header (no separate currency_code)
CREATE TABLE erp_sales_order_lines (
    ...
    unit_price_cents BIGINT NOT NULL,
    qty NUMERIC(19, 4) NOT NULL,
    line_amount_cents BIGINT NOT NULL,
    ...
);
```

### 3.3 Currency Reference

Use ISO 4217 currency codes:

```typescript
// packages/validation/src/erp/common/currency.ts

export const CurrencyCode = z.string().length(3).regex(/^[A-Z]{3}$/);

export const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'INR', 'SGD', 'MYR',
] as const;
```

---

## 4) Conversion Functions

### 4.1 Cents ↔ Display

```typescript
// packages/domain/src/addons/erp.base/lib/money.ts

/**
 * Convert cents to display amount (e.g., 1234 → 12.34)
 */
export function centsToDollars(cents: number, decimalPlaces: number = 2): number {
  return cents / Math.pow(10, decimalPlaces);
}

/**
 * Convert display amount to cents (e.g., 12.34 → 1234)
 */
export function dollarsToCents(dollars: number, decimalPlaces: number = 2): number {
  return Math.round(dollars * Math.pow(10, decimalPlaces));
}

/**
 * Format cents as currency string
 */
export function formatMoney(
  cents: number, 
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  const amount = centsToDollars(cents);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}
```

### 4.2 Usage in Contracts

```typescript
// API input (user submits dollars)
export const CreateOrderLineInput = z.object({
  productId: z.string().uuid(),
  qty: z.number().positive(),
  unitPrice: z.number().nonnegative(),  // user input in dollars
});

// Transform to cents in service
const lineAmountCents = dollarsToCents(input.unitPrice) * input.qty;

// API output (return both for convenience)
export const OrderLineOutput = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number(),
  unitPriceCents: z.number(),
  unitPrice: z.number(),  // derived: cents / 100
  lineAmountCents: z.number(),
  lineAmount: z.number(),  // derived: cents / 100
});
```

---

## 5) Calculation Rules

### 5.1 Line Amount Calculation

```typescript
// Calculate in cents, round once
function calculateLineAmount(unitPriceCents: number, qty: number): number {
  // qty may be decimal (e.g., 2.5 kg)
  return Math.round(unitPriceCents * qty);
}
```

### 5.2 Order Total Calculation

```typescript
function calculateOrderTotals(lines: OrderLine[]): OrderTotals {
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineAmountCents, 0);
  const taxAmountCents = calculateTax(subtotalCents, taxRate);
  const totalAmountCents = subtotalCents + taxAmountCents;
  
  return { subtotalCents, taxAmountCents, totalAmountCents };
}
```

### 5.3 Rounding Rule

- Round to nearest cent (half-up) at each line
- Totals are sum of rounded lines
- Never store unrounded intermediate values

---

## 6) Tax Calculation

### 6.1 Simple Tax (v0)

```typescript
// Tax rate as decimal (e.g., 0.08 for 8%)
function calculateTax(subtotalCents: number, taxRate: number): number {
  return Math.round(subtotalCents * taxRate);
}
```

### 6.2 Tax Schema (v0 - Simple)

```sql
-- On document header
tax_rate NUMERIC(5, 4),              -- e.g., 0.0800 for 8%
tax_amount_cents BIGINT NOT NULL DEFAULT 0,
```

### 6.3 Tax Jurisdiction (Future)

When multiple tax rates are needed:

```sql
CREATE TABLE erp_order_taxes (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES erp_sales_orders(id),
    tax_name TEXT NOT NULL,           -- e.g., "State Tax", "GST"
    tax_rate NUMERIC(5, 4) NOT NULL,
    taxable_amount_cents BIGINT NOT NULL,
    tax_amount_cents BIGINT NOT NULL
);
```

---

## 7) Multi-Currency (When Needed)

### 7.1 Functional Currency

Each tenant has a functional (home) currency:

```sql
-- In tenant settings
functional_currency_code TEXT NOT NULL DEFAULT 'USD'
```

### 7.2 Document Currency

Documents can be in any currency:

```sql
CREATE TABLE erp_sales_orders (
    ...
    currency_code TEXT NOT NULL,        -- document currency
    exchange_rate NUMERIC(19, 6),       -- to functional currency
    ...
);
```

### 7.3 Exchange Rate Storage

Store the rate used at transaction time (for auditability):

```typescript
// At order creation
const order = {
  currencyCode: 'EUR',
  exchangeRate: 1.08,  // 1 EUR = 1.08 USD (functional)
  subtotalCents: 10000,  // 100.00 EUR
  // Functional equivalent: 10000 * 1.08 = 10800 cents = 108.00 USD
};
```

### 7.4 Exchange Rate Table (When Needed)

```sql
CREATE TABLE erp_exchange_rates (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    from_currency TEXT NOT NULL CHECK (length(from_currency) = 3),
    to_currency TEXT NOT NULL CHECK (length(to_currency) = 3),
    rate NUMERIC(19, 6) NOT NULL,
    effective_date DATE NOT NULL,
    
    UNIQUE (tenant_id, from_currency, to_currency, effective_date)
);
```

---

## 8) Validation Rules (Zod)

### 8.1 Amount Schemas

```typescript
// packages/validation/src/erp/common/money.ts

import { z } from 'zod';

// Cents (integer, non-negative)
export const AmountCents = z.number().int().nonnegative();

// Positive cents (must be > 0)
export const PositiveAmountCents = z.number().int().positive();

// Display amount (user input, can have decimals)
export const DisplayAmount = z.number().nonnegative();

// Quantity (can be decimal for weight/volume)
export const Quantity = z.number().positive();

// Currency code
export const CurrencyCode = z.string().length(3).regex(/^[A-Z]{3}$/);

// Exchange rate
export const ExchangeRate = z.number().positive();
```

### 8.2 Line Validation

```typescript
export const OrderLineInput = z.object({
  productId: z.string().uuid(),
  qty: Quantity,
  unitPrice: DisplayAmount,  // user inputs dollars
}).refine(
  (data) => data.qty > 0,
  { message: 'Quantity must be positive' }
);
```

---

## 9) Display Formatting

### 9.1 Currency Display Helper

```typescript
// packages/domain/src/addons/erp.base/lib/format.ts

const CURRENCY_CONFIG: Record<string, { locale: string; decimals: number }> = {
  USD: { locale: 'en-US', decimals: 2 },
  EUR: { locale: 'de-DE', decimals: 2 },
  GBP: { locale: 'en-GB', decimals: 2 },
  JPY: { locale: 'ja-JP', decimals: 0 },
  // Add more as needed
};

export function formatCurrency(cents: number, currencyCode: string): string {
  const config = CURRENCY_CONFIG[currencyCode] ?? { locale: 'en-US', decimals: 2 };
  const divisor = Math.pow(10, config.decimals);
  const amount = cents / divisor;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}
```

### 9.2 Zero-Decimal Currencies

Some currencies (JPY, KRW) have no decimal places:

```typescript
const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND', 'IDR'];

function getDecimalPlaces(currencyCode: string): number {
  return ZERO_DECIMAL_CURRENCIES.includes(currencyCode) ? 0 : 2;
}
```

For these, "cents" = "units" (1 JPY = 1 unit, not 100 sen).

---

## 10) Invariant Tests for Money

### 10.1 Required Tests

```typescript
describe('Money handling', () => {
  it('should store and retrieve amounts without precision loss', async () => {
    // Create order with known amounts
    const order = await createOrder({
      lines: [
        { unitPrice: 19.99, qty: 3 },  // 59.97
        { unitPrice: 0.01, qty: 100 }, // 1.00
      ],
    });
    
    // Verify: 59.97 + 1.00 = 60.97 → 6097 cents
    expect(order.subtotalCents).toBe(6097);
  });
  
  it('should calculate tax correctly', async () => {
    const subtotalCents = 10000;  // $100.00
    const taxRate = 0.0825;       // 8.25%
    
    const taxCents = calculateTax(subtotalCents, taxRate);
    
    // 10000 * 0.0825 = 825 cents = $8.25
    expect(taxCents).toBe(825);
  });
  
  it('should format currency correctly', () => {
    expect(formatCurrency(12345, 'USD')).toBe('$123.45');
    expect(formatCurrency(12345, 'JPY')).toBe('¥12,345');
  });
});
```

---

## 11) Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Do Instead |
|--------------|---------|------------|
| `FLOAT` or `REAL` for money | Precision loss | `BIGINT` or `NUMERIC` |
| Storing display amounts | Rounding inconsistency | Store cents, display later |
| Money without currency | Ambiguous | Always pair amount + currency |
| Calculating in floats | Accumulating errors | Use integer math |
| Different rounding rules | Inconsistent totals | Round once at line level |
| Mixing cents and dollars | Bugs galore | Use `_cents` suffix |

---

## 12) Summary Checklist

- [ ] All money fields use `BIGINT` with `_cents` suffix
- [ ] All money fields have CHECK constraint `>= 0` (or `> 0` for prices)
- [ ] Every money field has associated `currency_code`
- [ ] Conversion functions exist in shared lib
- [ ] Zod schemas validate amounts as integers
- [ ] API returns both cents and display values
- [ ] Formatting uses `Intl.NumberFormat`
- [ ] Tests verify precision and rounding

---

**End of Doc**
