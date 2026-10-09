export type BucketKey = "users" | "media"

export interface StorageEnv {
  BUCKET_USERS?: R2Bucket
  BUCKET_MEDIA?: R2Bucket
  USERS_BUCKET?: R2Bucket
  MEDIA_BUCKET?: R2Bucket
  // Standardized names (preferred)
  BUCKET_URL_USERS?: string
  BUCKET_URL_MEDIA?: string
  // Legacy fallback
  USERS_BUCKET_URL?: string
  MEDIA_BUCKET_URL?: string
}

/**
 * Resolve the public base URL for a given bucket, preferring new env var names.
 */
function getBucketBaseUrl(
  bucketKey: BucketKey,
  env: Partial<StorageEnv>
): string | undefined {
  if (bucketKey === "users") {
    return env.BUCKET_URL_USERS || env.USERS_BUCKET_URL
  }
  return env.BUCKET_URL_MEDIA || env.MEDIA_BUCKET_URL
}

/**
 * Build a full public URL from an object key and bucket base URL.
 */
export function getPublicStorageUrl(
  bucketKey: BucketKey,
  objectKey: string,
  env: Partial<StorageEnv>
): string {
  const domain = getBucketBaseUrl(bucketKey, env)

  if (!domain) {
    throw new Error(
      `Public domain URL for bucket '${bucketKey}' is missing. Ensure BUCKET_URL_${bucketKey.toUpperCase()} is configured in environment variables.`
    )
  }

  const baseUrl = domain.replace(/\/$/, "")
  const cleanKey = objectKey.replace(/^\//, "")
  return `${baseUrl}/${cleanKey}`
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
  if (!pathOrUrl) return null
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl // Already absolute (legacy data)
  return getPublicStorageUrl(bucketKey, pathOrUrl, env)
}

/**
 * Extract the R2 object key from either a full URL or a relative path.
 */
export function toObjectKey(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      return new URL(pathOrUrl).pathname.replace(/^\//, "")
    } catch {
      return pathOrUrl
    }
  }
  return pathOrUrl.replace(/^\//, "")
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
  const bucket =
    bucketKey === "users"
      ? env.BUCKET_USERS || env.USERS_BUCKET
      : env.BUCKET_MEDIA || env.MEDIA_BUCKET

  if (!bucket) {
    throw new Error(
      `R2 Bucket binding '${bucketKey.toUpperCase()}' is missing.`
    )
  }

  await bucket.put(objectKey, data, {
    httpMetadata: {
      contentType: options?.contentType || "application/octet-stream",
    },
    customMetadata: options?.customMetadata,
  })

  return objectKey
}

/**
 * Delete an object from R2. Accepts either a relative object key or a full URL.
 */
export async function deleteFromR2(
  env: StorageEnv,
  bucketKey: BucketKey,
  objectKeyOrUrl: string
): Promise<void> {
  const bucket =
    bucketKey === "users"
      ? env.BUCKET_USERS || env.USERS_BUCKET
      : env.BUCKET_MEDIA || env.MEDIA_BUCKET

  if (!bucket) {
    throw new Error(
      `R2 Bucket binding '${bucketKey.toUpperCase()}' is missing.`
    )
  }

  await bucket.delete(toObjectKey(objectKeyOrUrl))
}

/**
 * Fetch an image from an external URL, bypass hotlink protection, and return binary data with content type.
 */
export async function fetchImageFromUrl(url: string): Promise<{
  arrayBuffer: ArrayBuffer
  contentType: string
  ext: string
}> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error(`Invalid image URL: "${url}"`)
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: `${parsedUrl.protocol}//${parsedUrl.host}/`,
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to download image from URL (Status ${response.status}): ${url}`
    )
  }

  let contentType = response.headers.get("content-type") || "image/jpeg"
  contentType = contentType.split(";")[0].trim().toLowerCase()

  let ext = "jpg"
  if (contentType.includes("webp")) ext = "webp"
  else if (contentType.includes("png")) ext = "png"
  else if (contentType.includes("gif")) ext = "gif"
  else if (contentType.includes("avif")) ext = "avif"
  else if (contentType.includes("svg")) ext = "svg"
  else {
    const pathnameExt = parsedUrl.pathname.split(".").pop()?.toLowerCase()
    if (
      pathnameExt &&
      ["webp", "png", "jpg", "jpeg", "gif", "avif"].includes(pathnameExt)
    ) {
      ext = pathnameExt === "jpeg" ? "jpg" : pathnameExt
      contentType = `image/${ext === "jpg" ? "jpeg" : ext}`
    }
  }

  const arrayBuffer = await response.arrayBuffer()
  if (arrayBuffer.byteLength === 0) {
    throw new Error(`Downloaded image is empty from URL: ${url}`)
  }

  return {
    arrayBuffer,
    contentType,
    ext,
  }
}
