/**
 * Posting Spine server actions.
 *
 * Implements B1 — Posting Spine operations with:
 * - State machine transitions
 * - 6W1H context recording
 * - Danger zone metadata capture
 * - Audit logging
 * - Permission checks
 */

"use server";

import { getCurrentUser } from "../auth/session";
import { createDbClient } from "@axis/db/client";
import {
  createDocument,
  transitionDocumentState,
  postDocument,
  reverseDocument,
  findDocumentById,
} from "@axis/db/queries";
import {
  submitDocumentFormSchema,
  approveDocumentFormSchema,
  postDocumentFormSchema,
  reverseDocumentFormSchema,
} from "@axis/db/validation";
import {
  type SixW1HContext,
  type DangerZoneMetadata,
} from "@axis/db/schema";
import { getUserTenantMembership } from "../db/users";
import { findTenantBySlug } from "../db/tenants";
import { logAuditEvent } from "../db/audit";
import { logger } from "../logger";

const db = createDbClient(process.env.DATABASE_URL!);

export interface PostingActionResult {
  success: boolean;
  error?: string;
  documentId?: string;
  fieldErrors?: Record<string, string[]>;
}

// ============================================================================
// Helper: Build 6W1H Context
// ============================================================================

async function build6W1HContext(params: {
  userId: string;
  userName: string;
  userRole: string;
  tenantId: string;
  documentId: string;
  action: string;
  description: string;
  documentType: string;
  reason: string;
  ipAddress?: string;
}): Promise<SixW1HContext> {
  const now = new Date().toISOString();

  return {
    who: {
      userId: params.userId,
      userName: params.userName,
      role: params.userRole,
    },
    what: {
      action: params.action,
      description: params.description,
      documentType: params.documentType as any,
    },
    when: {
      timestamp: now,
      timezone: "UTC",
    },
    where: {
      system: "AXIS",
      ipAddress: params.ipAddress,
    },
    why: {
      reason: params.reason,
    },
    which: {
      tenantId: params.tenantId,
      documentId: params.documentId,
    },
    how: {
      method: "server_action",
      validation: "zod_v4",
    },
  };
}

// ============================================================================
// Document Creation
// ============================================================================

/**
 * Create a new document in DRAFT state.
 */
export async function createDocumentAction(
  tenantSlug: string,
  _prevState: PostingActionResult,
  formData: FormData
): Promise<PostingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Workspace not found" };
  }

  // Check membership
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
    return { success: false, error: "Insufficient permissions" };
  }

  // Parse and validate form data
  const parseResult = submitDocumentFormSchema.safeParse({
    documentType: formData.get("documentType"),
    documentDate: formData.get("documentDate"),
    entityId: formData.get("entityId") || undefined,
    data: JSON.parse((formData.get("data") as string) || "{}"),
    reason: formData.get("reason"),
  });

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    return {
      success: false,
      error: Object.values(fieldErrors).flat()[0] ?? "Validation failed",
      fieldErrors: fieldErrors as Record<string, string[]>,
    };
  }

  const { documentType, documentDate, entityId, data, reason } = parseResult.data;

  try {
    // Generate document number (simplified - should be sequence-based)
    const documentNumber = `${documentType.toUpperCase()}-${Date.now()}`;

    // Build 6W1H context
    const context6w1h = await build6W1HContext({
      userId: user.id,
      userName: user.name ?? user.email,
      userRole: membership.role,
      tenantId: tenant.id,
      documentId: "pending", // Will be set after creation
      action: "document.create",
      description: `Created ${documentType} document`,
      documentType,
      reason,
    });

    // Update context with self-reference (will be filled by DB)
    const fullContext: SixW1HContext = {
      ...context6w1h,
      which: { ...context6w1h.which, documentId: "pending" },
    };

    const document = await createDocument(db, {
      tenantId: tenant.id,
      userId: user.id,
      data: {
        documentType,
        documentNumber,
        documentDate,
        entityId,
        data, // Business data (line items, totals, etc.)
        context6w1h: fullContext,
      },
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "document.create",
      resourceType: "document",
      resourceId: document.id,
      metadata: { documentType, documentNumber },
    });

    return {
      success: true,
      documentId: document.id,
    };
  } catch (error) {
    logger.error("Create document error", error);
    return { success: false, error: "Failed to create document" };
  }
}

// ============================================================================
// State Transitions
// ============================================================================

/**
 * Submit document for approval (DRAFT → SUBMITTED).
 */
export async function submitDocumentAction(
  tenantSlug: string,
  documentId: string,
  reason: string
): Promise<PostingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Workspace not found" };
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    const document = await findDocumentById(db, {
      tenantId: tenant.id,
      documentId,
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    const context6w1h = await build6W1HContext({
      userId: user.id,
      userName: user.name ?? user.email,
      userRole: membership.role,
      tenantId: tenant.id,
      documentId,
      action: "document.submit",
      description: "Submitted document for approval",
      documentType: document.documentType,
      reason,
    });

    await transitionDocumentState(db, {
      tenantId: tenant.id,
      userId: user.id,
      documentId,
      newState: "submitted",
      context6w1h,
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "document.submit",
      resourceType: "document",
      resourceId: documentId,
      metadata: { documentNumber: document.documentNumber },
    });

    return { success: true, documentId };
  } catch (error) {
    logger.error("Submit document error", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Approve document (SUBMITTED → APPROVED).
 */
export async function approveDocumentAction(
  tenantSlug: string,
  _prevState: PostingActionResult,
  formData: FormData
): Promise<PostingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Workspace not found" };
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Only owners and admins can approve documents" };
  }

  const parseResult = approveDocumentFormSchema.safeParse({
    documentId: formData.get("documentId"),
    reason: formData.get("reason"),
    overrideReason: formData.get("overrideReason") || undefined,
  });

  if (!parseResult.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { documentId, reason, overrideReason } = parseResult.data;

  try {
    const document = await findDocumentById(db, {
      tenantId: tenant.id,
      documentId,
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    const context6w1h = await build6W1HContext({
      userId: user.id,
      userName: user.name ?? user.email,
      userRole: membership.role,
      tenantId: tenant.id,
      documentId,
      action: "document.approve",
      description: "Approved document for posting",
      documentType: document.documentType,
      reason,
    });

    // Build danger zone metadata if override reason provided
    let dangerZone: DangerZoneMetadata | undefined;
    if (overrideReason) {
      dangerZone = {
        violatesPolicy: true,
        warning: "Policy override detected",
        overrideReason,
        approvedBy: {
          userId: user.id,
          userName: user.name ?? user.email,
          timestamp: new Date().toISOString(),
        },
      };
    }

    await transitionDocumentState(db, {
      tenantId: tenant.id,
      userId: user.id,
      documentId,
      newState: "approved",
      context6w1h,
      dangerZone,
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "document.approve",
      resourceType: "document",
      resourceId: documentId,
      metadata: {
        documentNumber: document.documentNumber,
        overrideReason,
      },
    });

    return { success: true, documentId };
  } catch (error) {
    logger.error("Approve document error", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Post document (APPROVED → POSTED).
 * Creates economic events and ledger postings.
 */
export async function postDocumentAction(
  tenantSlug: string,
  _prevState: PostingActionResult,
  formData: FormData
): Promise<PostingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Workspace not found" };
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Only owners and admins can post documents" };
  }

  const parseResult = postDocumentFormSchema.safeParse({
    documentId: formData.get("documentId"),
    postingDate: formData.get("postingDate"),
    reason: formData.get("reason"),
  });

  if (!parseResult.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { documentId, postingDate, reason } = parseResult.data;

  try {
    const document = await findDocumentById(db, {
      tenantId: tenant.id,
      documentId,
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    const context6w1h = await build6W1HContext({
      userId: user.id,
      userName: user.name ?? user.email,
      userRole: membership.role,
      tenantId: tenant.id,
      documentId,
      action: "document.post",
      description: "Posted document to ledger",
      documentType: document.documentType,
      reason,
    });

    // Generate postings based on document type (simplified example)
    const result = await postDocument(db, {
      tenantId: tenant.id,
      userId: user.id,
      documentId,
      postingDate,
      context6w1h,
      generatePostings: async (doc) => {
        // TODO: Implement actual posting logic per document type
        // For now, return empty array (will fail in production)
        // This should be moved to domain-specific modules in future phases

        if (doc.documentType === "sales_invoice") {
          // Example: DR Accounts Receivable, CR Revenue
          const amount = String(doc.data.total || "0");
          
          return [
            {
              eventType: "revenue" as const,
              description: `Sales invoice ${doc.documentNumber}`,
              amount,
              postings: [
                {
                  accountId: "TODO", // Should lookup from chart of accounts
                  direction: "debit" as const,
                  amount,
                  description: "Accounts Receivable",
                },
                {
                  accountId: "TODO", // Should lookup from chart of accounts
                  direction: "credit" as const,
                  amount,
                  description: "Revenue",
                },
              ],
            },
          ];
        }

        throw new Error(`Posting logic not implemented for ${doc.documentType}`);
      },
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "document.post",
      resourceType: "document",
      resourceId: documentId,
      metadata: {
        documentNumber: document.documentNumber,
        eventsCreated: result.events.length,
        postingsCreated: result.postings.length,
      },
    });

    return { success: true, documentId };
  } catch (error) {
    logger.error("Post document error", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Reverse a posted document (POSTED → REVERSED).
 */
export async function reverseDocumentAction(
  tenantSlug: string,
  _prevState: PostingActionResult,
  formData: FormData
): Promise<PostingActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Workspace not found" };
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Only owners can reverse posted documents" };
  }

  const parseResult = reverseDocumentFormSchema.safeParse({
    documentId: formData.get("documentId"),
    reversalDate: formData.get("reversalDate"),
    reason: formData.get("reason"),
  });

  if (!parseResult.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { documentId, reversalDate, reason } = parseResult.data;

  try {
    const document = await findDocumentById(db, {
      tenantId: tenant.id,
      documentId,
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    const context6w1h = await build6W1HContext({
      userId: user.id,
      userName: user.name ?? user.email,
      userRole: membership.role,
      tenantId: tenant.id,
      documentId,
      action: "document.reverse",
      description: "Reversed posted document",
      documentType: document.documentType,
      reason,
    });

    const result = await reverseDocument(db, {
      tenantId: tenant.id,
      userId: user.id,
      documentId,
      reversalDate,
      context6w1h,
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "document.reverse",
      resourceType: "document",
      resourceId: documentId,
      metadata: {
        originalDocNumber: result.originalDocument.documentNumber,
        reversalDocNumber: result.reversalDocument.documentNumber,
        reversalEventsCreated: result.reversalEvents.length,
        reversalPostingsCreated: result.reversalPostings.length,
      },
    });

    return { success: true, documentId: result.reversalDocument.id };
  } catch (error) {
    logger.error("Reverse document error", error);
    return { success: false, error: String(error) };
  }
}
