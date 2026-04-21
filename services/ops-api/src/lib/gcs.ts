/**
 * GCS image upload using the official @google-cloud/storage SDK.
 *
 * Auth: Application Default Credentials (ADC).
 *  - Cloud Run: the service identity is resolved automatically — no config needed.
 *  - Local dev: run `gcloud auth application-default login`, or leave
 *    GCS_BUCKET_NAME unset to skip uploads entirely (falls back to CDN URLs).
 *
 * When GCS_BUCKET_NAME is unset all calls return null so the caller can fall
 * back to the original URL.
 */

import { Storage } from "@google-cloud/storage";
import { extname } from "node:path";

let _storage: Storage | null = null;

function getStorage(): Storage {
  if (!_storage) _storage = new Storage(); // ADC, no options needed
  return _storage;
}

function contentTypeFromUrl(url: string): string {
  const ext = extname(url.split("?")[0]).toLowerCase();
  const map: Record<string, string> = {
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".webp": "image/webp",
    ".gif":  "image/gif",
  };
  return map[ext] ?? "image/jpeg";
}

/**
 * Download an image from `sourceUrl` and upload it to GCS at `key`.
 *
 * Returns the public GCS URL on success, null otherwise.
 * Never throws.
 */
export async function uploadImageToGcs(sourceUrl: string, key: string): Promise<string | null> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) return null; // dev mode — skip

  let body: Buffer;
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      console.warn(`[gcs] fetch failed ${sourceUrl}: ${res.status}`);
      return null;
    }
    body = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.warn(`[gcs] fetch error ${sourceUrl}:`, err);
    return null;
  }

  try {
    const file = getStorage().bucket(bucketName).file(key);
    await file.save(body, {
      contentType: contentTypeFromUrl(sourceUrl),
      predefinedAcl: "publicRead",
    });
  } catch (err) {
    console.warn(`[gcs] upload failed key=${key}:`, err);
    return null;
  }

  return `https://storage.googleapis.com/${bucketName}/${key}`;
}

/**
 * Upload all images for a competitor product.
 *
 * @param productId   Used to build the GCS key path.
 * @param imageUrls   Pipe-separated list of source CDN URLs.
 * @returns Pipe-separated list of resolved URLs (GCS if upload succeeded,
 *          original CDN URL as fallback).
 */
export async function uploadCompetitorImages(
  productId: string,
  imageUrls: string,
): Promise<string> {
  const urls = imageUrls.split(" | ").map((u) => u.trim()).filter(Boolean);

  const resolved = await Promise.all(
    urls.map(async (url, i) => {
      const ext = extname(url.split("?")[0]).toLowerCase() || ".jpg";
      const key = `competitor/blinds-com/${productId}/main_${String(i).padStart(2, "0")}${ext}`;
      const gcsUrl = await uploadImageToGcs(url, key);
      return gcsUrl ?? url; // fall back to original CDN URL
    }),
  );

  return resolved.join(" | ");
}