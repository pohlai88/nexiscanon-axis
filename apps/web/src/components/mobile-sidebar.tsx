"use client";

/**
 * Mobile Sidebar Component
 *
 * A slide-out sidebar for mobile devices with hamburger menu trigger.
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface MobileSidebarProps {
  children: React.ReactNode;
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button - visible only on mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-lg bg-background border border-border shadow-sm"
        aria-label="Open menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-muted border-r border-border
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button - mobile only */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-background transition-colors"
          aria-label="Close menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Sidebar content */}
        <div className="flex flex-col h-full pt-12 lg:pt-0">
          {children}
        </div>
      </aside>
    </>
  );
}

/**
 * Hook to control mobile sidebar from anywhere.
 */
export function useMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
