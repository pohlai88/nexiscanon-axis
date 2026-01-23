/**
 * Auth module exports.
 *
 * Pattern: All auth-related utilities exported from here.
 *
 * Two patterns available:
 * 1. Quick helpers: getCurrentUser(), requireAuth() - for simple use cases
 * 2. Client factory: createServerAuthClient() - for advanced use cases
 */

// Quick helpers (most common usage)
export { getSession, getCurrentUser, requireAuth } from "./session";
export { signIn, signOut, signUp } from "./actions";
export type { Session, AuthUser } from "./session";

// Server auth client (Supabase-inspired pattern)
export { createServerAuthClient, getServerSession } from "./server";
export type { AuthSession, ServerAuthClient } from "./server";
