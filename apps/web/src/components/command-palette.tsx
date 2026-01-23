"use client";

/**
 * Command palette / global search.
 * 
 * Pattern: Cmd+K to open, search across pages and actions.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  tenantSlug?: string;
}

export function CommandPalette({ tenantSlug }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Build command items based on context
  const commands: CommandItem[] = tenantSlug
    ? [
        // Navigation
        {
          id: "dashboard",
          label: "Dashboard",
          description: "Go to dashboard",
          icon: "🏠",
          href: `/${tenantSlug}`,
          keywords: ["home", "overview"],
        },
        // Sales
        {
          id: "invoices",
          label: "Invoices",
          description: "View all invoices",
          icon: "📄",
          href: `/${tenantSlug}/invoices`,
          keywords: ["sales", "ar", "receivables"],
        },
        {
          id: "new-invoice",
          label: "New Invoice",
          description: "Create a new invoice",
          icon: "➕",
          href: `/${tenantSlug}/invoices/new`,
          keywords: ["create", "sales", "ar"],
        },
        {
          id: "customers",
          label: "Customers",
          description: "View all customers",
          icon: "👥",
          href: `/${tenantSlug}/customers`,
          keywords: ["parties", "clients", "ar"],
        },
        {
          id: "new-customer",
          label: "New Customer",
          description: "Create a new customer",
          icon: "➕",
          href: `/${tenantSlug}/customers/new`,
          keywords: ["create", "party", "client"],
        },
        // Purchasing
        {
          id: "vendors",
          label: "Vendors",
          description: "View all vendors",
          icon: "🏭",
          href: `/${tenantSlug}/vendors`,
          keywords: ["suppliers", "ap", "payables"],
        },
        {
          id: "bills",
          label: "Bills",
          description: "View all bills",
          icon: "📋",
          href: `/${tenantSlug}/bills`,
          keywords: ["ap", "payables", "purchase"],
        },
        // Inventory
        {
          id: "items",
          label: "Items",
          description: "View all items",
          icon: "📦",
          href: `/${tenantSlug}/items`,
          keywords: ["products", "stock", "inventory"],
        },
        // Accounting
        {
          id: "journals",
          label: "Journal Entries",
          description: "View all journal entries",
          icon: "📒",
          href: `/${tenantSlug}/accounting/journals`,
          keywords: ["gl", "ledger", "accounting"],
        },
        {
          id: "new-journal",
          label: "New Journal Entry",
          description: "Create a new journal entry",
          icon: "➕",
          href: `/${tenantSlug}/accounting/journals/new`,
          keywords: ["create", "gl", "ledger"],
        },
        {
          id: "chart-of-accounts",
          label: "Chart of Accounts",
          description: "View chart of accounts",
          icon: "📊",
          href: `/${tenantSlug}/accounting/chart-of-accounts`,
          keywords: ["coa", "gl", "accounts"],
        },
        {
          id: "trial-balance",
          label: "Trial Balance",
          description: "View trial balance",
          icon: "⚖️",
          href: `/${tenantSlug}/accounting/trial-balance`,
          keywords: ["tb", "report", "balance"],
        },
        // Settings
        {
          id: "settings",
          label: "Settings",
          description: "Workspace settings",
          icon: "⚙️",
          href: `/${tenantSlug}/settings`,
          keywords: ["preferences", "config"],
        },
        {
          id: "team",
          label: "Team",
          description: "Manage team members",
          icon: "👤",
          href: `/${tenantSlug}/settings/team`,
          keywords: ["members", "users", "invite"],
        },
        {
          id: "billing",
          label: "Billing",
          description: "Manage subscription",
          icon: "💳",
          href: `/${tenantSlug}/settings/billing`,
          keywords: ["plan", "subscription", "payment"],
        },
        {
          id: "api-keys",
          label: "API Keys",
          description: "Manage API keys",
          icon: "🔑",
          href: `/${tenantSlug}/settings/api-keys`,
          keywords: ["tokens", "access"],
        },
        {
          id: "audit-log",
          label: "Audit Log",
          description: "View activity log",
          icon: "📝",
          href: `/${tenantSlug}/settings/audit-log`,
          keywords: ["activity", "history", "security"],
        },
      ]
    : [
        {
          id: "home",
          label: "Home",
          description: "Go to home page",
          icon: "🏠",
          href: "/",
        },
        {
          id: "login",
          label: "Sign In",
          description: "Sign in to your account",
          icon: "🔐",
          href: "/login",
        },
        {
          id: "register",
          label: "Register",
          description: "Create a new account",
          icon: "📝",
          href: "/register",
        },
      ];

  // Add global actions
  const globalActions: CommandItem[] = [
    {
      id: "account",
      label: "Account Settings",
      description: "Manage your account",
      icon: "👤",
      href: "/account",
      keywords: ["profile", "user"],
    },
    {
      id: "new-workspace",
      label: "Create Workspace",
      description: "Create a new organization",
      icon: "➕",
      href: "/onboarding",
      keywords: ["new", "organization"],
    },
  ];

  const allCommands = [...commands, ...globalActions];

  // Filter commands based on query
  const filteredCommands = query
    ? allCommands.filter((cmd) => {
        const searchText = [
          cmd.label,
          cmd.description,
          ...(cmd.keywords ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
    : allCommands;

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle navigation
  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.href) {
        router.push(item.href);
      } else if (item.action) {
        item.action();
      }
      setIsOpen(false);
    },
    [router]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          const selected = filteredCommands[selectedIndex];
          if (selected) {
            handleSelect(selected);
          }
          break;
      }
    },
    [filteredCommands, selectedIndex, handleSelect]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg">
        <div className="bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 py-4 bg-transparent border-0 outline-none"
            />
            <kbd className="px-2 py-1 text-xs bg-muted rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredCommands.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                    transition-colors duration-100
                    ${index === selectedIndex ? "bg-muted" : "hover:bg-muted"}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Command palette trigger button.
 */
export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() => {
        // Dispatch custom event to open palette
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
      }}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span>Search</span>
      <kbd className="px-1.5 py-0.5 text-xs bg-background rounded">⌘K</kbd>
    </button>
  );
}
