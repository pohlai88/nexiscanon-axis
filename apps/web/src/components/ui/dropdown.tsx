"use client";

/**
 * Dropdown menu component.
 * 
 * Pattern: Accessible dropdown with keyboard navigation.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within Dropdown");
  }
  return context;
}

interface DropdownProps {
  children: ReactNode;
}

export function Dropdown({ children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Reset active index when closed
  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, activeIndex, setActiveIndex }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
}

export function DropdownTrigger({ children, className = "" }: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      className={className}
    >
      {children}
    </button>
  );
}

interface DropdownMenuProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  children,
  align = "left",
  className = "",
}: DropdownMenuProps) {
  const { isOpen, activeIndex, setActiveIndex } = useDropdown();
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const getItems = useCallback(() => {
    return itemsRef.current.filter((item): item is HTMLButtonElement => item !== null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      const items = getItems();
      const itemCount = items.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((activeIndex + 1) % itemCount);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((activeIndex - 1 + itemCount) % itemCount);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (activeIndex >= 0 && items[activeIndex]) {
            items[activeIndex].click();
          }
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, setActiveIndex, getItems]);

  // Focus active item
  useEffect(() => {
    if (activeIndex >= 0) {
      const items = getItems();
      items[activeIndex]?.focus();
    }
  }, [activeIndex, getItems]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      className={`
        absolute z-50 mt-1 min-w-[160px]
        bg-[var(--background)] border border-[var(--border)]
        rounded-lg shadow-lg overflow-hidden
        animate-in fade-in slide-in-from-top-2 duration-150
        ${align === "right" ? "right-0" : "left-0"}
        ${className}
      `}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  href,
  disabled = false,
  danger = false,
  icon,
  className = "",
}: DropdownItemProps) {
  const { setIsOpen } = useDropdown();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  const baseStyles = `
    w-full flex items-center gap-2 px-3 py-2 text-sm text-left
    transition-colors duration-100
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${danger 
      ? "text-red-600 hover:bg-red-50" 
      : "hover:bg-[var(--muted)]"
    }
    ${className}
  `;

  if (href && !disabled) {
    return (
      <a
        href={href}
        role="menuitem"
        onClick={() => setIsOpen(false)}
        className={baseStyles}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={baseStyles}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-[var(--border)]" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
      {children}
    </div>
  );
}
