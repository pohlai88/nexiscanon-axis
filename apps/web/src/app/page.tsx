import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";

const FEATURES = [
  {
    icon: "🏢",
    title: "Multi-Tenant Architecture",
    description: "Isolated workspaces with path-based routing. Each organization gets their own secure environment.",
  },
  {
    icon: "👥",
    title: "Team Management",
    description: "Invite team members, assign roles, and control access with granular permissions.",
  },
  {
    icon: "🔐",
    title: "Secure Authentication",
    description: "Built on Neon Auth with session management, password reset, and secure cookie handling.",
  },
  {
    icon: "🔑",
    title: "API Access",
    description: "Generate API keys for programmatic access. Full audit logging for compliance.",
  },
  {
    icon: "📊",
    title: "Activity Dashboard",
    description: "Real-time activity feed and comprehensive audit logs for full visibility.",
  },
  {
    icon: "💳",
    title: "Subscription Plans",
    description: "Flexible pricing tiers from free to enterprise with easy upgrade paths.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            AXIS
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Enterprise Resource Planning
            <br />
            <span className="text-primary">for Modern Teams</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A multi-tenant SaaS platform built for scale. Manage your organization, 
            team, and resources in one powerful workspace.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Start for Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-border rounded-xl font-medium text-lg hover:bg-muted transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built-in features for managing your organization from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground mb-10">
            Start free, upgrade when you need more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-border rounded-xl">
              <h3 className="font-semibold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <p className="text-sm text-muted-foreground">
                Up to 3 team members
              </p>
            </div>
            <div className="p-6 border-2 border-primary rounded-xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Popular
              </span>
              <h3 className="font-semibold mb-2">Professional</h3>
              <p className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal">/mo</span></p>
              <p className="text-sm text-muted-foreground">
                Unlimited members
              </p>
            </div>
            <div className="p-6 border border-border rounded-xl">
              <h3 className="font-semibold mb-2">Enterprise</h3>
              <p className="text-3xl font-bold mb-4">Custom</p>
              <p className="text-sm text-muted-foreground">
                Dedicated support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-8 opacity-90">
            Create your free account and start managing your organization today.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-background text-foreground rounded-xl font-medium text-lg hover:opacity-90 transition-opacity"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 AXIS ERP. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
