/**
 * Tenant sidebar menu configuration.
 *
 * Pattern: Data-driven menu items for consistency.
 * Mirrors admin menu-items.ts pattern.
 */

export interface MenuItem {
  id: string;
  title: string;
  href: (slug: string) => string;
}

export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

export const tenantMenuItems: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", title: "Dashboard", href: (slug) => `/${slug}` },
    ],
  },
  {
    label: "Sales",
    items: [
      { id: "customers", title: "Customers", href: (slug) => `/${slug}/customers` },
      { id: "invoices", title: "Invoices", href: (slug) => `/${slug}/invoices` },
      { id: "sales-orders", title: "Sales Orders", href: (slug) => `/${slug}/sales-orders` },
    ],
  },
  {
    label: "Purchasing",
    items: [
      { id: "vendors", title: "Vendors", href: (slug) => `/${slug}/vendors` },
      { id: "bills", title: "Bills", href: (slug) => `/${slug}/bills` },
      { id: "purchase-orders", title: "Purchase Orders", href: (slug) => `/${slug}/purchase-orders` },
    ],
  },
  {
    label: "Inventory",
    items: [
      { id: "items", title: "Items", href: (slug) => `/${slug}/items` },
      { id: "stock-moves", title: "Stock Moves", href: (slug) => `/${slug}/stock-moves` },
    ],
  },
  {
    label: "Accounting",
    items: [
      { id: "journals", title: "Journal Entries", href: (slug) => `/${slug}/accounting/journals` },
      { id: "chart-of-accounts", title: "Chart of Accounts", href: (slug) => `/${slug}/accounting/chart-of-accounts` },
      { id: "trial-balance", title: "Trial Balance", href: (slug) => `/${slug}/accounting/trial-balance` },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "settings", title: "General", href: (slug) => `/${slug}/settings` },
      { id: "team", title: "Team", href: (slug) => `/${slug}/settings/team` },
      { id: "billing", title: "Billing", href: (slug) => `/${slug}/settings/billing` },
      { id: "api-keys", title: "API Keys", href: (slug) => `/${slug}/settings/api-keys` },
      { id: "audit-log", title: "Audit Log", href: (slug) => `/${slug}/settings/audit-log` },
    ],
  },
];
