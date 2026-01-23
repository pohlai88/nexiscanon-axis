"use client";

/**
 * Workspace switcher component.
 *
 * Pattern: Dropdown to switch between workspaces/tenants.
 * Supports organization → team → personal hierarchy.
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type WorkspaceType = "organization" | "team" | "personal";

interface Workspace {
  id: string;
  slug: string;
  name: string;
  role: string;
  type: WorkspaceType;
  parentId?: string | null;
}

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
}

/**
 * Group workspaces by type and parent.
 */
function groupWorkspaces(workspaces: Workspace[]) {
  const organizations = workspaces.filter((w) => w.type === "organization");
  const teams = workspaces.filter((w) => w.type === "team");
  const personal = workspaces.filter((w) => w.type === "personal");

  // Group teams by parent org
  const teamsByOrg = new Map<string, Workspace[]>();
  for (const team of teams) {
    if (team.parentId) {
      const existing = teamsByOrg.get(team.parentId) ?? [];
      existing.push(team);
      teamsByOrg.set(team.parentId, existing);
    }
  }

  return { organizations, teams, personal, teamsByOrg };
}

/**
 * Get icon for workspace type.
 */
function WorkspaceIcon({ type, className }: { type: WorkspaceType; className?: string }) {
  if (type === "organization") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (type === "team") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  // personal
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
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
  const { organizations, personal, teamsByOrg } = groupWorkspaces(otherWorkspaces);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Workspace avatar with type icon */}
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <WorkspaceIcon type={currentWorkspace.type} className="w-4 h-4" />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="font-medium truncate">{currentWorkspace.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {currentWorkspace.type === "personal" ? "Personal" : currentWorkspace.role}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {/* Current workspace */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
                <WorkspaceIcon type={currentWorkspace.type} className="w-3 h-3" />
              </div>
              <span className="text-sm font-medium truncate">
                {currentWorkspace.name}
              </span>
              <svg className="w-4 h-4 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Personal workspace */}
          {personal.length > 0 && (
            <div className="p-2 border-b border-border">
              <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                Personal
              </p>
              {personal.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/${workspace.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                >
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <WorkspaceIcon type="personal" className="w-3 h-3" />
                  </div>
                  <span className="text-sm truncate">{workspace.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Organizations and Teams */}
          {organizations.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                Organizations
              </p>
              {organizations.map((org) => {
                const orgTeams = teamsByOrg.get(org.id) ?? [];
                return (
                  <div key={org.id}>
                    <Link
                      href={`/${org.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                    >
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                        <WorkspaceIcon type="organization" className="w-3 h-3" />
                      </div>
                      <span className="text-sm truncate">{org.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto capitalize">
                        {org.role}
                      </span>
                    </Link>
                    {/* Nested teams */}
                    {orgTeams.length > 0 && (
                      <div className="ml-4 border-l border-border">
                        {orgTeams.map((team) => (
                          <Link
                            key={team.id}
                            href={`/${team.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2 pl-4 rounded-lg hover:bg-muted transition-colors duration-200"
                          >
                            <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                              <WorkspaceIcon type="team" className="w-3 h-3" />
                            </div>
                            <span className="text-sm truncate">{team.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new */}
          <div className="p-2 border-t border-border">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors duration-200 text-muted-foreground"
            >
              <div className="w-6 h-6 rounded border border-dashed border-border flex items-center justify-center">
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
