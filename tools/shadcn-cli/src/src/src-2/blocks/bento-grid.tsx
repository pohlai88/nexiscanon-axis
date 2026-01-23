import { Card } from '@workspace/design-system/components/card';
import { cn } from '@workspace/design-system/lib/utils';
import React from 'react';

export interface BentoGridItem {
  title: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export interface BentoGridProps {
  items: BentoGridItem[];
  className?: string;
}

/**
 * Bento Grid
 *
 * A flexible, responsive grid layout component inspired by Apple's Bento design.
 * Creates dynamic, visually appealing layouts with variable-sized cards.
 *
 * Features:
 * - Responsive masonry-style grid
 * - Variable card sizes via className
 * - Optional header content (images, videos, graphics)
 * - Icon support
 * - Smooth hover animations
 *
 * @meta
 * - Category: Layout
 * - Section: bento-grid
 * - Use Cases: Feature showcases, Portfolio grids, Dashboard layouts, Product displays
 *
 * @example
 * ```tsx
 * <BentoGrid items={[
 *   {
 *     title: "AI Integration",
 *     description: "Powerful AI features",
 *     header: <ImageComponent />,
 *     icon: <Sparkles />,
 *     className: "md:col-span-2", // Makes this card 2x wider
 *   },
 *   {
 *     title: "Real-time Analytics",
 *     description: "Track performance",
 *     className: "md:row-span-2", // Makes this card 2x taller
 *   },
 * ]} />
 * ```
 */
export function BentoGrid({ items, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item, idx) => (
        <BentoGridItem key={idx} {...item} />
      ))}
    </div>
  );
}

function BentoGridItem({
  title,
  description,
  header,
  icon,
  className,
}: BentoGridItem) {
  return (
    <Card
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg',
        'border-border/50 bg-card',
        className,
      )}
    >
      {/* Header Content (Images, Graphics, etc.) */}
      {header && (
        <div className="bg-muted/30 flex h-full w-full flex-1 items-center justify-center overflow-hidden rounded-t-lg">
          {header}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-2 p-6">
        {icon && (
          <div className="bg-primary/10 text-primary mb-2 flex h-10 w-10 items-center justify-center rounded-md">
            {icon}
          </div>
        )}
        <h3 className="group-hover:text-primary text-lg font-semibold tracking-tight transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
      </div>
    </Card>
  );
}

/**
 * Bento Grid Container
 *
 * A semantic wrapper for Bento Grid layouts with proper spacing and max-width.
 */
export function BentoGridContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('w-full py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}

/**
 * Predefined Bento Grid Layouts
 */
export const BentoLayouts = {
  /**
   * Feature Showcase Layout
   * Large hero item + smaller supporting items
   */
  featureShowcase: (items: BentoGridItem[]) => {
    const layoutItems = items.map((item, idx) => ({
      ...item,
      className: cn(
        item.className,
        idx === 0 && 'md:col-span-2 md:row-span-2', // Hero item
        idx === 1 && 'md:col-span-2',
        idx === 2 && 'md:row-span-2',
      ),
    }));
    return layoutItems;
  },

  /**
   * Masonry Layout
   * Mixed heights for visual interest
   */
  masonry: (items: BentoGridItem[]) => {
    const heights = ['md:row-span-1', 'md:row-span-2', 'md:row-span-1'];
    return items.map((item, idx) => ({
      ...item,
      className: cn(item.className, heights[idx % heights.length]),
    }));
  },

  /**
   * Uniform Grid
   * All items same size
   */
  uniform: (items: BentoGridItem[]) => items,
};
