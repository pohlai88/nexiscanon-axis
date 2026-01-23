"use client";

/**
 * Invoice Form Component
 *
 * Uses DraftFormPosting + LineEditor patterns.
 * Implements Pattern #2 (Draft Form + Posting Banner) and Pattern #3 (Line Editor).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Inline cn utility
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type DocumentState = "draft" | "submitted" | "approved" | "posted" | "reversed";

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  number: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  date: string;
  dueDate: string;
  status: DocumentState;
  currency: string;
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
}

interface InvoiceFormProps {
  tenantSlug: string;
  invoice: Invoice | null;
  isNew: boolean;
}

const STATUS_STYLES: Record<DocumentState, { bg: string; text: string }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground" },
  submitted: { bg: "bg-warning/20", text: "text-warning" },
  approved: { bg: "bg-success/20", text: "text-success" },
  posted: { bg: "bg-primary/20", text: "text-primary" },
  reversed: { bg: "bg-destructive/20", text: "text-destructive" },
};

export function InvoiceForm({ tenantSlug, invoice, isNew }: InvoiceFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Form state
  const [status, setStatus] = useState<DocumentState>(invoice?.status ?? "draft");
  const [customer, setCustomer] = useState(invoice?.customer?.name ?? "");
  const [date, setDate] = useState(invoice?.date ?? new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? "");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [lines, setLines] = useState<InvoiceLine[]>(
    invoice?.lines ?? [
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]
  );

  // Calculate totals
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const taxRate = 0;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function handleLineChange(index: number, field: keyof InvoiceLine, value: string | number) {
    const newLines = [...lines];
    const currentLine = newLines[index];
    if (!currentLine) return;

    const line: InvoiceLine = {
      id: currentLine.id,
      description: currentLine.description,
      quantity: currentLine.quantity,
      unitPrice: currentLine.unitPrice,
      amount: currentLine.amount,
    };

    if (field === "description") {
      line.description = value as string;
    } else if (field === "quantity") {
      line.quantity = Number(value) || 0;
      line.amount = line.quantity * line.unitPrice;
    } else if (field === "unitPrice") {
      line.unitPrice = Number(value) || 0;
      line.amount = line.quantity * line.unitPrice;
    }

    newLines[index] = line;
    setLines(newLines);
  }

  function handleAddLine() {
    setLines([
      ...lines,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  }

  function handleRemoveLine(index: number) {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }

  async function handleSave() {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  }

  async function handlePost() {
    setIsPosting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("posted");
    setIsPosting(false);
  }

  function handleCancel() {
    router.push(`/${tenantSlug}/invoices`);
  }

  const isEditable = status === "draft";

  return (
    <div className="flex h-full flex-col">
      {/* Posting Banner (Pattern #2 Header) */}
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back + Entity info */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${tenantSlug}/invoices`}
              className="p-2 rounded-md hover:bg-muted transition-colors"
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
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {isNew ? "New Invoice" : invoice?.number ?? "Invoice"}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize",
                    STATUS_STYLES[status].bg,
                    STATUS_STYLES[status].text
                  )}
                >
                  {status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {customer || "Select customer"}
              </p>
            </div>
          </div>

          {/* Center: Total */}
          <div className="hidden md:block text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-xl font-semibold">{formatCurrency(total)}</p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isEditable && (
              <>
                <button
                  onClick={handleCancel}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium",
                    "border border-border bg-background hover:bg-muted",
                    "h-9 px-4 py-2",
                    "transition-colors duration-200"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium",
                    "border border-border bg-background hover:bg-muted",
                    "h-9 px-4 py-2",
                    "transition-colors duration-200",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSaving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={handlePost}
                  disabled={isPosting || lines.length === 0 || !customer}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "h-9 px-4 py-2",
                    "transition-colors duration-200",
                    (isPosting || lines.length === 0 || !customer) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isPosting ? "Posting..." : "Post Invoice"}
                </button>
              </>
            )}
            {!isEditable && (
              <span className="text-sm text-muted-foreground">
                This invoice has been posted and cannot be edited.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-6 space-y-6">
          {/* Customer Section */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Customer</h3>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                disabled={!isEditable}
                placeholder="Search or select customer..."
                className={cn(
                  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  !isEditable && "opacity-50 cursor-not-allowed"
                )}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                EntityPicker integration coming in Phase 4.1
              </p>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Invoice Details</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!isEditable}
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    !isEditable && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!isEditable}
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    !isEditable && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Line Items Section (Pattern #3: Line Editor) */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <h3 className="font-medium">Line Items</h3>
              {isEditable && (
                <button
                  onClick={handleAddLine}
                  className="text-sm text-primary hover:underline"
                >
                  + Add Line
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium p-3">Description</th>
                    <th className="text-right font-medium p-3 w-24">Qty</th>
                    <th className="text-right font-medium p-3 w-32">Unit Price</th>
                    <th className="text-right font-medium p-3 w-32">Amount</th>
                    {isEditable && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.id} className="border-b border-border">
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, "description", e.target.value)}
                          disabled={!isEditable}
                          placeholder="Item description..."
                          className={cn(
                            "w-full rounded border-0 bg-transparent px-2 py-1 text-sm",
                            "focus:outline-none focus:ring-1 focus:ring-primary",
                            !isEditable && "cursor-not-allowed"
                          )}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(index, "quantity", e.target.value)}
                          disabled={!isEditable}
                          min="0"
                          step="1"
                          className={cn(
                            "w-full rounded border-0 bg-transparent px-2 py-1 text-sm text-right",
                            "focus:outline-none focus:ring-1 focus:ring-primary",
                            !isEditable && "cursor-not-allowed"
                          )}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(index, "unitPrice", e.target.value)}
                          disabled={!isEditable}
                          min="0"
                          step="0.01"
                          className={cn(
                            "w-full rounded border-0 bg-transparent px-2 py-1 text-sm text-right",
                            "focus:outline-none focus:ring-1 focus:ring-primary",
                            !isEditable && "cursor-not-allowed"
                          )}
                        />
                      </td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(line.amount)}
                      </td>
                      {isEditable && (
                        <td className="p-2">
                          <button
                            onClick={() => handleRemoveLine(index)}
                            disabled={lines.length === 1}
                            className={cn(
                              "p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                              "transition-colors",
                              lines.length === 1 && "opacity-30 cursor-not-allowed"
                            )}
                            aria-label="Remove line"
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-border p-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (0%)</span>
                    <span className="font-mono">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">
                Internal notes (not visible to customer)
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isEditable}
                rows={3}
                placeholder="Add notes..."
                className={cn(
                  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "resize-none",
                  !isEditable && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
