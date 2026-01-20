// packages/auth/src/neon-server/index.ts
// Neon Auth server-side utilities
//
// ARCHITECTURE: Server-side JWT verification and session management
// Uses JWKS endpoint for cryptographic verification

export { verifyNeonAuthJwt, type NeonAuthPayload } from "./verify";
export { getNeonAuthServerConfig, type NeonAuthServerConfig } from "./config";
export { createServerAuthClient } from "./server-client";
