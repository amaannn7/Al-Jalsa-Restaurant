import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * Validates and re-encodes an uploaded image (strips metadata, max 1800px, WebP), then stores
 * it in Vercel Blob when configured, or in /public/uploads during local development.
 * `keepAlpha` preserves transparency for cut-out plates.
 */
export async function storeImage(file: File, folder: "menu" | "gallery" | "catering", keepAlpha = false): Promise<string> {
  if (!TYPES.has(file.type)) throw new Error("Upload a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_BYTES) throw new Error("Images must be 4 MB or smaller.");
  const input = Buffer.from(await file.arrayBuffer());
  let img = sharp(input, { failOn: "error" }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error("That file is not a readable image.");
  img = img.resize(1800, 1800, { fit: "inside", withoutEnlargement: true });
  if (!keepAlpha) img = img.flatten({ background: "#ffffff" });
  const out = await img.webp({ quality: 84, alphaQuality: 90 }).toBuffer();
  const name = `${folder}/${randomUUID()}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, out, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("Image uploads need a Vercel Blob store. Add one in the Vercel dashboard (Storage > Blob) and redeploy.");
  }
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), out);
  return `/uploads/${name}`;
}

/** Removes a Blob file we uploaded earlier (local files and seed images are left alone). */
export async function removeStoredImage(url: string | null | undefined) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN || !url.includes(".blob.vercel-storage.com")) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(url);
  } catch (e) {
    console.error("blob delete failed", e);
  }
}
