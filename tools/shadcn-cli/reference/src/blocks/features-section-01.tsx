import {
  Avatar,
  AvatarFallback,
} from '@workspace/design-system/components/avatar';
import { Button } from '@workspace/design-system/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/design-system/components/card';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
}

export interface FeaturesSection01Props {
  heading: string;
  description: string;
  features: Feature[];
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Features Section 01
 *
 * Three-column grid features section with header, description, optional
 * "See all features" button, and feature cards containing avatar icons,
 * titles, and descriptions.
 *
 * @meta
 * - Category: marketing-ui
 * - Section: features-section
 * - Use Cases: Product showcases, Service displays, SaaS overviews
 */
export function FeaturesSection01({
  heading,
  description,
  features,
  ctaLabel,
  ctaHref,
}: FeaturesSection01Props) {
  return (
    <section className="bg-muted/30 w-full py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {heading}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            {description}
          </p>
          {ctaLabel && ctaHref && (
            <div className="mt-6">
              <Button asChild variant="outline">
                <a href={ctaHref}>{ctaLabel}</a>
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border/50 transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <Avatar className="mb-4 h-12 w-12">
                    <AvatarFallback
                      className={
                        feature.iconColor || 'bg-primary/10 text-primary'
                      }
                    >
                      <Icon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
