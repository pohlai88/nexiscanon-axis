import { Button } from '@workspace/design-system/components/button';
import { Search, Menu } from 'lucide-react';
import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarComponent01Props {
  logo: {
    src?: string;
    text: string;
    href: string;
  };
  leftNav?: NavItem[];
  rightNav?: NavItem[];
  showSearch?: boolean;
  onMobileMenuToggle?: () => void;
}

/**
 * Navbar Component 01
 *
 * Sticky navigation header with centered logo and brand name flanked
 * symmetrically by navigation links. Features search icon and responsive
 * mobile dropdown menu.
 *
 * @meta
 * - Category: marketing-ui
 * - Section: navbar-component
 * - Use Cases: Corporate websites, Business portfolios, Product showcases
 */
export function NavbarComponent01({
  logo,
  leftNav = [],
  rightNav = [],
  showSearch = true,
  onMobileMenuToggle,
}: NavbarComponent01Props) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {leftNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Logo - Centered */}
        <div className="flex items-center gap-2">
          <a href={logo.href} className="flex items-center gap-2">
            {logo.src && (
              <img
                src={logo.src}
                alt={logo.text}
                className="h-8 w-8 rounded-md"
              />
            )}
            <span className="text-lg font-semibold">{logo.text}</span>
          </a>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 lg:flex">
            {rightNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Search Button */}
          {showSearch && (
            <Button variant="ghost" size="icon" className="hidden lg:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
