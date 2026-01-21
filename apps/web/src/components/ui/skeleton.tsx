/**
 * Skeleton loading component.
 * 
 * Pattern: Use for loading states to prevent layout shift.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--muted)] rounded ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Text skeleton with realistic line height.
 */
export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton.
 */
export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

/**
 * Card skeleton.
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-6 bg-[var(--muted)] rounded-xl ${className}`}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <SkeletonText lines={2} />
    </div>
  );
}

/**
 * Table row skeleton.
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-[var(--border)]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
