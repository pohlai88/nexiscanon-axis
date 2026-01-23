/**
 * Invoice Form Page (Phase 4)
 *
 * Uses DraftFormPosting + LineEditor patterns from @workspace/design-system.
 * This is the primary invoice creation/edit view.
 */

import { InvoiceForm } from "./invoice-form";

interface InvoicePageProps {
  params: Promise<{ tenant: string; id: string }>;
}

// Mock invoice data
const MOCK_INVOICE = {
  id: "inv-001",
  number: "INV-2024-0001",
  customer: {
    id: "cust-001",
    name: "Acme Corporation",
    email: "billing@acme.com",
  },
  date: "2024-01-15",
  dueDate: "2024-02-15",
  status: "draft" as const,
  currency: "USD",
  lines: [
    {
      id: "line-001",
      description: "Professional Services",
      quantity: 10,
      unitPrice: 100.0,
      amount: 1000.0,
    },
    {
      id: "line-002",
      description: "Travel Expenses",
      quantity: 1,
      unitPrice: 250.0,
      amount: 250.0,
    },
  ],
  subtotal: 1250.0,
  taxRate: 0,
  taxAmount: 0,
  total: 1250.0,
  notes: "",
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { tenant, id } = await params;

  // For demo, handle "new" specially
  const isNew = id === "new";
  const invoice = isNew ? null : MOCK_INVOICE;

  // In real app, would fetch invoice from DB
  // if (!isNew && !invoice) notFound();

  return (
    <div className="h-full flex flex-col">
      <InvoiceForm
        tenantSlug={tenant}
        invoice={invoice}
        isNew={isNew}
      />
    </div>
  );
}

export const metadata = {
  title: "Invoice",
  description: "Create or edit invoice",
};
