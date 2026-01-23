import { Skeleton } from "@workspace/design-system";
import { TableRowSkeleton } from "@workspace/design-system/patterns";

/**
 * Loading state for admin users page.
 */
export default function AdminUsersLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-24 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-muted rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="text-left p-4">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="text-left p-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left p-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left p-4">
                <Skeleton className="h-4 w-14" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
