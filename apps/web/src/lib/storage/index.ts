/**
 * R2/S3 storage service.
 *
 * Pattern: Cloudflare R2 storage with presigned URLs.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "axis-attachments";

const isConfigured =
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY;

const s3Client = isConfigured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export interface UploadResult {
  success: boolean;
  error?: string;
  key?: string;
  url?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  error?: string;
  uploadUrl?: string;
  key?: string;
}

/**
 * Generate a unique file key.
 */
export function generateFileKey(params: {
  tenantId: string;
  folder?: string;
  filename: string;
}): string {
  const { tenantId, folder, filename } = params;
  const timestamp = Date.now();
  const randomId = crypto.randomUUID().slice(0, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = folder ? `${folder}/` : "";
  return `${tenantId}/${path}${timestamp}-${randomId}-${sanitizedFilename}`;
}

/**
 * Get a presigned URL for uploading a file.
 */
export async function getPresignedUploadUrl(params: {
  tenantId: string;
  filename: string;
  contentType: string;
  folder?: string;
  expiresIn?: number;
}): Promise<PresignedUrlResult> {
  if (!s3Client) {
    return { success: false, error: "Storage not configured" };
  }

  const { tenantId, filename, contentType, folder, expiresIn = 3600 } = params;
  const key = generateFileKey({ tenantId, folder, filename });

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return { success: true, uploadUrl, key };
  } catch (error) {
    console.error("Get presigned upload URL error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate URL",
    };
  }
}

/**
 * Get a presigned URL for downloading a file.
 */
export async function getPresignedDownloadUrl(params: {
  key: string;
  expiresIn?: number;
}): Promise<PresignedUrlResult> {
  if (!s3Client) {
    return { success: false, error: "Storage not configured" };
  }

  const { key, expiresIn = 3600 } = params;

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

    return { success: true, uploadUrl, key };
  } catch (error) {
    console.error("Get presigned download URL error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate URL",
    };
  }
}

/**
 * Upload a file directly (server-side).
 */
export async function uploadFile(params: {
  tenantId: string;
  filename: string;
  contentType: string;
  body: Buffer | Uint8Array | string;
  folder?: string;
}): Promise<UploadResult> {
  if (!s3Client) {
    return { success: false, error: "Storage not configured" };
  }

  const { tenantId, filename, contentType, body, folder } = params;
  const key = generateFileKey({ tenantId, folder, filename });

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    return { success: true, key };
  } catch (error) {
    console.error("Upload file error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload",
    };
  }
}

/**
 * Delete a file.
 */
export async function deleteFile(key: string): Promise<UploadResult> {
  if (!s3Client) {
    return { success: false, error: "Storage not configured" };
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("Delete file error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete",
    };
  }
}
