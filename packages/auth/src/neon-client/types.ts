// packages/auth/src/neon-client/types.ts
// Neon Auth type definitions

/**
 * Neon Auth user object.
 * Maps to neon_auth.user table fields.
 */
export type NeonUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Neon Auth session object.
 * Contains session token and JWT for API access.
 */
export type NeonSession = {
  token: string; // Session token (HTTP-only cookie)
  expiresAt: string; // Session expiration
  accessToken?: string; // JWT for Data API / backend calls
  user: NeonUser;
};

/**
 * Neon Auth state for React context.
 */
export type NeonAuthState = {
  user: NeonUser | null;
  session: NeonSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

/**
 * Sign-in credentials for email/password auth.
 */
export type SignInCredentials = {
  email: string;
  password: string;
};

/**
 * Sign-up data for email/password registration.
 */
export type SignUpData = {
  email: string;
  password: string;
  name: string;
};

/**
 * OAuth provider identifiers supported by Neon Auth.
 */
export type OAuthProvider = "google" | "github";

/**
 * Sign-in options for OAuth.
 */
export type OAuthSignInOptions = {
  provider: OAuthProvider;
  callbackURL?: string;
};

/**
 * Auth error from Neon Auth API.
 */
export type NeonAuthError = {
  code: string;
  message: string;
  status?: number;
};

/**
 * Result type for auth operations.
 */
export type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: NeonAuthError };
