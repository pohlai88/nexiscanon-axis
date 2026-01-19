// packages/domain/src/addons/requests/tokens.ts
// Token constants for requests addon (single source of truth)

import { token } from "../../container";
import type { RequestService } from "./manifest";
import type { RequestRepository } from "./ports";

/**
 * Requests addon tokens.
 * Use these constants everywhere to prevent token string drift.
 */
export const REQUESTS_TOKENS = {
  /** Request domain service */
  RequestService: token<RequestService>("domain.requests.RequestService"),

  /** Request repository port (implementation bound at composition root) */
  RequestRepository: token<RequestRepository>(
    "domain.requests.RequestRepository"
  ),
} as const;
