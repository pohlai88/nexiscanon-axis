/**
 * Upload API route.
 *
 * Pattern: API route for generating presigned upload URLs.
 * Protected by Arcjet rate limiting.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getUserTenantMembership } from "@/lib/db/users";
import { getPresignedUploadUrl } from "@/lib/storage";
import { apiProtection, isArcjetConfigured } from "@/lib/arcjet";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? "unknown";
  const log = logger.child({ requestId, endpoint: "/api/upload" });

  // Arcjet protection
  if (isArcjetConfigured()) {
    const decision = await apiProtection.protect(request);
    if (decision.isDenied()) {
      log.warn("Upload request denied by Arcjet", { reason: decision.reason });
      if (decision.reason.isRateLimit()) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
      return NextResponse.json({ error: "Request denied" }, { status: 403 });
    }
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tenantSlug, filename, contentType, folder } = body;

    if (!tenantSlug || !filename || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: tenantSlug, filename, contentType" },
        { status: 400 }
      );
    }

    // Validate tenant access
    const tenant = await findTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const membership = await getUserTenantMembership(user.id, tenant.id);
    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Validate content type (basic security)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/json",
      "application/zip",
    ];

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max in filename check - actual enforcement happens client-side)
    const MAX_FILENAME_LENGTH = 255;
    if (filename.length > MAX_FILENAME_LENGTH) {
      return NextResponse.json(
        { error: "Filename too long" },
        { status: 400 }
      );
    }

    const result = await getPresignedUploadUrl({
      tenantId: tenant.id,
      filename,
      contentType,
      folder,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to generate upload URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      key: result.key,
    });
  } catch (error) {
    log.error("Upload API error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
