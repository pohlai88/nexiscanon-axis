import React from "react";
import { Card, CardContent } from "@workspace/design-system/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/design-system/components/avatar";
import { cn } from "@workspace/design-system/lib/utils";

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/**
 * Animated Timeline
 * 
 * Vertical timeline component with smooth scroll animations.
 * Perfect for company history, roadmaps, or process flows.
 * 
 * Features:
 * - Alternating left/right layout
 * - Animated line connection
 * - Icon/Image support
 * - Scroll-triggered animations
 * - Responsive mobile stack
 * 
 * @meta
 * - Category: Content
 * - Section: timeline
 * - Use Cases: Company history, Product roadmap, Process steps, Event timelines
 */
export function AnimatedTimeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative w-full py-12", className)}>
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border md:block hidden" />

      {/* Timeline Items */}
      <div className="space-y-12">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              "relative grid gap-8 md:grid-cols-2",
              idx % 2 === 0 ? "md:text-right" : "md:flex-row-reverse"
            )}
          >
            {/* Content Card */}
            <div
              className={cn(
                "flex flex-col",
                idx % 2 === 0 ? "md:items-end" : "md:col-start-2"
              )}
            >
              <Card className="group w-full transition-all hover:shadow-lg md:max-w-md">
                <CardContent className="p-6">
                  {/* Date */}
                  <time className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {item.date}
                  </time>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>

                  {/* Image */}
                  {item.image && (
                    <div className="mt-4 overflow-hidden rounded-md">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline Node */}
            <div className="absolute left-1/2 top-6 hidden -translate-x-1/2 md:block">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary shadow-md">
                {item.icon || (
                  <div className="h-4 w-4 rounded-full bg-background" />
                )}
              </div>
            </div>

            {/* Mobile Line Connector */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-border md:hidden" />

            {/* Mobile Node */}
            <div className="absolute left-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary md:hidden">
              {item.icon && <div className="scale-75">{item.icon}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
