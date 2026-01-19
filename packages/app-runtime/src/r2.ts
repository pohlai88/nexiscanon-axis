// packages/app-runtime/src/r2.ts
// R2 (S3-compatible) client for file storage

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export type R2Client = {
  putObject(params: {
    key: string;
    body: Buffer | ReadableStream | Uint8Array;
    contentType: string;
  }): Promise<void>;

  getObject(key: string): Promise<Buffer>;

  getSignedGetUrl(key: string, ttlSeconds?: number): Promise<{ url: string; expiresAt: string }>;

  objectExists(key: string): Promise<boolean>;
};

/**
 * Get R2 configuration from environment variables.
 * Returns undefined if not configured (allows graceful fallback).
 */
export function getR2Config(): R2Config | undefined {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return undefined;
  }

  return { accountId, accessKeyId, secretAccessKey, bucket };
}

/**
 * Create R2 client (S3-compatible).
 * Emits one-time wiring log on first call.
 */
let clientInstance: R2Client | undefined;
let wiringLogged = false;

export function getR2Client(): R2Client {
  if (clientInstance) return clientInstance;

  const config = getR2Config();
  if (!config) {
    throw new Error("R2 not configured (missing env vars)");
  }

  // S3 client configured for R2
  const s3 = new S3Client({
    region: "auto", // R2 uses "auto" region
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: false, // R2 uses virtual-hosted style by default
  });

  // Emit one-time wiring log
  if (!wiringLogged) {
    console.log(
      JSON.stringify({
        event: "infra.wiring",
        r2: "enabled",
        bucket: config.bucket,
      })
    );
    wiringLogged = true;
  }

  clientInstance = {
    async putObject({ key, body, contentType }) {
      await s3.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body as Buffer,
          ContentType: contentType,
        })
      );
    },

    async getObject(key) {
      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      const response = await s3.send(command);

      // Convert stream to buffer
      if (response.Body instanceof Readable) {
        const chunks: Buffer[] = [];
        for await (const chunk of response.Body as any) {
          chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
      }

      // If Body is already a buffer/uint8array
      if (response.Body) {
        return Buffer.from(await (response.Body as any).transformToByteArray());
      }

      throw new Error("R2 getObject returned empty body");
    },

    async getSignedGetUrl(key, ttlSeconds = 300) {
      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: ttlSeconds });
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

      return { url, expiresAt };
    },

    async objectExists(key) {
      try {
        await s3.send(
          new HeadObjectCommand({
            Bucket: config.bucket,
            Key: key,
          })
        );
        return true;
      } catch {
        return false;
      }
    },
  };

  return clientInstance;
}
