/**
 * Landing Page Template 01
 * 
 * Full-featured landing page with:
 * - Navigation header
 * - Hero section with CTA
 * - Features showcase
 * - CTA section
 * - Footer
 * 
 * Usage: Copy to apps/[app]/app/page.tsx and customize props
 */

import {
  NavbarComponent01,
  HeroSection01,
  FeaturesSection01,
  CtaSection01,
  FooterComponent01,
} from "@workspace/shared-ui/blocks";
import { Zap, Shield, Rocket } from "lucide-react";

export default function LandingPage01() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavbarComponent01
        logo={{ text: "Your Brand", href: "/" }}
        leftNav={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "About", href: "#about" },
        ]}
        rightNav={[
          { label: "Documentation", href: "/docs" },
          { label: "Sign In", href: "/login" },
        ]}
      />

      {/* Hero Section */}
      <HeroSection01
        badge="✨ New Release v2.0"
        heading="Build Something Amazing"
        description="The fastest way to create beautiful, performant applications with best-in-class developer experience."
        primaryCta={{ label: "Get Started", href: "/signup" }}
        secondaryCta={{ label: "View Demo", href: "/demo" }}
      />

      {/* Features Section */}
      <FeaturesSection01
        heading="Everything you need"
        description="Built with modern best practices and ready to scale"
        features={[
          {
            icon: Zap,
            title: "Lightning Fast",
            description:
              "Optimized for performance with edge functions and smart caching strategies.",
          },
          {
            icon: Shield,
            title: "Secure by Default",
            description:
              "Enterprise-grade security with built-in authentication and authorization.",
          },
          {
            icon: Rocket,
            title: "Scalable Architecture",
            description:
              "Designed to grow from prototype to production without rewrites.",
          },
        ]}
      />

      {/* Call to Action */}
      <CtaSection01
        heading="Ready to get started?"
        description="Join thousands of developers building the next generation of applications"
        appStore={{ href: "https://apps.apple.com/your-app" }}
        playStore={{ href: "https://play.google.com/store/your-app" }}
      />

      {/* Footer */}
      <FooterComponent01
        logo={{ text: "Your Brand", href: "/" }}
        navigation={[
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ]}
        social={[
          { platform: "twitter", href: "https://twitter.com/yourbrand" },
          { platform: "github", href: "https://github.com/yourbrand" },
          { platform: "linkedin", href: "https://linkedin.com/company/yourbrand" },
        ]}
      />
    </div>
  );
}
