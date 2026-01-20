import React from "react";
import { Button } from "@workspace/design-system/components/button";
import { Badge } from "@workspace/design-system/components/badge";

export interface HeroSection01Props {
  badge?: string;
  heading: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  imageUrl?: string;
}

/**
 * Hero Section 01
 * 
 * Centered vertical layout hero with AI-powered badge, decorative heading,
 * call-to-action buttons, and optional full-width image showcase.
 * 
 * @meta
 * - Category: marketing-ui
 * - Section: hero-section
 * - Use Cases: Food delivery apps, Recipe platforms, Landing pages
 */
export function HeroSection01({
  badge,
  heading,
  description,
  primaryCta,
  secondaryCta,
  imageUrl,
}: HeroSection01Props) {
  return (
    <section className="relative w-full bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Badge */}
        {badge && (
          <div className="mb-6 flex justify-center">
            <Badge variant="secondary" className="px-4 py-1.5">
              {badge}
            </Badge>
          </div>
        )}

        {/* Heading */}
        <h1 className="mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {heading}
        </h1>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <a href={primaryCta.href}>{primaryCta.label}</a>
          </Button>
          {secondaryCta && (
            <Button asChild variant="outline" size="lg">
              <a href={secondaryCta.href}>{secondaryCta.label}</a>
            </Button>
          )}
        </div>

        {/* Featured Image */}
        {imageUrl && (
          <div className="mt-12">
            <img
              src={imageUrl}
              alt="Hero showcase"
              className="w-full rounded-lg object-cover shadow-2xl"
            />
          </div>
        )}
      </div>
    </section>
  );
}
