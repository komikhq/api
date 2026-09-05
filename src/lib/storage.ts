export type BucketKey = "users" | "media";

export interface StorageEnv {
  USERS_BUCKET: R2Bucket;
  MEDIA_BUCKET: R2Bucket;
  USERS_BUCKET_URL?: string;
  MEDIA_BUCKET_URL?: string;
}

const PUBLIC_DOMAINS: Record<BucketKey, string> = {
  users: "https://cdn-01.komikhq.com",
  media: "https://cdn-02.komikhq.com",
};

export function getPublicStorageUrl(
  bucketKey: BucketKey,
  objectKey: string,
  env?: Partial<StorageEnv>
): string {
  const customUrl =
    bucketKey === "users" ? env?.USERS_BUCKET_URL : env?.MEDIA_BUCKET_URL;
  const baseUrl = (customUrl || PUBLIC_DOMAINS[bucketKey]).replace(/\/$/, "");
  const cleanKey = objectKey.replace(/^\//, "");
  return `${baseUrl}/${cleanKey}`;
}

export async function uploadToR2(
  env: StorageEnv,
  bucketKey: BucketKey,
  objectKey: string,
  data: ArrayBuffer | Uint8Array | ReadableStream | string,
  options?: { contentType?: string; customMetadata?: Record<string, string> }
): Promise<string> {
  const bucket = bucketKey === "users" ? env.USERS_BUCKET : env.MEDIA_BUCKET;

  if (!bucket) {
    throw new Error(`R2 Bucket binding '${bucketKey.toUpperCase()}_BUCKET' is missing.`);
  }

  await bucket.put(objectKey, data, {
    httpMetadata: {
      contentType: options?.contentType || "application/octet-stream",
    },
    customMetadata: options?.customMetadata,
  });

  return getPublicStorageUrl(bucketKey, objectKey, env);
}

export async function deleteFromR2(
  env: StorageEnv,
  bucketKey: BucketKey,
  objectKey: string
): Promise<void> {
  const bucket = bucketKey === "users" ? env.USERS_BUCKET : env.MEDIA_BUCKET;

  if (!bucket) {
    throw new Error(`R2 Bucket binding '${bucketKey.toUpperCase()}_BUCKET' is missing.`);
  }

  await bucket.delete(objectKey);
}
