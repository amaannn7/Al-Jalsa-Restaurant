import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Overview" };

const LABELS: Record<string, string> = {
  whatsapp: "WhatsApp number for orders",
  phone: "Phone number",
  hours: "Opening hours",
  addressEn: "Address",
  "socials.facebook": "Facebook link",
  deliveryEnabled: "Whether you deliver yourselves",
  deliveryFeeHalalas: "Delivery fee",
  email: "Email address",
};

export default async function Overview({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const [newCount, items, unavailable, noPhoto, settings, recent, reviews] = await Promise.all([
    db().enquiry.count({ where: { status: "NEW" } }),
    db().menuItem.count({ where: { isActive: true } }),
    db().menuItem.count({ where: { isActive: true, isAvailable: false } }),
    db().menuItem.count({ where: { isActive: true, imageUrl: null } }),
    db().siteSettings.findUnique({ where: { id: 1 } }),
    db().enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db().review.count({ where: { isActive: true } }),
  ]);
  const todo = settings?.unconfirmed ?? [];
  return (
    <div className="grid gap-8">
      <header>
        <p className="eyebrow">Welcome, {admin.name}</p>
        <h1 className="font-display mt-2 text-3xl uppercase">Overview</h1>
        {sp.denied ? <p className="mt-3 text-danger">That section is only available to owners.</p> : null}
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { n: newCount, l: "New enquiries", h: "/admin/enquiries?status=NEW" },
          { n: items, l: "Dishes on the menu", h: "/admin/menu" },
          { n: unavailable, l: "Marked unavailable", h: "/admin/menu" },
          { n: reviews, l: "Reviews shown", h: "/admin/reviews" },
        ].map((s) => (
          <Link key={s.l} href={s.h} className="rounded-[20px] border border-line bg-ink-2/70 p-5 transition-colors hover:border-gold/60">
            <p className="font-display text-4xl text-gold">{s.n}</p>
            <p className="mt-1 text-sand">{s.l}</p>
          </Link>
        ))}
      </div>
      {todo.length ? (
        <section className="border border-gold/40 bg-gold/5 p-5">
          <h2 className="font-display text-lg uppercase">Please confirm</h2>
          <p className="meta mt-1">These details were taken from public listings and still need the restaurant&apos;s confirmation.</p>
          <ul className="mt-4 grid gap-2">
            {todo.map((k) => (
              <li key={k} className="flex items-center gap-3 text-sand">
                {LABELS[k] ?? k}
              </li>
            ))}
          </ul>
          <Link href="/admin/settings" className="action link-underline mt-4 inline-block text-gold">
            Open restaurant details
          </Link>
        </section>
      ) : null}
      {noPhoto ? (
        <p className="text-sand">
          {noPhoto} {noPhoto === 1 ? "dish has" : "dishes have"} no photo yet. <Link href="/admin/menu?filter=nophoto" className="link-underline text-gold">Add photos</Link>
        </p>
      ) : null}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg uppercase">Latest enquiries</h2>
          <Link href="/admin/enquiries" className="action link-underline text-gold inline-flex min-h-11 items-center">
            All enquiries
          </Link>
        </div>
        {recent.length ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-ivory/[0.03]">
                  <span>
                    <span className="me-3 text-[0.8125rem] uppercase tracking-wider text-gold">{e.type}</span>
                    {e.name}
                  </span>
                  <span className="meta">
                    {e.status} · {e.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Riyadh", dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="meta mt-4">No enquiries yet. Orders, catering and meeting requests appear here after customers send them.</p>
        )}
      </section>
    </div>
  );
}
