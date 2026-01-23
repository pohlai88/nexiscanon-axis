/**
 * Admin pages loading state.
 *
 * Pattern: Shows skeleton for admin dashboard.
 */
export default function AdminLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
      <div className="h-5 w-64 bg-muted rounded animate-pulse mb-8" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-muted rounded-xl animate-pulse"
          >
            <div className="h-4 w-20 bg-background rounded mb-2" />
            <div className="h-8 w-16 bg-background rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-muted rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-6 w-32 bg-background rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 border-b border-border last:border-0"
          >
            <div className="h-5 w-full bg-background rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
