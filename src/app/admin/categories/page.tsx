import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoryEditor } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteCategory } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Categories" };

export default async function Categories({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const sp = await searchParams;
  const cats = await db().category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { items: true } } } });
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl uppercase">Categories</h1>
        <p className="meta mt-1">The menu sections, in order. A category can only be deleted when it has no dishes.</p>
        {sp.error === "not-empty" ? <p className="mt-2 text-danger">Move or delete the dishes in that category first.</p> : null}
        {sp.deleted ? <p className="mt-2 text-ok">Category deleted.</p> : null}
      </header>
      {cats.map((c) => (
        <details key={c.id} className="border border-line bg-ink-2/60 open:bg-ink-2">
          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4">
            <span>
              <span className="text-ivory">{c.nameEn}</span>{" "}
              <span className="text-sand" lang="ar">
                {c.nameAr}
              </span>
            </span>
            <span className="meta">
              {c._count.items} dishes · order {c.sortOrder} {c.isActive ? "" : "· hidden"}
            </span>
          </summary>
          <div className="border-t border-line p-4">
            <CategoryEditor category={c} />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link href={`/admin/menu/new?category=${c.id}`} className="action link-underline text-gold">
                Add a dish here
              </Link>
              {c._count.items === 0 ? (
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Delete the category "${c.nameEn}"?`}>Delete category</ConfirmButton>
                </form>
              ) : null}
            </div>
          </div>
        </details>
      ))}
      <section className="border border-dashed border-line p-5">
        <h2 className="font-display text-lg uppercase">New category</h2>
        <div className="mt-4">
          <CategoryEditor />
        </div>
      </section>
    </div>
  );
}
