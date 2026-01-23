/**
 * Posting Spine Services
 *
 * B01 Three-Layer Model Implementation:
 * - Document State Service (Layer 1: Workflow Layer)
 * - Economic Event Service (Layer 2: Truth Layer)
 * - Posting Service (Layer 3: Math Layer)
 * - Reversal Services (Immutable Correction Pattern)
 */

export * from "./document-state";

// Event service - explicitly export to avoid collision with reversal-service
export {
  createEconomicEvent,
  getEventById,
  getEventsByDocument,
  getEventsByTenant,
  validateEventImmutability,
  build6W1HContext,
  // Re-export event-specific versions with prefixed names
  isEventReversed as isEconomicEventReversed,
  getReversalChain as getEconomicEventReversalChain,
} from "./event-service";
export type { CreateEventInput } from "./event-service";

export * from "./posting-service";

// Reversal service - explicitly export to avoid collision with event-service
export {
  createReversalEntry,
  validateReversalEligibility,
  createDocumentReversal,
  isEventReversed,
  findOriginalEvent,
} from "./reversal-service";
export type { CreateReversalInput, ReversalEntryResult } from "./reversal-service";

// Reversal tracking - explicitly export to avoid collision
export {
  getReversalChain,
  isDocumentReversed,
  isDocumentReversal,
  findOriginalDocument,
  getReversalsForDocument,
  getReversalCount,
  getReversalStatus,
  type ReversalChainEntry,
  type ReversalStatus,
} from "./reversal-tracking";
