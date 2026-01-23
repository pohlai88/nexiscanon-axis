/**
 * Invoice List Page (Phase 4)
 *
 * Uses EntityListInspector pattern from @workspace/design-system.
 * This is the primary invoice list view with inspector drawer.
 */

import { Suspense } from "react";
import { InvoiceList } from "./invoice-list";
import { InvoiceListSkeleton } from "./invoice-list-skeleton";

interface InvoiceListPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvoiceListPage({
  params,
  searchParams,
}: InvoiceListPageProps) {
  const { tenant } = await params;
  const search = await searchParams;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer invoices and track payments
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<InvoiceListSkeleton />}>
          <InvoiceList tenantSlug={tenant} searchParams={search} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Invoices",
  description: "Manage customer invoices",
};
