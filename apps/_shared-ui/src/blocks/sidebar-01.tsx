"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@workspace/design-system/lib/utils";

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface SidebarProps {
  items: NavItem[];
  className?: string;
}

export function Sidebar01({ items, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block",
        className
      )}
    >
      <div className="h-full overflow-y-auto py-6 pr-6 lg:py-8">
        <nav className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="space-y-2">
              <h4 className="px-2 text-sm font-semibold tracking-tight">
                {item.title}
              </h4>
              {item.items && item.items.length > 0 && (
                <SidebarNav items={item.items} pathname={pathname} />
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SidebarNav({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item, index) => {
        const isActive = item.href === pathname;

        return (
          <li key={index}>
            {item.href ? (
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  item.disabled && "pointer-events-none opacity-60"
                )}
              >
                {item.title}
                {item.label && (
                  <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    {item.label}
                  </span>
                )}
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                {item.title}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { Sidebar01 as Sidebar };
