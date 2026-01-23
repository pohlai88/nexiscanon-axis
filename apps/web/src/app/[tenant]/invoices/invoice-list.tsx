"use client";

/**
 * Invoice List Component
 *
 * Uses EntityListInspector pattern from @workspace/design-system.
 */

import { useState } from "react";
import Link from "next/link";
import { cn } from "@workspace/design-system";

// Mock invoice data for Phase 4 demo
interface Invoice {
  id: string;
  number: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "draft" | "submitted" | "approved" | "posted" | "reversed";
  currency: string;
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    number: "INV-2024-0001",
    customer: "Acme Corporation",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    amount: 1250.0,
    status: "posted",
    currency: "USD",
  },
  {
    id: "inv-002",
    number: "INV-2024-0002",
    customer: "TechStart Inc",
    date: "2024-01-18",
    dueDate: "2024-02-18",
    amount: 3420.5,
    status: "approved",
    currency: "USD",
  },
  {
    id: "inv-003",
    number: "INV-2024-0003",
    customer: "Global Supplies Ltd",
    date: "2024-01-20",
    dueDate: "2024-02-20",
    amount: 890.0,
    status: "submitted",
    currency: "USD",
  },
  {
    id: "inv-004",
    number: "INV-2024-0004",
    customer: "Smith & Associates",
    date: "2024-01-22",
    dueDate: "2024-02-22",
    amount: 5675.25,
    status: "draft",
    currency: "USD",
  },
  {
    id: "inv-005",
    number: "INV-2024-0005",
    customer: "Metro Services",
    date: "2024-01-25",
    dueDate: "2024-02-25",
    amount: 2100.0,
    status: "reversed",
    currency: "USD",
  },
];

const STATUS_STYLES: Record<Invoice["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  posted: "bg-primary/20 text-primary",
  reversed: "bg-destructive/20 text-destructive",
};

const ROW_STYLES: Record<Invoice["status"], string> = {
  draft: "bg-muted/30 border-l-2 border-l-muted-foreground",
  submitted: "bg-warning/10 border-l-2 border-l-warning",
  approved: "bg-success/10 border-l-2 border-l-success",
  posted: "bg-background border-l-2 border-l-primary",
  reversed: "bg-destructive/10 border-l-2 border-l-destructive",
};

interface InvoiceListProps {
  tenantSlug: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function InvoiceList({ tenantSlug, searchParams: _searchParams }: InvoiceListProps) {
  // TODO: Use searchParams for filtering in Phase 4.1
  void _searchParams;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const selectedInvoice = MOCK_INVOICES.find((inv) => inv.id === selectedId);

  function handleRowClick(invoice: Invoice) {
    setSelectedId(invoice.id);
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
            {/* Filter chips would go here */}
            <span className="text-sm text-muted-foreground">
              {MOCK_INVOICES.length} invoices
            </span>
          </div>
          <Link
            href={`/${tenantSlug}/invoices/new`}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "h-9 px-4 py-2",
              "transition-colors duration-200"
            )}
          >
            + New Invoice
          </Link>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur">
              <tr className="border-b border-border">
                <th className="text-left font-medium p-3">Invoice #</th>
                <th className="text-left font-medium p-3">Customer</th>
                <th className="text-left font-medium p-3">Date</th>
                <th className="text-left font-medium p-3">Due Date</th>
                <th className="text-right font-medium p-3">Amount</th>
                <th className="text-center font-medium p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => handleRowClick(invoice)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors duration-150",
                    ROW_STYLES[invoice.status],
                    selectedId === invoice.id && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <td className="p-3">
                    <Link
                      href={`/${tenantSlug}/invoices/${invoice.id}`}
                      className="font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="p-3">{invoice.customer}</td>
                  <td className="p-3 text-muted-foreground">{invoice.date}</td>
                  <td className="p-3 text-muted-foreground">{invoice.dueDate}</td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        STATUS_STYLES[invoice.status]
                      )}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Drawer (Zone 3) */}
      {isInspectorOpen && selectedInvoice && (
        <div className="hidden lg:block fixed right-0 top-14 bottom-0 w-80 border-l border-border bg-background overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{selectedInvoice.number}</h2>
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
            {/* Customer */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Customer
              </label>
              <p className="font-medium">{selectedInvoice.customer}</p>
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
                    STATUS_STYLES[selectedInvoice.status]
                  )}
                >
                  {selectedInvoice.status}
                </span>
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Invoice Date
                </label>
                <p className="font-medium">{selectedInvoice.date}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Due Date
                </label>
                <p className="font-medium">{selectedInvoice.dueDate}</p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Amount
              </label>
              <p className="text-2xl font-semibold">
                {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border space-y-2">
              <Link
                href={`/${tenantSlug}/invoices/${selectedInvoice.id}`}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "h-9 px-4 py-2",
                  "transition-colors duration-200"
                )}
              >
                Open Invoice
              </Link>
              <button
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "border border-border bg-background hover:bg-muted",
                  "h-9 px-4 py-2",
                  "transition-colors duration-200"
                )}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
