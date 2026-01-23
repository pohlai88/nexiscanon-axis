'use client';

import { Button, SolarisThemeSwitcher } from '@workspace/design-system';
import Link from 'next/link';

export interface HeaderProps {
  logo?: React.ReactNode;
  title?: string;
  navigation?: { label: string; href: string }[];
  actions?: React.ReactNode;
}

export function Header01({
  logo,
  title = 'NexusCanon AXIS',
  navigation = [],
  actions,
}: HeaderProps) {
  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo & Title */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {logo}
            <span className="font-bold">{title}</span>
          </Link>
        </div>

        {/* Navigation */}
        {navigation.length > 0 && (
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {actions}
          <SolarisThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export { Header01 as Header };
