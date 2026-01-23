import { Badge } from '@workspace/design-system/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/design-system/components/card';
import { cn } from '@workspace/design-system/lib/utils';
import React from 'react';

export interface MarqueeItem {
  id: string;
  content: React.ReactNode;
}

export interface MarqueeProps {
  items: MarqueeItem[];
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  pauseOnHover?: boolean;
  className?: string;
  vertical?: boolean;
}

const speedMap = {
  slow: '60s',
  normal: '40s',
  fast: '20s',
};

/**
 * Marquee Component
 *
 * Infinite scrolling marquee for showcasing logos, testimonials, or features.
 * Inspired by Magic UI with smooth animations and design system integration.
 *
 * Features:
 * - Infinite seamless scrolling
 * - Configurable speed and direction
 * - Pause on hover
 * - Vertical or horizontal orientation
 * - Responsive design
 *
 * @meta
 * - Category: Animation
 * - Section: marquee
 * - Use Cases: Logo clouds, Testimonials, Feature lists, Partner showcases
 */
export function Marquee({
  items,
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className,
  vertical = false,
}: MarqueeProps) {
  const duration = speedMap[speed];
  const isReverse = direction === 'right' || (vertical && direction === 'left');

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        vertical ? 'h-full' : '',
        className,
      )}
    >
      {/* Gradient Overlays */}
      <div
        className={cn(
          'pointer-events-none absolute z-10',
          vertical
            ? 'from-background inset-x-0 top-0 h-1/6 bg-gradient-to-b to-transparent'
            : 'from-background inset-y-0 left-0 w-1/12 bg-gradient-to-r to-transparent',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute z-10',
          vertical
            ? 'from-background inset-x-0 bottom-0 h-1/6 bg-gradient-to-t to-transparent'
            : 'from-background inset-y-0 right-0 w-1/12 bg-gradient-to-l to-transparent',
        )}
      />

      {/* Scrolling Content */}
      <div
        className={cn(
          'flex gap-4',
          vertical ? 'flex-col' : 'flex-row',
          pauseOnHover && 'hover:[animation-play-state:paused]',
        )}
        style={{
          animation: `marquee${vertical ? 'Vertical' : ''} ${duration} linear infinite ${
            isReverse ? 'reverse' : ''
          }`,
        }}
      >
        {/* Double the items for seamless loop */}
        {[...items, ...items].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className={cn(
              'flex-shrink-0',
              vertical ? 'w-full' : 'min-w-[300px]',
            )}
          >
            {item.content}
          </div>
        ))}
      </div>

      {/* CSS Keyframes injected via style tag */}
      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes marqueeVertical {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Logo Marquee
 *
 * Pre-configured marquee for logo clouds with optimized styling.
 */
export function LogoMarquee({
  logos,
  className,
}: {
  logos: { id: string; src: string; alt: string }[];
  className?: string;
}) {
  const items: MarqueeItem[] = logos.map((logo) => ({
    id: logo.id,
    content: (
      <div className="bg-card hover:bg-muted flex h-16 items-center justify-center rounded-lg border p-4 transition-colors">
        <img
          src={logo.src}
          alt={logo.alt}
          className="max-h-full max-w-full object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
        />
      </div>
    ),
  }));

  return <Marquee items={items} speed="slow" className={className} />;
}

/**
 * Testimonial Marquee
 *
 * Pre-configured marquee for customer testimonials.
 */
export function TestimonialMarquee({
  testimonials,
  className,
}: {
  testimonials: {
    id: string;
    content: string;
    author: string;
    role: string;
    avatar?: string;
  }[];
  className?: string;
}) {
  const items: MarqueeItem[] = testimonials.map((testimonial) => ({
    id: testimonial.id,
    content: (
      <Card className="h-full w-[350px]">
        <CardContent className="flex flex-col gap-4 p-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            "{testimonial.content}"
          </p>
          <div className="flex items-center gap-3">
            {testimonial.avatar && (
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-medium">{testimonial.author}</p>
              <p className="text-muted-foreground text-xs">
                {testimonial.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  }));

  return (
    <Marquee
      items={items}
      speed="normal"
      direction="right"
      className={className}
    />
  );
}
