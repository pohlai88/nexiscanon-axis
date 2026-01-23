"use client";

/**
 * Journal Entry List Component
 *
 * Uses EntityListInspector pattern.
 */

import { useState } from "react";
import Link from "next/link";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type JournalStatus = "draft" | "posted" | "reversed";

interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  debitTotal: number;
  creditTotal: number;
  status: JournalStatus;
  currency: string;
  lines: number;
}

const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: "je-001",
    number: "JE-2024-0001",
    date: "2024-01-15",
    description: "Opening Balance Entry",
    debitTotal: 100000.0,
    creditTotal: 100000.0,
    status: "posted",
    currency: "USD",
    lines: 4,
  },
  {
    id: "je-002",
    number: "JE-2024-0002",
    date: "2024-01-20",
    description: "Depreciation - Jan 2024",
    debitTotal: 2500.0,
    creditTotal: 2500.0,
    status: "posted",
    currency: "USD",
    lines: 2,
  },
  {
    id: "je-003",
    number: "JE-2024-0003",
    date: "2024-01-25",
    description: "Accrued Expenses",
    debitTotal: 8750.0,
    creditTotal: 8750.0,
    status: "draft",
    currency: "USD",
    lines: 3,
  },
  {
    id: "je-004",
    number: "JE-2024-0004",
    date: "2024-01-28",
    description: "Intercompany Transfer",
    debitTotal: 50000.0,
    creditTotal: 50000.0,
    status: "posted",
    currency: "USD",
    lines: 2,
  },
  {
    id: "je-005",
    number: "JE-2024-0005",
    date: "2024-01-30",
    description: "Correction Entry",
    debitTotal: 1200.0,
    creditTotal: 1200.0,
    status: "reversed",
    currency: "USD",
    lines: 2,
  },
];

const STATUS_STYLES: Record<JournalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  posted: "bg-primary/20 text-primary",
  reversed: "bg-destructive/20 text-destructive",
};

const ROW_STYLES: Record<JournalStatus, string> = {
  draft: "bg-muted/30 border-l-2 border-l-muted-foreground",
  posted: "bg-background border-l-2 border-l-primary",
  reversed: "bg-destructive/10 border-l-2 border-l-destructive",
};

interface JournalListProps {
  tenantSlug: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function JournalList({ tenantSlug, searchParams: _searchParams }: JournalListProps) {
  // TODO: Use searchParams for filtering in Phase 4.1
  void _searchParams;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const selectedJournal = MOCK_JOURNALS.find((j) => j.id === selectedId);

  function handleRowClick(journal: JournalEntry) {
    setSelectedId(journal.id);
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
              {MOCK_JOURNALS.length} journal entries
            </span>
          </div>
          <Link
            href={`/${tenantSlug}/accounting/journals/new`}
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "h-9 px-4 py-2",
              "transition-colors duration-200"
            )}
          >
            + New Journal Entry
          </Link>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur">
              <tr className="border-b border-border">
                <th className="text-left font-medium p-3">Entry #</th>
                <th className="text-left font-medium p-3">Date</th>
                <th className="text-left font-medium p-3">Description</th>
                <th className="text-right font-medium p-3">Debit</th>
                <th className="text-right font-medium p-3">Credit</th>
                <th className="text-center font-medium p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_JOURNALS.map((journal) => (
                <tr
                  key={journal.id}
                  onClick={() => handleRowClick(journal)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors duration-150",
                    ROW_STYLES[journal.status],
                    selectedId === journal.id && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <td className="p-3">
                    <Link
                      href={`/${tenantSlug}/accounting/journals/${journal.id}`}
                      className="font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {journal.number}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{journal.date}</td>
                  <td className="p-3">{journal.description}</td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(journal.debitTotal, journal.currency)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(journal.creditTotal, journal.currency)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        STATUS_STYLES[journal.status]
                      )}
                    >
                      {journal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Drawer */}
      {isInspectorOpen && selectedJournal && (
        <div className="hidden lg:block fixed right-0 top-14 bottom-0 w-80 border-l border-border bg-background overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{selectedJournal.number}</h2>
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
            {/* Description */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Description
              </label>
              <p className="font-medium">{selectedJournal.description}</p>
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
                    STATUS_STYLES[selectedJournal.status]
                  )}
                >
                  {selectedJournal.status}
                </span>
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Entry Date
              </label>
              <p className="font-medium">{selectedJournal.date}</p>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Debit
                </label>
                <p className="text-lg font-semibold font-mono">
                  {formatCurrency(selectedJournal.debitTotal, selectedJournal.currency)}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Credit
                </label>
                <p className="text-lg font-semibold font-mono">
                  {formatCurrency(selectedJournal.creditTotal, selectedJournal.currency)}
                </p>
              </div>
            </div>

            {/* Balance Check */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                {selectedJournal.debitTotal === selectedJournal.creditTotal ? (
                  <>
                    <svg
                      className="text-success"
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    <span className="text-sm text-success font-medium">
                      Entry is balanced
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="text-destructive"
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                    <span className="text-sm text-destructive font-medium">
                      Entry is unbalanced
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Lines count */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">
                Line Items
              </label>
              <p className="font-medium">{selectedJournal.lines} lines</p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border space-y-2">
              <Link
                href={`/${tenantSlug}/accounting/journals/${selectedJournal.id}`}
                className={cn(
                  "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "h-9 px-4 py-2",
                  "transition-colors duration-200"
                )}
              >
                {selectedJournal.status === "draft" ? "Edit Entry" : "View Entry"}
              </Link>
              {selectedJournal.status === "posted" && (
                <button
                  className={cn(
                    "w-full inline-flex items-center justify-center rounded-md text-sm font-medium",
                    "border border-destructive text-destructive hover:bg-destructive/10",
                    "h-9 px-4 py-2",
                    "transition-colors duration-200"
                  )}
                >
                  Reverse Entry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
