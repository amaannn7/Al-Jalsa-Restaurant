import type { Metadata } from "next";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { GalleryUploader } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteGalleryImage, updateGalleryImage } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryAdmin() {
  await requireAdmin();
  const images = await db().galleryImage.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl uppercase">Gallery</h1>
        <p className="meta mt-1">The &ldquo;At the table&rdquo; photo section on the home page shows up to 10 photos, in this order.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((g) => (
          <li key={g.id} className={`border border-line bg-ink-2/60 p-3 ${g.isActive ? "" : "opacity-60"}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
              <Image src={g.url} alt={g.altEn} fill sizes="400px" className="object-cover" />
            </div>
            <form action={updateGalleryImage} className="mt-3 grid gap-2">
              <input type="hidden" name="id" value={g.id} />
              <input name="altEn" defaultValue={g.altEn} aria-label="Description (English)" className="input !min-h-10 !py-1.5" />
              <input name="altAr" defaultValue={g.altAr} aria-label="Description (Arabic)" dir="rtl" lang="ar" className="input !min-h-10 !py-1.5" />
              <div className="flex items-center gap-3">
                <input name="sortOrder" type="number" defaultValue={g.sortOrder} aria-label="Order" className="input !min-h-10 w-20 !py-1.5" />
                <label className="flex items-center gap-2 text-[0.9375rem] text-sand">
                  <input type="checkbox" name="isActive" defaultChecked={g.isActive} className="accent-[var(--color-gold)]" /> Shown
                </label>
                <button className="btn btn-line action ms-auto !min-h-10 !px-3">Save</button>
              </div>
            </form>
            <form action={deleteGalleryImage} className="mt-2">
              <input type="hidden" name="id" value={g.id} />
              <ConfirmButton message="Remove this photo from the gallery?" className="!px-3 !py-1.5">
                Remove
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
      <section className="border border-dashed border-line p-5">
        <h2 className="font-display text-lg uppercase">Add a photo</h2>
        <div className="mt-4">
          <GalleryUploader />
        </div>
      </section>
    </div>
  );
}
