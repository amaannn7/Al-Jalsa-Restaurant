import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { toggleMenuFlag } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Menu items" };

function Flag({ id, flag, on, label }: { id: string; flag: string; on: boolean; label: string }) {
  return (
    <form action={toggleMenuFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="flag" value={flag} />
      <button type="submit" aria-pressed={on} className={`rounded-full border px-2.5 py-1 text-[0.8125rem] ${on ? "border-gold/70 bg-gold/15 text-gold" : "border-line text-muted hover:text-ivory"}`}>
        {label}
      </button>
    </form>
  );
}

export default async function MenuAdmin({ searchParams }: PageProps<"/admin/menu">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const noPhoto = sp.filter === "nophoto";
  const categories = await db().category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: {
          ...(q ? { OR: [{ nameEn: { contains: q, mode: "insensitive" } }, { nameAr: { contains: q } }] } : {}),
          ...(noPhoto ? { imageUrl: null } : {}),
        },
        orderBy: { sortOrder: "asc" },
        include: { variants: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase">Menu items</h1>
          <p className="meta mt-1">Click a flag to switch it on or off. Changes appear on the website straight away.</p>
          {sp.saved ? <p className="mt-2 text-ok">Dish added.</p> : null}
          {sp.deleted ? <p className="mt-2 text-ok">Dish deleted.</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <form className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search dishes" aria-label="Search dishes" className="input !min-h-11" />
            <button className="btn btn-line action !min-h-11">Search</button>
          </form>
          <Link href="/admin/menu/new" className="btn btn-gold action !min-h-11">
            Add dish
          </Link>
        </div>
      </header>
      {categories.map((c) =>
        c.items.length ? (
          <section key={c.id}>
            <h2 className="font-display border-b border-line pb-2 text-lg uppercase">
              {c.nameEn} <span className="meta normal-case">({c.items.length})</span>
            </h2>
            <ul className="divide-y divide-line">
              {c.items.map((i) => (
                <li key={i.id} className={`flex flex-wrap items-center gap-4 py-3 ${i.isActive ? "" : "opacity-50"}`}>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-ink-3">{i.imageUrl ? <Image src={i.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : null}</div>
                  <Link href={`/admin/menu/${i.id}`} className="min-w-[12rem] flex-1">
                    <span className="block text-ivory hover:text-gold">{i.nameEn}</span>
                    <span className="meta block" lang="ar" dir="rtl">
                      {i.nameAr}
                    </span>
                  </Link>
                  <span className="w-40 text-[0.9375rem] text-sand">
                    {i.variants.map((v) => `${v.nameEn ? `${v.nameEn} ` : ""}${v.priceHalalas == null ? "on request" : formatPrice(v.priceHalalas, "en")}`).join(" · ")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <Flag id={i.id} flag="isAvailable" on={i.isAvailable} label="Available" />
                    <Flag id={i.id} flag="isFeatured" on={i.isFeatured} label="Featured" />
                    <Flag id={i.id} flag="isPopular" on={i.isPopular} label="Popular" />
                    <Flag id={i.id} flag="isActive" on={i.isActive} label="Shown" />
                  </div>
                  <Link href={`/admin/menu/${i.id}`} className="action link-underline text-gold">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
