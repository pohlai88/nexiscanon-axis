import { Skeleton } from "@workspace/design-system";

/**
 * Loading state for admin config page.
 */
export default function AdminConfigLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-72 mb-8" />

      {/* Config cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-muted rounded-xl animate-pulse"
          >
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
