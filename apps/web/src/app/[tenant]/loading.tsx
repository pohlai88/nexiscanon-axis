import { SkeletonCard } from "@/components/ui/skeleton";

/**
 * Loading state for tenant dashboard.
 */
export default function TenantLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <div className="h-9 w-48 bg-[var(--muted)] rounded animate-pulse mb-2" />
      <div className="h-5 w-64 bg-[var(--muted)] rounded animate-pulse mb-8" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Quick actions skeleton */}
      <div className="bg-[var(--muted)] rounded-xl p-6">
        <div className="h-6 w-32 bg-[var(--background)] rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--background)] rounded-lg">
            <div className="h-5 w-24 bg-[var(--muted)] rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-[var(--muted)] rounded animate-pulse" />
          </div>
          <div className="p-4 bg-[var(--background)] rounded-lg">
            <div className="h-5 w-24 bg-[var(--muted)] rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-[var(--muted)] rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
