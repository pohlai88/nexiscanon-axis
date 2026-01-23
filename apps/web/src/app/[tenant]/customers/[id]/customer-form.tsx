"use client";

/**
 * Customer Form Component
 *
 * Uses Draft Form pattern for master data editing.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type CustomerStatus = "active" | "inactive";

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  address: Address;
  billingAddress: Address;
  paymentTerms: string;
  creditLimit: number;
  currency: string;
  status: CustomerStatus;
  notes: string;
}

interface CustomerFormProps {
  tenantSlug: string;
  customer: Customer | null;
  isNew: boolean;
}

const STATUS_STYLES: Record<CustomerStatus, { bg: string; text: string }> = {
  active: { bg: "bg-success/20", text: "text-success" },
  inactive: { bg: "bg-muted", text: "text-muted-foreground" },
};

const PAYMENT_TERMS = [
  { value: "immediate", label: "Immediate" },
  { value: "net15", label: "Net 15" },
  { value: "net30", label: "Net 30" },
  { value: "net45", label: "Net 45" },
  { value: "net60", label: "Net 60" },
];

export function CustomerForm({ tenantSlug, customer, isNew }: CustomerFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [status, setStatus] = useState<CustomerStatus>(customer?.status ?? "active");
  const [code, setCode] = useState(customer?.code ?? "");
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [website, setWebsite] = useState(customer?.website ?? "");
  const [taxId, setTaxId] = useState(customer?.taxId ?? "");
  const [paymentTerms, setPaymentTerms] = useState(customer?.paymentTerms ?? "net30");
  const [creditLimit, setCreditLimit] = useState(customer?.creditLimit ?? 0);
  const [notes, setNotes] = useState(customer?.notes ?? "");

  const [address, setAddress] = useState<Address>(
    customer?.address ?? {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
    }
  );

  const [billingAddress, setBillingAddress] = useState<Address>(
    customer?.billingAddress ?? {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
    }
  );

  const [sameAsBilling, setSameAsBilling] = useState(false);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  async function handleSave() {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    router.push(`/${tenantSlug}/customers`);
  }

  function handleCancel() {
    router.push(`/${tenantSlug}/customers`);
  }

  function handleAddressChange(field: keyof Address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (sameAsBilling) {
      setBillingAddress((prev) => ({ ...prev, [field]: value }));
    }
  }

  function handleBillingAddressChange(field: keyof Address, value: string) {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleSameAsBilling(checked: boolean) {
    setSameAsBilling(checked);
    if (checked) {
      setBillingAddress(address);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/${tenantSlug}/customers`}
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
                  {isNew ? "New Customer" : name || "Customer"}
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
                {code || "Enter customer details"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              disabled={isSaving || !name}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "h-9 px-4 py-2",
                "transition-colors duration-200",
                (isSaving || !name) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSaving ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-6 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Basic Information</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="CUST-001"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Customer Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Corporation"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Contact Information</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@acme.com"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-100-1000"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://acme.com"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax ID</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="12-3456789"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Address</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  placeholder="123 Main Street"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    placeholder="New York"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    placeholder="NY"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                    placeholder="10001"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    placeholder="USA"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <h3 className="font-medium">Billing Address</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => handleSameAsBilling(e.target.checked)}
                  className="rounded border-border"
                />
                Same as address
              </label>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  type="text"
                  value={billingAddress.street}
                  onChange={(e) => handleBillingAddressChange("street", e.target.value)}
                  disabled={sameAsBilling}
                  placeholder="123 Main Street"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    sameAsBilling && "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => handleBillingAddressChange("city", e.target.value)}
                    disabled={sameAsBilling}
                    placeholder="New York"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      sameAsBilling && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) => handleBillingAddressChange("state", e.target.value)}
                    disabled={sameAsBilling}
                    placeholder="NY"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      sameAsBilling && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={billingAddress.postalCode}
                    onChange={(e) => handleBillingAddressChange("postalCode", e.target.value)}
                    disabled={sameAsBilling}
                    placeholder="10001"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      sameAsBilling && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={billingAddress.country}
                    onChange={(e) => handleBillingAddressChange("country", e.target.value)}
                    disabled={sameAsBilling}
                    placeholder="USA"
                    className={cn(
                      "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      sameAsBilling && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Financial Settings</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term.value} value={term.value}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit Limit</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value) || 0)}
                  min="0"
                  step="1000"
                  className={cn(
                    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(creditLimit)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">
                Internal notes about this customer
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes..."
                className={cn(
                  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "resize-none"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
