"use client";

/**
 * Journal Entry Form Component
 *
 * Implements Pattern #2 (Draft Form + Posting Banner) and Pattern #3 (Line Editor).
 * Critical accounting form - enforces debit = credit balance rule.
 *
 * AXIS Accounting Mantra: "If it doesn't balance, it doesn't exist."
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type JournalStatus = "draft" | "posted" | "reversed";

interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  reference: string;
  status: JournalStatus;
  currency: string;
  lines: JournalLine[];
  notes: string;
}

interface JournalEntryFormProps {
  tenantSlug: string;
  journal: JournalEntry | null;
  isNew: boolean;
}

const STATUS_STYLES: Record<JournalStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground" },
  posted: { bg: "bg-primary/20", text: "text-primary" },
  reversed: { bg: "bg-destructive/20", text: "text-destructive" },
};

// Mock accounts for account picker
const MOCK_ACCOUNTS = [
  { code: "1000", name: "Cash" },
  { code: "1100", name: "Accounts Receivable" },
  { code: "1200", name: "Inventory" },
  { code: "1500", name: "Fixed Assets" },
  { code: "2000", name: "Accounts Payable" },
  { code: "2100", name: "Accrued Liabilities" },
  { code: "3000", name: "Retained Earnings" },
  { code: "4000", name: "Sales Revenue" },
  { code: "5000", name: "Cost of Goods Sold" },
  { code: "6000", name: "Salaries Expense" },
  { code: "6200", name: "Utilities Expense" },
  { code: "6210", name: "Office Supplies Expense" },
];

export function JournalEntryForm({ tenantSlug, journal, isNew }: JournalEntryFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Form state
  const [status, setStatus] = useState<JournalStatus>(journal?.status ?? "draft");
  const [date, setDate] = useState(journal?.date ?? new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(journal?.description ?? "");
  const [reference, setReference] = useState(journal?.reference ?? "");
  const [notes, setNotes] = useState(journal?.notes ?? "");
  const [lines, setLines] = useState<JournalLine[]>(
    journal?.lines ?? [
      { id: crypto.randomUUID(), accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
      { id: crypto.randomUUID(), accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
    ]
  );

  // Calculate totals
  const totals = useMemo(() => {
    const debitTotal = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const creditTotal = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const difference = Math.abs(debitTotal - creditTotal);
    const isBalanced = difference < 0.01; // Allow for floating point precision
    return { debitTotal, creditTotal, difference, isBalanced };
  }, [lines]);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function handleLineChange(
    index: number,
    field: keyof JournalLine,
    value: string | number
  ) {
    const newLines = [...lines];
    const currentLine = newLines[index];
    if (!currentLine) return;

    const line: JournalLine = { ...currentLine };

    if (field === "accountCode") {
      const account = MOCK_ACCOUNTS.find((a) => a.code === value);
      line.accountCode = value as string;
      line.accountName = account?.name ?? "";
    } else if (field === "description") {
      line.description = value as string;
    } else if (field === "debit") {
      line.debit = Number(value) || 0;
      // Clear credit if entering debit
      if (line.debit > 0) line.credit = 0;
    } else if (field === "credit") {
      line.credit = Number(value) || 0;
      // Clear debit if entering credit
      if (line.credit > 0) line.debit = 0;
    }

    newLines[index] = line;
    setLines(newLines);
  }

  function handleAddLine() {
    setLines([
      ...lines,
      { id: crypto.randomUUID(), accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
    ]);
  }

  function handleRemoveLine(index: number) {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  }

  async function handlePost() {
    if (!totals.isBalanced) {
      alert("Cannot post: Entry is not balanced. Debits must equal credits.");
      return;
    }
    setIsPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("posted");
    setIsPosting(false);
  }

  function handleCancel() {
    router.push(`/${tenantSlug}/accounting/journals`);
  }

  const isEditable = status === "draft";
  const canPost = isEditable && totals.isBalanced && lines.some((l) => l.accountCode);

  return (
    <div className="flex h-full flex-col">
      {/* Posting Banner */}
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back + Entity info */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${tenantSlug}/accounting/journals`}
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
                  {isNew ? "New Journal Entry" : journal?.number ?? "Journal Entry"}
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
                {description || "Enter journal entry details"}
              </p>
            </div>
          </div>

          {/* Center: Balance indicator */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Debit</p>
              <p className="text-lg font-semibold font-mono">{formatCurrency(totals.debitTotal)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit</p>
              <p className="text-lg font-semibold font-mono">{formatCurrency(totals.creditTotal)}</p>
            </div>
            <div
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                totals.isBalanced
                  ? "bg-success/20 text-success"
                  : "bg-destructive/20 text-destructive"
              )}
            >
              {totals.isBalanced ? "Balanced" : `Off by ${formatCurrency(totals.difference)}`}
            </div>
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
                  disabled={isPosting || !canPost}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "h-9 px-4 py-2",
                    "transition-colors duration-200",
                    (isPosting || !canPost) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isPosting ? "Posting..." : "Post Entry"}
                </button>
              </>
            )}
            {!isEditable && (
              <span className="text-sm text-muted-foreground">
                This entry has been posted and cannot be edited.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6 space-y-6">
          {/* Entry Details */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Entry Details</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Entry Date <span className="text-destructive">*</span>
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
                <label className="block text-sm font-medium mb-1">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  disabled={!isEditable}
                  placeholder="ACCR-JAN-2024"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    !isEditable && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isEditable}
                  placeholder="Accrued Expenses"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    !isEditable && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Journal Lines (Pattern #3: Line Editor) */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Journal Lines</h3>
                <p className="text-xs text-muted-foreground">
                  "If it doesn&apos;t balance, it doesn&apos;t exist." — AXIS Accounting Mantra
                </p>
              </div>
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
                    <th className="text-left font-medium p-3 w-32">Account</th>
                    <th className="text-left font-medium p-3">Account Name</th>
                    <th className="text-left font-medium p-3">Description</th>
                    <th className="text-right font-medium p-3 w-32">Debit</th>
                    <th className="text-right font-medium p-3 w-32">Credit</th>
                    {isEditable && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.id} className="border-b border-border">
                      <td className="p-2">
                        <select
                          value={line.accountCode}
                          onChange={(e) => handleLineChange(index, "accountCode", e.target.value)}
                          disabled={!isEditable}
                          className={cn(
                            "w-full rounded border-0 bg-transparent px-2 py-1 text-sm font-mono",
                            "focus:outline-none focus:ring-1 focus:ring-primary",
                            !isEditable && "cursor-not-allowed"
                          )}
                        >
                          <option value="">Select...</option>
                          {MOCK_ACCOUNTS.map((account) => (
                            <option key={account.code} value={account.code}>
                              {account.code}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {line.accountName || "—"}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, "description", e.target.value)}
                          disabled={!isEditable}
                          placeholder="Line description..."
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
                          value={line.debit || ""}
                          onChange={(e) => handleLineChange(index, "debit", e.target.value)}
                          disabled={!isEditable}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={cn(
                            "w-full rounded border-0 bg-transparent px-2 py-1 text-sm text-right font-mono",
                            "focus:outline-none focus:ring-1 focus:ring-primary",
                            !isEditable && "cursor-not-allowed",
                            line.debit > 0 && "text-foreground font-medium"
                          )}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.credit || ""}
                          onChange={(e) => handleLineChange(index, "credit", e.target.value)}
                          disabled={!isEditable}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={cn(
                            "w-full rounded border-0 bg-transparent px-2 py-1 text-sm text-right font-mono",
                            "focus:outline-none focus:ring-1 focus:ring-primary",
                            !isEditable && "cursor-not-allowed",
                            line.credit > 0 && "text-foreground font-medium"
                          )}
                        />
                      </td>
                      {isEditable && (
                        <td className="p-2">
                          <button
                            onClick={() => handleRemoveLine(index)}
                            disabled={lines.length <= 2}
                            className={cn(
                              "p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                              "transition-colors",
                              lines.length <= 2 && "opacity-30 cursor-not-allowed"
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
                <tfoot>
                  <tr className="border-t-2 border-border font-semibold">
                    <td colSpan={3} className="p-3 text-right">
                      Totals
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(totals.debitTotal)}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(totals.creditTotal)}
                    </td>
                    {isEditable && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Balance Status */}
            <div className="border-t border-border p-4">
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  totals.isBalanced
                    ? "bg-success/10 border border-success/20"
                    : "bg-destructive/10 border border-destructive/20"
                )}
              >
                {totals.isBalanced ? (
                  <>
                    <svg
                      className="text-success"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    <span className="text-sm text-success font-medium">
                      Entry is balanced — ready to post
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="text-destructive"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span className="text-sm text-destructive font-medium">
                      Entry is unbalanced by {formatCurrency(totals.difference)} — cannot post
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">
                Internal notes for this journal entry
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
