import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/design-system/components/avatar';
import { Badge } from '@workspace/design-system/components/badge';
import { Card, CardContent } from '@workspace/design-system/components/card';
import { cn } from '@workspace/design-system/lib/utils';
import { Star, Quote } from 'lucide-react';
import React from 'react';

export interface Testimonial {
  id: string;
  content: string;
  author: {
    name: string;
    role: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
  featured?: boolean;
}

export interface TestimonialGridProps {
  testimonials: Testimonial[];
  columns?: 2 | 3;
  className?: string;
}

/**
 * Testimonial Grid
 *
 * Beautiful testimonial display with ratings and avatars.
 * Optimized with design system for consistent brand experience.
 *
 * Features:
 * - Star ratings
 * - Avatar support
 * - Featured testimonials
 * - Responsive masonry layout
 * - Quote icons
 * - Hover animations
 *
 * @meta
 * - Category: Marketing
 * - Section: testimonials
 * - Use Cases: Social proof, Customer reviews, Case studies, Trust building
 */
export function TestimonialGrid({
  testimonials,
  columns = 3,
  className,
}: TestimonialGridProps) {
  const colsClass =
    columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('grid gap-6', colsClass, className)}>
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden transition-all hover:shadow-lg',
        testimonial.featured && 'border-primary ring-primary/20 ring-2',
      )}
    >
      {/* Featured Badge */}
      {testimonial.featured && (
        <div className="absolute top-4 right-4">
          <Badge variant="default" className="bg-primary">
            Featured
          </Badge>
        </div>
      )}

      <CardContent className="flex flex-col gap-4 p-6">
        {/* Quote Icon */}
        <div className="flex items-center justify-between">
          <Quote className="text-primary/20 h-8 w-8" />
          {/* Rating */}
          {testimonial.rating && (
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={cn(
                    'h-4 w-4',
                    idx < testimonial.rating!
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted',
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="mt-auto flex items-center gap-3 border-t pt-4">
          <Avatar>
            {testimonial.author.avatar && (
              <AvatarImage
                src={testimonial.author.avatar}
                alt={testimonial.author.name}
              />
            )}
            <AvatarFallback>
              {testimonial.author.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{testimonial.author.name}</p>
            <p className="text-muted-foreground text-xs">
              {testimonial.author.role}
              {testimonial.author.company &&
                ` at ${testimonial.author.company}`}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
      </div>
    </Card>
  );
}
