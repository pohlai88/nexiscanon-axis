// Providers / hooks
export { AuthProvider } from "./providers/auth-provider";
export { useAuth } from "./hooks/use-auth";

// Server-side handlers
export * from "./handlers";

// Types
export type { AuthSession, AuthError, AuthContextType } from "./types";

// Constants
export { AUTH_ROUTES, AUTH_ERRORS, AUTH_MESSAGES } from "./constants";

// Neon Auth adapter (for kernel JWT verification)
export { verifyJwt, type AuthPrincipal } from "./neon";
