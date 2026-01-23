/**
 * Customer Form Page (Phase 4)
 *
 * Uses DraftForm pattern from @workspace/design-system.
 */

import { CustomerForm } from "./customer-form";

interface CustomerPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

// Mock customer data
const MOCK_CUSTOMER = {
  id: "cust-001",
  code: "CUST-001",
  name: "Acme Corporation",
  email: "billing@acme.com",
  phone: "+1 555-100-1000",
  website: "https://acme.com",
  taxId: "12-3456789",
  address: {
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  },
  billingAddress: {
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  },
  paymentTerms: "net30",
  creditLimit: 50000,
  currency: "USD",
  status: "active" as const,
  notes: "Key account - priority support",
};

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { tenant, id } = await params;

  const isNew = id === "new";
  const customer = isNew ? null : MOCK_CUSTOMER;

  return (
    <div className="h-full flex flex-col">
      <CustomerForm
        tenantSlug={tenant}
        customer={customer}
        isNew={isNew}
      />
    </div>
  );
}

export const metadata = {
  title: "Customer",
  description: "Create or edit customer",
};
