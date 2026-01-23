/**
 * Types for shadcn/ui component overrides
 */

export interface Patch {
  /** Unique identifier for this patch */
  id: string;
  /** Short description of what this patch does */
  description: string;
  /** Why this patch is needed */
  reason: string;
  /** String to find in the component (must be unique) */
  find: string;
  /** String to replace it with */
  replace: string;
}

export interface ComponentOverride {
  /** Component name (e.g., "button") */
  component: string;
  /** Array of patches to apply */
  patches: Patch[];
}
