/**
 * Document State Types
 *
 * Unified document state types for ERP components.
 * These align with @axis/registry DOCUMENT_STATE when available.
 */

/**
 * Core document states for ERP documents.
 * Matches @axis/registry DOCUMENT_STATE.
 */
export type DocumentState =
  | "draft"
  | "submitted"
  | "approved"
  | "posted"
  | "reversed"
  | "cancelled";

/**
 * Extended row states for table display.
 * Includes visual-only states like "error" and "locked".
 */
export type RowState = DocumentState | "error" | "locked";

/**
 * Persona types for feature availability.
 */
export type PersonaType = "quorum" | "cobalt";

/**
 * Row state styling for DataFortress.
 */
export const ROW_STATE_STYLES: Record<RowState, string> = {
  draft: "bg-muted/30 border-l-2 border-l-muted-foreground",
  submitted: "bg-warning/10 border-l-2 border-l-warning",
  approved: "bg-success/10 border-l-2 border-l-success",
  posted: "bg-background border-l-2 border-l-primary",
  reversed: "bg-destructive/10 border-l-2 border-l-destructive line-through",
  cancelled: "bg-muted/30 text-muted-foreground line-through",
  error: "bg-destructive/20 border-l-4 border-l-destructive",
  locked: "bg-muted/50 cursor-not-allowed",
};

/**
 * Status badge colors for PostingBanner.
 */
export const STATUS_BADGE_STYLES: Record<DocumentState, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-warning/20 text-warning-foreground border border-warning",
  approved: "bg-success/20 text-success-foreground border border-success",
  posted: "bg-primary/20 text-primary-foreground border border-primary",
  reversed: "bg-destructive/20 text-destructive-foreground border border-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
};

/**
 * Status labels for display.
 */
export const STATUS_LABELS: Record<DocumentState, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  posted: "Posted",
  reversed: "Reversed",
  cancelled: "Cancelled",
};
