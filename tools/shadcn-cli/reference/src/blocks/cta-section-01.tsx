import { Card, CardContent } from '@workspace/design-system/components/card';
import { Apple, PlayCircle } from 'lucide-react';
import React from 'react';

export interface CtaSection01Props {
  heading: string;
  description: string;
  appStore?: {
    href: string;
    label?: string;
  };
  playStore?: {
    href: string;
    label?: string;
  };
}

/**
 * CTA Section 01
 *
 * Rounded card layout with app download content featuring heading,
 * description, and App Store/Google Play download buttons.
 *
 * @meta
 * - Category: marketing-ui
 * - Section: cta-section
 * - Use Cases: Mobile app promotion, App landing pages, Download CTAs
 */
export function CtaSection01({
  heading,
  description,
  appStore,
  playStore,
}: CtaSection01Props) {
  return (
    <section className="bg-muted/30 w-full py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-4xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              {/* Heading */}
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {heading}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-8 text-lg md:text-xl">
                {description}
              </p>

              {/* Store Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {appStore && (
                  <a
                    href={appStore.href}
                    className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-12 items-center gap-2 rounded-lg px-6 transition-colors"
                  >
                    <Apple className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">
                        {appStore.label || 'App Store'}
                      </div>
                    </div>
                  </a>
                )}

                {playStore && (
                  <a
                    href={playStore.href}
                    className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-12 items-center gap-2 rounded-lg px-6 transition-colors"
                  >
                    <PlayCircle className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">
                        {playStore.label || 'Google Play'}
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
