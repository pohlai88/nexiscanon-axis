/**
 * Customer List Page (Phase 4)
 *
 * Uses EntityListInspector pattern from @workspace/design-system.
 */

import { Suspense } from "react";
import { CustomerList } from "./customer-list";
import { CustomerListSkeleton } from "./customer-list-skeleton";

interface CustomerListPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomerListPage({
  params,
  searchParams,
}: CustomerListPageProps) {
  const { tenant } = await params;
  const search = await searchParams;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your customer master data
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<CustomerListSkeleton />}>
          <CustomerList tenantSlug={tenant} searchParams={search} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Customers",
  description: "Manage customer master data",
};
