// ============================================================================
// @workspace/auth - Authentication package
// ============================================================================
// ARCHITECTURE: This package provides authentication for the AXIS platform
// Primary integration: Neon Auth (Better Auth managed service)
//
// Exports:
// - Main: Legacy providers/hooks (for backward compatibility)
// - @workspace/auth/neon-client: Browser-side Neon Auth client + React hooks
// - @workspace/auth/neon-server: Server-side JWT verification + session management
// ============================================================================

// ---- Legacy Providers / Hooks (backward compatibility) ----
export { AuthProvider } from "./providers/auth-provider";
export { useAuth } from "./hooks/use-auth";

// ---- Server-side handlers ----
export * from "./handlers";

// ---- Types ----
export type { AuthSession, AuthError, AuthContextType } from "./types";

// ---- Constants ----
export { AUTH_ROUTES, AUTH_ERRORS, AUTH_MESSAGES } from "./constants";

// ---- Neon Auth adapter (for kernel JWT verification) ----
export { verifyJwt, type AuthPrincipal } from "./neon";

// ---- Re-export Neon client types for convenience ----
export type {
  NeonUser,
  NeonSession,
  NeonAuthState,
  NeonAuthError,
} from "./neon-client/types";
