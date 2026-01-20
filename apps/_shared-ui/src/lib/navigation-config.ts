import type { NavItem } from "../components/sidebar";

export const docsNavigation: NavItem[] = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    items: [
      { title: "Introduction", href: "/docs/getting-started/introduction" },
      { title: "Installation", href: "/docs/getting-started/installation" },
      { title: "Configuration", href: "/docs/getting-started/configuration" },
    ],
  },
  {
    title: "Components",
    href: "/docs/components",
    items: [
      { title: "Overview", href: "/docs/components" },
      { title: "Button", href: "/docs/components/button" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Input", href: "/docs/components/input" },
    ],
  },
  {
    title: "Themes",
    href: "/docs/themes",
    items: [
      { title: "Overview", href: "/docs/themes" },
      { title: "Customization", href: "/docs/themes/customization" },
      { title: "Tokens", href: "/docs/themes/tokens" },
    ],
  },
];
