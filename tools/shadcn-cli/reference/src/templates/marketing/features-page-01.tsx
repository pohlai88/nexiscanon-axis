/**
 * Features Page Template 01
 *
 * Detailed features page with:
 * - Navigation header
 * - Hero section
 * - Feature grid with icons
 * - Detailed feature sections
 * - CTA section
 * - Footer
 *
 * Usage: Copy to apps/[app]/app/features/page.tsx and customize
 */

import { Card } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import {
  Zap,
  Shield,
  Rocket,
  Code,
  Database,
  Globe,
  Lock,
  Smartphone,
  BarChart,
} from 'lucide-react';

import { NavbarComponent01 } from '../../blocks/navbar-component-01';
import { HeroSection01 } from '../../blocks/hero-section-01';
import { FeaturesSection01 } from '../../blocks/features-section-01';
import { CtaSection01 } from '../../blocks/cta-section-01';
import { FooterComponent01 } from '../../blocks/footer-component-01';

const detailedFeatures = [
  {
    icon: Code,
    title: 'Developer Experience',
    description:
      'Built with TypeScript, modern tooling, and comprehensive documentation.',
    details: [
      'Full TypeScript support',
      'Hot module replacement',
      'Comprehensive CLI tools',
      'VSCode extensions',
    ],
  },
  {
    icon: Database,
    title: 'Database Management',
    description:
      'Powerful database tools with migrations, queries, and real-time updates.',
    details: [
      'PostgreSQL & MySQL support',
      'Type-safe queries',
      'Automatic migrations',
      'Real-time subscriptions',
    ],
  },
  {
    icon: Globe,
    title: 'Global Deployment',
    description: 'Deploy globally with edge functions and intelligent routing.',
    details: [
      'Edge function support',
      'Auto-scaling',
      'CDN integration',
      'Zero-downtime deployments',
    ],
  },
  {
    icon: Lock,
    title: 'Security First',
    description:
      'Enterprise-grade security with authentication and authorization built-in.',
    details: [
      'OAuth 2.0 support',
      'Row-level security',
      'RBAC permissions',
      'Audit logging',
    ],
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Responsive design and mobile-first approach out of the box.',
    details: [
      'Responsive components',
      'Touch-optimized',
      'Progressive Web App',
      'Offline support',
    ],
  },
  {
    icon: BarChart,
    title: 'Analytics & Insights',
    description: 'Real-time analytics and monitoring for your applications.',
    details: [
      'Real-time dashboards',
      'Custom reports',
      'Performance monitoring',
      'Error tracking',
    ],
  },
];

export default function FeaturesPage01() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navigation */}
      <NavbarComponent01
        logo={{ text: 'Your Brand', href: '/' }}
        leftNav={[
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
        ]}
        rightNav={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Sign In', href: '/login' },
        ]}
      />

      {/* Hero */}
      <HeroSection01
        badge="✨ Comprehensive Feature Set"
        heading="Everything you need to build great products"
        description="A complete platform with all the tools and features modern teams need to ship quickly."
        primaryCta={{ label: 'Get Started', href: '/signup' }}
        secondaryCta={{ label: 'View Docs', href: '/docs' }}
      />

      {/* Feature Grid Overview */}
      <FeaturesSection01
        heading="Built for scale"
        description="Production-ready features that grow with your business"
        features={[
          {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Optimized for performance at every level',
          },
          {
            icon: Shield,
            title: 'Secure',
            description: 'Enterprise-grade security built-in',
          },
          {
            icon: Rocket,
            title: 'Scalable',
            description: 'From prototype to billions of requests',
          },
        ]}
      />

      {/* Detailed Features */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Feature Deep Dive</h2>
            <p className="text-muted-foreground text-xl">
              Explore what makes us different
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {detailedFeatures.map((feature) => (
              <Card
                key={feature.title}
                className={cn(
                  'p-6',
                  'transition-all duration-300',
                  'hover:border-primary/50 hover:shadow-lg',
                )}
              >
                <div className="bg-primary/10 mb-4 inline-flex rounded-lg p-3">
                  <feature.icon className="text-primary h-6 w-6" />
                </div>

                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection01
        heading="Ready to experience these features?"
        description="Start building today with our comprehensive platform"
        appStore={{ href: 'https://apps.apple.com/your-app' }}
        playStore={{ href: 'https://play.google.com/store/your-app' }}
      />

      {/* Footer */}
      <FooterComponent01
        logo={{ text: 'Your Brand', href: '/' }}
        navigation={[
          { label: 'About', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
        ]}
        social={[
          { platform: 'twitter', href: 'https://twitter.com/yourbrand' },
          { platform: 'github', href: 'https://github.com/yourbrand' },
        ]}
      />
    </div>
  );
}
