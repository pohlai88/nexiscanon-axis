import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for settings pages.
 */
export default function SettingsLoading() {
  return (
    <div>
      {/* Title */}
      <Skeleton className="h-9 w-32 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />

      {/* Sections */}
      <div className="space-y-6">
        <div className="p-6 bg-[var(--muted)] rounded-xl">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-[var(--muted)] rounded-xl">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
