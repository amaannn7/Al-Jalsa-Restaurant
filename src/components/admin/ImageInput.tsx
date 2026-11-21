"use client";

import { useRef, useState } from "react";

/**
 * File input that previews the image and shrinks it in the browser (max 1800px) before upload,
 * so phone photos stay under the upload limit. `alpha` keeps transparency (cut-out plates).
 */
export function ImageInput({
  name,
  label,
  current,
  alpha = false,
  hint,
  error,
  removable = false,
  removeName,
}: {
  name: string;
  label: string;
  current?: string | null;
  alpha?: boolean;
  hint?: string;
  error?: string;
  removable?: boolean;
  removeName?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setNote(null);
    try {
      const bitmap = await createImageBitmap(f);
      const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d")!;
      if (!alpha) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const type = alpha ? "image/png" : "image/jpeg";
      const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), type, 0.88));
      if (blob.size > 4 * 1024 * 1024) {
        setNote("This image is still over 4 MB after resizing. Try a smaller file.");
      }
      const resized = new File([blob], f.name.replace(/\.\w+$/, alpha ? ".png" : ".jpg"), { type });
      const dt = new DataTransfer();
      dt.items.add(resized);
      input.current!.files = dt.files;
      setPreview(URL.createObjectURL(resized));
      setNote(`Ready to upload (${canvas.width} x ${canvas.height}px, ${Math.round(blob.size / 1024)} KB).`);
    } catch {
      setPreview(URL.createObjectURL(f));
      setNote("Preview only; the original file will be uploaded.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        <div className={`relative h-28 w-28 shrink-0 overflow-hidden border border-line ${alpha ? "bg-[conic-gradient(#2a231e_25%,#1a1613_0_50%,#2a231e_0_75%,#1a1613_0)] bg-[length:16px_16px]" : "bg-ink-3"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" className={`h-full w-full ${alpha ? "object-contain" : "object-cover"}`} /> : <span className="meta grid h-full place-items-center">No image</span>}
        </div>
        <div className="grid gap-2">
          <input ref={input} type="file" name={name} accept="image/jpeg,image/png,image/webp,image/avif" onChange={onChange} className="text-[0.9375rem] text-sand file:me-3 file:cursor-pointer file:border file:border-line file:bg-ink-3 file:px-3 file:py-2 file:text-ivory" />
          {removable && current ? (
            <label className="flex items-center gap-2 text-[0.9375rem] text-sand">
              <input type="checkbox" name={removeName} className="accent-[var(--color-gold)]" /> Remove current image
            </label>
          ) : null}
          {busy ? <span className="meta">Preparing image...</span> : note ? <span className="meta">{note}</span> : hint ? <span className="meta">{hint}</span> : null}
          {error ? <span className="field-error">{error}</span> : null}
        </div>
      </div>
    </div>
  );
}
