# @workspace/shared-ui

> **Apps-Level Shared Blocks**
>
> Reusable UI blocks for all apps in the monorepo. Following the shadcn/ui naming convention.

---

## Architecture Position

```
@workspace/tailwind-config   (Infrastructure)
         │
         ▼
@workspace/design-system     (Tokens + Base Components)
         │
         ▼
┌────────────────────────────────────────────┐
│  @workspace/shared-ui      (THIS PACKAGE)  │
│  App-level shared blocks                   │
└────────────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
apps/web   apps/docs   (App-specific)
```

## Structure

```
apps/_shared/
├── package.json              # @workspace/shared-ui
├── src/
│   ├── blocks/               # Shared UI blocks (shadcn naming)
│   │   ├── index.ts          # Barrel export
│   │   ├── header-01.tsx     # App header with navigation
│   │   ├── footer-01.tsx     # App footer with links
│   │   ├── sidebar-01.tsx    # Docs sidebar navigation
│   │   ├── hero-01.tsx       # Landing page hero section
│   │   └── navbar-01.tsx     # Navigation bar with mobile menu
│   ├── lib/                  # Shared utilities
│   │   └── navigation-config.ts
│   └── styles/               # Shared styles
│       └── globals.css
└── tsconfig.json
```

## Exports

```json
{
  "exports": {
    "./blocks": "./src/blocks/index.ts",
    "./blocks/*": "./src/blocks/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./styles/*": "./src/styles/*.css"
  }
}
```

## Available Blocks

### Marketing UI Blocks (Shadcn Studio)

| Block | Description | Use Cases |
|-------|-------------|-----------|
| `HeroSection01` | Centered hero with badge, CTA buttons, and optional image | Landing pages, Product launches |
| `NavbarComponent01` | Sticky header with centered logo and search | Corporate sites, Business portfolios |
| `FooterComponent01` | Three-section footer with social links | Minimal footers, Personal portfolios |
| `FeaturesSection01` | Three-column grid with feature cards | Product showcases, Service displays |
| `LoginPage01` | Auth card with social login and remember me | SaaS platforms, Admin dashboards |
| `FaqComponent01` | Accordion-style FAQ section | Help pages, Documentation |
| `CtaSection01` | App download CTA with store buttons | Mobile app promotion, Landing pages |

### Dashboard & Application Blocks (Shadcn Studio)

| Block | Description | Use Cases |
|-------|-------------|-----------|
| `ApplicationShell01` | Sidebar layout with header and navigation | Admin dashboards, Enterprise apps |
| `DashboardSidebar01` | Analytics sidebar with navigation menu | Social media analytics, Management systems |
| `DashboardHeader01` | Header with breadcrumbs and profile dropdown | Multi-language dashboards, User portals |

### Legacy Blocks (deprecated)

| Block | Description | Note |
|-------|-------------|------|
| `Header01` | App header with logo, navigation | Use `NavbarComponent01` |
| `Footer01` | Full footer with columns | Use `FooterComponent01` |
| `Sidebar01` | Docs sidebar with nested nav | Use `DashboardSidebar01` |
| `Hero01` | Landing page hero | Use `HeroSection01` |
| `Navbar01` | Navigation bar | Use `NavbarComponent01` |

## Usage

### Import All Blocks

```tsx
import {
  HeroSection01,
  NavbarComponent01,
  FooterComponent01,
  FeaturesSection01,
  LoginPage01,
  FaqComponent01,
  CtaSection01,
  ApplicationShell01,
  DashboardSidebar01,
  DashboardHeader01,
} from "@workspace/shared-ui/blocks";
```

### Import Individual Block

```tsx
import { HeroSection01 } from "@workspace/shared-ui/blocks/hero-section-01";
import { NavbarComponent01 } from "@workspace/shared-ui/blocks/navbar-component-01";
import { ApplicationShell01 } from "@workspace/shared-ui/blocks/application-shell-01";
```

### Example: Marketing Landing Page

```tsx
// apps/web/app/page.tsx
import {
  NavbarComponent01,
  HeroSection01,
  FeaturesSection01,
  CtaSection01,
  FooterComponent01,
} from "@workspace/shared-ui/blocks";
import { Zap, Shield, Rocket } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <NavbarComponent01
        logo={{ text: "NexusCanon", href: "/" }}
        leftNav={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]}
        rightNav={[
          { label: "Docs", href: "/docs" },
          { label: "Sign In", href: "/login" },
        ]}
      />

      <HeroSection01
        badge="✨ New Release"
        heading="Build faster with NexusCanon AXIS"
        description="A modern monorepo architecture with Tailwind v4, Next.js, and shadcn/ui."
        primaryCta={{ label: "Get Started", href: "/docs" }}
        secondaryCta={{ label: "View on GitHub", href: "https://github.com" }}
      />

      <FeaturesSection01
        heading="Everything you need"
        description="Built with best practices and modern tools"
        features={[
          {
            icon: Zap,
            title: "Lightning Fast",
            description: "Optimized for performance with Tailwind v4",
          },
          {
            icon: Shield,
            title: "Type Safe",
            description: "Full TypeScript support across the stack",
          },
          {
            icon: Rocket,
            title: "Ready to Deploy",
            description: "Production-ready configuration out of the box",
          },
        ]}
        ctaLabel="See all features"
        ctaHref="/features"
      />

      <CtaSection01
        heading="Download our app"
        description="Available on iOS and Android"
        appStore={{ href: "https://apps.apple.com" }}
        playStore={{ href: "https://play.google.com" }}
      />

      <FooterComponent01
        logo={{ text: "NexusCanon", href: "/" }}
        navigation={[
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ]}
        social={[
          { platform: "twitter", href: "https://twitter.com" },
          { platform: "github", href: "https://github.com" },
          { platform: "linkedin", href: "https://linkedin.com" },
        ]}
      />
    </>
  );
}
```

### Example: Dashboard Application

```tsx
// apps/web/app/dashboard/layout.tsx
import { ApplicationShell01 } from "@workspace/shared-ui/blocks";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <ApplicationShell01
      sidebarItems={[
        {
          label: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          isActive: true,
        },
        {
          label: "Users",
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/users",
        },
        {
          label: "Reports",
          icon: <FileText className="h-5 w-5" />,
          href: "/dashboard/reports",
        },
        {
          label: "Settings",
          icon: <Settings className="h-5 w-5" />,
          href: "/dashboard/settings",
        },
      ]}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Overview" },
      ]}
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://github.com/shadcn.png",
      }}
      onLogoutClick={() => console.log("Logout")}
    >
      {children}
    </ApplicationShell01>
  );
}
```

### Example: Auth Page

```tsx
// apps/web/app/login/page.tsx
import { LoginPage01 } from "@workspace/shared-ui/blocks";

export default function LoginPage() {
  return (
    <LoginPage01
      logo={{ text: "NexusCanon" }}
      onSubmit={(email, password, rememberMe) => {
        console.log("Login:", { email, password, rememberMe });
      }}
      onSocialLogin={(provider) => {
        console.log("Social login:", provider);
      }}
      onForgotPassword={() => {
        console.log("Forgot password");
      }}
      onSignUp={() => {
        window.location.href = "/signup";
      }}
    />
  );
}
```

## Block Naming Convention

Following shadcn/ui pattern:
- `{block-name}-{variant}.tsx` (e.g., `header-01.tsx`, `footer-01.tsx`)
- Barrel export with alias: `export { Header01 as Header }`
- Types exported separately: `export type { HeaderProps }`

## PostCSS Note

Apps still require `postcss.config.mjs` at their level because Next.js looks for config files in the app directory. However, they simply re-export from `tailwind-config`:

```js
// apps/web/postcss.config.mjs
import { postcssConfig } from "@workspace/tailwind-config/postcss";
export default postcssConfig;
```

This keeps the source of truth in `@workspace/tailwind-config` while satisfying Next.js requirements.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@workspace/design-system` | Base components, tokens, themes |
| `@workspace/tailwind-config` | Tailwind v4 + PostCSS config |

---

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Blocks-000000?style=flat-square" alt="shadcn/ui Blocks" />
</p>
