/**
 * Pricing Page Template 01
 *
 * Pricing page with:
 * - Navigation header
 * - Pricing tiers (3-tier layout)
 * - Feature comparison
 * - FAQ section
 * - Footer
 *
 * Usage: Copy to apps/[app]/app/pricing/page.tsx and customize
 */

import { Button, Card } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import { Check } from 'lucide-react';

import {
  NavbarComponent01,
  FooterComponent01,
  FaqComponent01,
} from '@workspace/shared-ui/blocks';

const pricingTiers = [
  {
    name: 'Starter',
    price: '$9',
    period: 'per month',
    description: 'Perfect for individuals and small projects',
    features: [
      'Up to 3 projects',
      'Basic analytics',
      '24/7 support',
      '1GB storage',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=starter',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: 'per month',
    description: 'For growing teams and businesses',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'Custom integrations',
      'Team collaboration',
    ],
    cta: 'Get Started',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations with specific needs',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'SLA guarantee',
      'Unlimited storage',
      'Custom contracts',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=enterprise',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I change my plan later?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes, all plans include a 14-day free trial with full access to features.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Absolutely. Cancel anytime with no penalties. You'll have access until the end of your billing period.",
  },
];

export default function PricingPage01() {
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

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="text-muted-foreground text-xl">
              Choose the plan that fits your needs
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid gap-8 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  'relative p-8',
                  'transition-all duration-300',
                  tier.highlighted &&
                    'border-primary scale-105 shadow-xl md:scale-110',
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
                  <p className="text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">
                    {tier.period}
                  </span>
                </div>

                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <a href={tier.href}>{tier.cta}</a>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/50 border-t py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            <FaqComponent01 heading="" items={faqs} />
          </div>
        </div>
      </section>

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
