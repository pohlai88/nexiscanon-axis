/**
 * Loading Skeleton Pattern
 * 
 * Reference implementation showing:
 * - Skeleton loading states
 * - Proper animation usage
 * - Semantic structure
 * - Responsive layouts
 * 
 * Usage: Copy relevant skeletons to your components
 */

import { Card } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

// Base skeleton component
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        "transition-opacity duration-300",
        className
      )}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </Card>
  );
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b py-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-24" />
      </div>
    </Card>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Full Page Skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <ListSkeleton count={5} />
        </Card>
      </div>
    </div>
  );
}

// Usage Example Component
export function LoadingSkeletonPattern({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <Card className="p-6">
          <ListSkeleton count={5} />
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Key Patterns Demonstrated:
// 1. Use cn() for conditional styling
// 2. Use semantic tokens (bg-muted)
// 3. Use transition-opacity duration-300 for smooth appearance
// 4. Structure skeletons to match actual content layout
// 5. Make skeletons responsive with same breakpoints as content
