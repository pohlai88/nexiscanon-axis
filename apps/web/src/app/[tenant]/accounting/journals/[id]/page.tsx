/**
 * Journal Entry Form Page (Phase 4)
 *
 * Uses DraftFormPosting + LineEditor patterns.
 * Critical accounting pattern - must balance debits and credits.
 */

import { JournalEntryForm } from "./journal-entry-form";

interface JournalEntryPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

// Mock journal entry data
const MOCK_JOURNAL = {
  id: "je-003",
  number: "JE-2024-0003",
  date: "2024-01-25",
  description: "Accrued Expenses",
  reference: "ACCR-JAN-2024",
  status: "draft" as const,
  currency: "USD",
  lines: [
    {
      id: "line-001",
      accountCode: "6200",
      accountName: "Utilities Expense",
      description: "January electricity accrual",
      debit: 2500.0,
      credit: 0,
    },
    {
      id: "line-002",
      accountCode: "6210",
      accountName: "Office Supplies Expense",
      description: "Office supplies accrual",
      debit: 1250.0,
      credit: 0,
    },
    {
      id: "line-003",
      accountCode: "2100",
      accountName: "Accrued Liabilities",
      description: "Accrued expenses",
      debit: 0,
      credit: 3750.0,
    },
  ],
  notes: "Monthly accrual entry for January 2024",
};

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { tenant, id } = await params;

  const isNew = id === "new";
  const journal = isNew ? null : MOCK_JOURNAL;

  return (
    <div className="h-full flex flex-col">
      <JournalEntryForm
        tenantSlug={tenant}
        journal={journal}
        isNew={isNew}
      />
    </div>
  );
}

export const metadata = {
  title: "Journal Entry",
  description: "Create or edit journal entry",
};
