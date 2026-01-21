import { Skeleton, SkeletonTableRow } from "@/components/ui/skeleton";

/**
 * Loading state for team page.
 */
export default function TeamLoading() {
  return (
    <div>
      {/* Title */}
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />

      {/* Invite form skeleton */}
      <div className="bg-[var(--muted)] rounded-lg p-6 mb-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex gap-4">
          <div className="flex-1">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="w-32">
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-end">
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      {/* Members table skeleton */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-left px-6 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left px-6 py-3">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="text-left px-6 py-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRow columns={4} />
            <SkeletonTableRow columns={4} />
            <SkeletonTableRow columns={4} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
