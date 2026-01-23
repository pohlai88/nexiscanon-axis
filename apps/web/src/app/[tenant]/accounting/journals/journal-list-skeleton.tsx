/**
 * Journal List Skeleton
 */

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

export function JournalListSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/50">
            <tr className="border-b border-border">
              <th className="text-left font-medium p-3">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="text-left font-medium p-3">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left font-medium p-3">
                <Skeleton className="h-4 w-28" />
              </th>
              <th className="text-right font-medium p-3">
                <Skeleton className="h-4 w-20 ml-auto" />
              </th>
              <th className="text-right font-medium p-3">
                <Skeleton className="h-4 w-20 ml-auto" />
              </th>
              <th className="text-center font-medium p-3">
                <Skeleton className="h-4 w-16 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                <td className="p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-5 w-16 rounded-full mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
