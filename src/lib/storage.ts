export type BucketKey = "users" | "media";

export interface StorageEnv {
  BUCKET_USERS?: R2Bucket;
  BUCKET_MEDIA?: R2Bucket;
  USERS_BUCKET?: R2Bucket;
  MEDIA_BUCKET?: R2Bucket;
  // Standardized names (preferred)
  BUCKET_URL_USERS?: string;
  BUCKET_URL_MEDIA?: string;
  // Legacy fallback
  USERS_BUCKET_URL?: string;
  MEDIA_BUCKET_URL?: string;
}

/**
 * Resolve the public base URL for a given bucket, preferring new env var names.
 */
function getBucketBaseUrl(bucketKey: BucketKey, env: Partial<StorageEnv>): string | undefined {
  if (bucketKey === "users") {
    return env.BUCKET_URL_USERS || env.USERS_BUCKET_URL;
  }
  return env.BUCKET_URL_MEDIA || env.MEDIA_BUCKET_URL;
}

/**
 * Build a full public URL from an object key and bucket base URL.
 */
export function getPublicStorageUrl(
  bucketKey: BucketKey,
  objectKey: string,
  env: Partial<StorageEnv>
): string {
  const domain = getBucketBaseUrl(bucketKey, env);

  if (!domain) {
    throw new Error(
      `Public domain URL for bucket '${bucketKey}' is missing. Ensure BUCKET_URL_${bucketKey.toUpperCase()} is configured in environment variables.`
    );
  }

  const baseUrl = domain.replace(/\/$/, "");
  const cleanKey = objectKey.replace(/^\//, "");
  return `${baseUrl}/${cleanKey}`;
}

/**
 * Convert a relative object key (or already-absolute URL) into a full public URL.
 * Returns null for null/undefined input. Idempotent for already-absolute URLs.
 */
export function toPublicUrl(
  pathOrUrl: string | null | undefined,
  bucketKey: BucketKey,
  env: Partial<StorageEnv>
): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl; // Already absolute (legacy data)
  return getPublicStorageUrl(bucketKey, pathOrUrl, env);
}

/**
 * Extract the R2 object key from either a full URL or a relative path.
 */
export function toObjectKey(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      return new URL(pathOrUrl).pathname.replace(/^\//, "");
    } catch {
      return pathOrUrl;
    }
  }
  return pathOrUrl.replace(/^\//, "");
}

/**
 * Upload a file to R2 and return the **relative object key** for database storage.
 */
export async function uploadToR2(
  env: StorageEnv,
  bucketKey: BucketKey,
  objectKey: string,
  data: ArrayBuffer | Uint8Array | ReadableStream | string,
  options?: { contentType?: string; customMetadata?: Record<string, string> }
): Promise<string> {
  const bucket = bucketKey === "users"
    ? (env.BUCKET_USERS || env.USERS_BUCKET)
    : (env.BUCKET_MEDIA || env.MEDIA_BUCKET);

  if (!bucket) {
    throw new Error(`R2 Bucket binding '${bucketKey.toUpperCase()}' is missing.`);
  }

  await bucket.put(objectKey, data, {
    httpMetadata: {
      contentType: options?.contentType || "application/octet-stream",
    },
    customMetadata: options?.customMetadata,
  });

  return objectKey;
}

/**
 * Delete an object from R2. Accepts either a relative object key or a full URL.
 */
export async function deleteFromR2(
  env: StorageEnv,
  bucketKey: BucketKey,
  objectKeyOrUrl: string
): Promise<void> {
  const bucket = bucketKey === "users"
    ? (env.BUCKET_USERS || env.USERS_BUCKET)
    : (env.BUCKET_MEDIA || env.MEDIA_BUCKET);

  if (!bucket) {
    throw new Error(`R2 Bucket binding '${bucketKey.toUpperCase()}' is missing.`);
  }

  await bucket.delete(toObjectKey(objectKeyOrUrl));
}
