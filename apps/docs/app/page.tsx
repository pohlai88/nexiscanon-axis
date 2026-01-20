'use client';

import {
  Button,
  Card,
  Badge,
  Separator,
} from "@workspace/design-system";
import { ThemeSwitcher, ThemeSelector, AccentSwitcher } from "./theme-switcher";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-accent/5 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">N</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight">NexusCanon AXIS</div>
              <div className="text-xs text-muted-foreground">Design System v1.0</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#showcase" className="text-sm font-medium hover:text-primary transition-colors">Showcase</a>
            <a href="#themes" className="text-sm font-medium hover:text-primary transition-colors">Themes</a>
            <a href="#components" className="text-sm font-medium hover:text-primary transition-colors">Components</a>
            <ThemeSwitcher />
            <Button size="sm">Documentation</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <Badge className="px-6 py-2 text-sm font-medium" variant="outline">
              ✨ Powered by Tailwind CSS v4 + Radix UI
            </Badge>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
              <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">
                Design System
              </span>
              <br />
              <span className="bg-gradient-to-br from-primary via-primary to-primary/50 bg-clip-text text-transparent">
                That Scales
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              60+ components, 9 themes, 8 accent colors. Built with React 19, Next.js 15,
              and Tailwind v4. Ship production-grade interfaces in minutes, not months.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-14 px-10 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
                Explore Components →
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-base font-semibold">
                View on GitHub
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold">60+</div>
                <div className="text-sm text-muted-foreground mt-1">Components</div>
              </div>
              <div className="text-center border-x">
                <div className="text-4xl font-bold">9</div>
                <div className="text-sm text-muted-foreground mt-1">Themes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">8</div>
                <div className="text-sm text-muted-foreground mt-1">Accents</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="showcase" className="py-24 border-y bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Blazing Fast",
                description: "Optimized with Tailwind v4's new engine. Lightning-fast builds and runtime performance.",
                color: "from-amber-500 to-orange-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: "Fully Customizable",
                description: "9 professionally designed themes and 8 accent colors. Create your unique brand identity.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Accessible by Default",
                description: "Built on Radix UI primitives. WCAG compliant with full keyboard navigation support.",
                color: "from-emerald-500 to-teal-500"
              },
            ].map((feature, i) => (
              <Card key={i} className="relative group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="p-8 relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section id="themes" className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                Choose Your Theme
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                9 professionally crafted color schemes. Each with perfect light & dark mode.
              </p>
            </div>

            <Card className="p-10 shadow-2xl border-2">
              <div className="space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Select Theme</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try different themes in real-time</p>
                  </div>
                  <ThemeSwitcher />
                </div>

                <Separator />

                <ThemeSelector />
              </div>
            </Card>

            <Card className="p-10 shadow-2xl border-2">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold">Accent Colors</h3>
                  <p className="text-sm text-muted-foreground mt-1">Customize your primary color palette</p>
                </div>
                <Separator />
                <AccentSwitcher />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Component Preview */}
      <section id="components" className="py-24 bg-muted/20 border-y">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                60+ Components
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Production-ready components built with Radix UI. Copy, paste, ship.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <h3 className="text-xl font-bold mb-6">Buttons & Controls</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <h3 className="text-xl font-bold mb-6">Badges & Labels</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="text-base px-4 py-2">Large Badge</Badge>
                </div>
              </Card>

              <Card className="p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 md:col-span-2 bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="text-xl font-bold mb-6">Interactive Cards</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {["Feature 1", "Feature 2", "Feature 3"].map((title, i) => (
                    <div key={i} className="p-6 rounded-lg bg-card border-2 hover:border-primary transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">✨</span>
                      </div>
                      <h4 className="font-semibold mb-2">{title}</h4>
                      <p className="text-sm text-muted-foreground">Beautiful card component with hover effects</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="text-center pt-8">
              <Button size="lg" variant="outline" className="h-14 px-12 text-base font-semibold">
                View All 60+ Components →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">
              Ready to Build?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start shipping beautiful interfaces today with NexusCanon AXIS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-14 px-12 text-base font-semibold shadow-xl">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-12 text-base font-semibold">
                Read Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold">N</span>
              </div>
              <div>
                <div className="font-bold text-lg">NexusCanon AXIS</div>
                <div className="text-xs text-muted-foreground">Enterprise Design System</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using React 19, Next.js 15, Tailwind CSS v4, and Radix UI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
