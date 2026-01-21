"use client";

/**
 * Workspace switcher component.
 * 
 * Pattern: Dropdown to switch between workspaces/tenants.
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Workspace {
  id: string;
  slug: string;
  name: string;
  role: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const otherWorkspaces = workspaces.filter((w) => w.id !== currentWorkspace.id);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Workspace avatar */}
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-bold">
          {currentWorkspace.name[0]?.toUpperCase() ?? "W"}
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium truncate">{currentWorkspace.name}</p>
          <p className="text-xs text-[var(--muted-foreground)] capitalize">
            {currentWorkspace.role}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Current workspace */}
          <div className="p-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 p-2 bg-[var(--muted)] rounded-lg">
              <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-xs font-bold">
                {currentWorkspace.name[0]?.toUpperCase() ?? "W"}
              </div>
              <span className="text-sm font-medium truncate">
                {currentWorkspace.name}
              </span>
              <svg className="w-4 h-4 text-[var(--primary)] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Other workspaces */}
          {otherWorkspaces.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-[var(--muted-foreground)] font-medium">
                Switch workspace
              </p>
              {otherWorkspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/${workspace.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors duration-200"
                >
                  <div className="w-6 h-6 rounded bg-[var(--muted)] flex items-center justify-center text-xs font-bold">
                    {workspace.name[0]?.toUpperCase() ?? "W"}
                  </div>
                  <span className="text-sm truncate">{workspace.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Create new */}
          <div className="p-2 border-t border-[var(--border)]">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors duration-200 text-[var(--muted-foreground)]"
            >
              <div className="w-6 h-6 rounded border border-dashed border-[var(--border)] flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm">Create workspace</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
