/**
 * Journal Entry List Page (Phase 4)
 *
 * Uses EntityListInspector pattern from @workspace/design-system.
 */

import { Suspense } from "react";
import { JournalList } from "./journal-list";
import { JournalListSkeleton } from "./journal-list-skeleton";

interface JournalListPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JournalListPage({
  params,
  searchParams,
}: JournalListPageProps) {
  const { tenant } = await params;
  const search = await searchParams;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Journal Entries</h1>
          <p className="text-sm text-muted-foreground">
            General ledger journal entries
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<JournalListSkeleton />}>
          <JournalList tenantSlug={tenant} searchParams={search} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Journal Entries",
  description: "Manage general ledger journal entries",
};
