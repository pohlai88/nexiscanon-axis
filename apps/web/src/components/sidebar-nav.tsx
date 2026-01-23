"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar navigation component with active link highlighting.
 *
 * Pattern: Shared between admin and tenant sidebars.
 */

export interface NavItem {
  id: string;
  title: string;
  href: string;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

interface SidebarNavProps {
  sections: NavSection[];
  variant?: "light" | "dark";
}

export function SidebarNav({ sections, variant = "light" }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for root paths, prefix match for nested
    if (href === "/admin" || href.match(/^\/[^/]+$/)) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const baseClasses =
    variant === "dark"
      ? "block px-4 py-2 rounded-lg transition-colors duration-200"
      : "block px-4 py-2 rounded-lg transition-colors duration-200";

  const activeClasses =
    variant === "dark"
      ? "bg-zinc-800 text-white"
      : "bg-background text-foreground font-medium";

  const inactiveClasses =
    variant === "dark"
      ? "text-zinc-300 hover:bg-zinc-800 hover:text-white"
      : "text-muted-foreground hover:bg-background hover:text-foreground";

  const labelClasses =
    variant === "dark"
      ? "text-xs uppercase text-zinc-500 font-medium mb-2 px-4"
      : "text-xs uppercase text-muted-foreground font-medium mb-2 px-4";

  return (
    <nav className="flex-1 p-4 space-y-4">
      {sections.map((section, idx) => (
        <div key={idx}>
          {section.label && <p className={labelClasses}>{section.label}</p>}
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`${baseClasses} ${
                  isActive(item.href) ? activeClasses : inactiveClasses
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
