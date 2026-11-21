import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PackageEditor } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePackage } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Catering packages" };

export default async function CateringAdmin({ searchParams }: PageProps<"/admin/catering">) {
  await requireAdmin();
  const sp = await searchParams;
  const packages = await db().cateringPackage.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl uppercase">Catering packages</h1>
        <p className="meta mt-1">Optional. With no packages, the catering page shows custom menus only. Add packages only with confirmed contents and prices.</p>
        {sp.deleted ? <p className="mt-2 text-ok">Package deleted.</p> : null}
      </header>
      {packages.map((p) => (
        <details key={p.id} className="border border-line bg-ink-2/60">
          <summary className="flex cursor-pointer items-center justify-between gap-3 p-4">
            <span className="text-ivory">{p.nameEn}</span>
            <span className="meta">{p.isActive ? "shown" : "hidden"}</span>
          </summary>
          <div className="border-t border-line p-4">
            <PackageEditor p={p} />
            <form action={deletePackage} className="mt-4">
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message={`Delete the package "${p.nameEn}"?`}>Delete package</ConfirmButton>
            </form>
          </div>
        </details>
      ))}
      <section className="border border-dashed border-line p-5">
        <h2 className="font-display text-lg uppercase">New package</h2>
        <div className="mt-4">
          <PackageEditor p={{ nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", includesEn: "", includesAr: "", priceHalalas: null, priceNoteEn: "", priceNoteAr: "", minGuests: null, sortOrder: packages.length, isActive: true, imageUrl: null }} />
        </div>
      </section>
    </div>
  );
}
