"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

/**
 * Tenant context value.
 */
export interface TenantContextValue {
  /** Tenant slug (from URL path) */
  slug: string;

  /** Tenant ID (from database) */
  tenantId: string;

  /** Tenant display name */
  name: string;

  /** Current user's role in this tenant */
  role: "owner" | "admin" | "member" | "viewer";
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  value: TenantContextValue;
}

/**
 * Provider for tenant context.
 * Wrap tenant routes with this to provide tenant data to all children.
 */
export function TenantProvider({ children, value }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

/**
 * Hook to access current tenant context.
 * Must be used within a TenantProvider.
 *
 * @throws If used outside of TenantProvider
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }

  return context;
}
