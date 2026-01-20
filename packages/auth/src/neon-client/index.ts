// packages/auth/src/neon-client/index.ts
// Neon Auth client for browser/React usage
//
// ARCHITECTURE: This module provides the client-side Neon Auth integration
// Uses @neondatabase/neon-js/auth for authentication with Neon Auth service

export { createNeonAuthClient, type NeonAuthClient } from "./client";
export { useNeonAuth, NeonAuthProvider } from "./provider";
export type { NeonUser, NeonSession, NeonAuthState } from "./types";
