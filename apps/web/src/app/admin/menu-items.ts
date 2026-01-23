/**
 * Admin sidebar menu configuration.
 *
 * Pattern: Data-driven menu items for consistency.
 * Inspired by Modernize template MenuItems pattern.
 */

export interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
}

export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

export const adminMenuItems: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", title: "Dashboard", href: "/admin" },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "tenants", title: "Tenants", href: "/admin/tenants" },
      { id: "users", title: "Users", href: "/admin/users" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "config", title: "Configuration", href: "/admin/config" },
    ],
  },
];
