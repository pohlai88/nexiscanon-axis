"use client";

/**
 * Customer List Component
 *
 * Uses EntityListInspector pattern from @workspace/design-system.
 */

import { useState } from "react";
import Link from "next/link";

// Inline cn utility
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Mock customer data
interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: "active" | "inactive";
  balance: number;
  currency: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    code: "CUST-001",
    name: "Acme Corporation",
    email: "billing@acme.com",
    phone: "+1 555-100-1000",
    city: "New York",
    country: "USA",
    status: "active",
    balance: 15250.0,
    currency: "USD",
  },
  {
    id: "cust-002",
    code: "CUST-002",
    name: "TechStart Inc",
    email: "accounts@techstart.io",
    phone: "+1 555-200-2000",
    city: "San Francisco",
    country: "USA",
    status: "active",
    balance: 8420.5,
    currency: "USD",
  },
  {
    id: "cust-003",
    code: "CUST-003",
    name: "Global Supplies Ltd",
    email: "finance@globalsupplies.co.uk",
    phone: "+44 20 7123 4567",
    city: "London",
    country: "UK",
    status: "active",
    balance: 0,
    currency: "USD",
  },
  {
    id: "cust-004",
    code: "CUST-004",
    name: "Smith & Associates",
    email: "ar@smithassoc.com",
    phone: "+1 555-400-4000",
    city: "Chicago",
    country: "USA",
    status: "inactive",
    balance: 0,
    currency: "USD",
  },
  {
    id: "cust-005",
    code: "CUST-005",
    name: "Metro Services",
    email: "billing@metroservices.com",
    phone: "+1 555-500-5000",
    city: "Miami",
    country: "USA",
    status: "active",
    balance: 3100.0,
    currency: "USD",
  },
];

const STATUS_STYLES: Record<Customer["status"], string> = {
  active: "bg-success/20 text-success",
  inactive: "bg-muted text-muted-foreground",
};

interface CustomerListProps {
  tenantSlug: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function CustomerList({ tenantSlug, searchParams: _searchParams }: CustomerListProps) {
  // TODO: Use searchParams for filtering in Phase 4.1
  void _searchParams;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const selectedCustomer = MOCK_CUSTOMERS.find((c) => c.id === selectedId);

  function handleRowClick(customer: Customer) {
    setSelectedId(customer.id);
    setIsInspectorOpen(true);
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }

  return (
    <div className="flex h-full gap-4">
      {/* Main List */}
      <div className={cn("flex-1 flex flex-col", isInspectorOpen && "lg:mr-80")}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {MOCK_CUSTOMERS.length} customers
            </span>
          </div>
          <Link
            href={`/${tenantSlug}/customers/new`}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "h-9 px-4 py-2",
              "transition-colors duration-200"
            )}
          >
            + New Customer
          </Link>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur">
              <tr className="border-b border-border">
                <th className="text-left font-medium p-3">Code</th>
                <th className="text-left font-medium p-3">Name</th>
                <th className="text-left font-medium p-3">Email</th>
                <th className="text-left font-medium p-3">Location</th>
                <th className="text-right font-medium p-3">Balance</th>
                <th className="text-center font-medium p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CUSTOMERS.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => handleRowClick(customer)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors duration-150",
                    "hover:bg-muted/50",
                    selectedId === customer.id && "ring-2 ring-primary ring-inset bg-primary/5"
                  )}
                >
                  <td className="p-3">
                    <Link
                      href={`/${tenantSlug}/customers/${customer.id}`}
                      className="font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {customer.code}
                    </Link>
                  </td>
                  <td className="p-3 font-medium">{customer.name}</td>
                  <td className="p-3 text-muted-foreground">{customer.email}</td>
                  <td className="p-3 text-muted-foreground">
                    {customer.city}, {customer.country}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(customer.balance, customer.currency)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        STATUS_STYLES[customer.status]
                      )}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Drawer */}
      {isInspectorOpen && selectedCustomer && (
        <div className="hidden lg:block fixed right-0 top-14 bottom-0 w-80 border-l border-border bg-background overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{selectedCustomer.name}</h2>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Close inspector"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Code */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Customer Code
              </label>
              <p className="font-medium font-mono">{selectedCustomer.code}</p>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Status
              </label>
              <p>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    STATUS_STYLES[selectedCustomer.status]
                  )}
                >
                  {selectedCustomer.status}
                </span>
              </p>
            </div>

            {/* Contact */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Email
              </label>
              <p className="font-medium">{selectedCustomer.email}</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Phone
              </label>
              <p className="font-medium">{selectedCustomer.phone}</p>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Location
              </label>
              <p className="font-medium">
                {selectedCustomer.city}, {selectedCustomer.country}
              </p>
            </div>

            {/* Balance */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Outstanding Balance
              </label>
              <p className="text-2xl font-semibold">
                {formatCurrency(selectedCustomer.balance, selectedCustomer.currency)}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border space-y-2">
              <Link
                href={`/${tenantSlug}/customers/${selectedCustomer.id}`}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "h-9 px-4 py-2",
                  "transition-colors duration-200"
                )}
              >
                Edit Customer
              </Link>
              <Link
                href={`/${tenantSlug}/invoices?customer=${selectedCustomer.id}`}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "border border-border bg-background hover:bg-muted",
                  "h-9 px-4 py-2",
                  "transition-colors duration-200"
                )}
              >
                View Invoices
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
