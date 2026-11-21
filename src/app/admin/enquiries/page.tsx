import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { EnquiryStatus, EnquiryType } from "@/generated/prisma/enums";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Enquiries" };
const TYPES: EnquiryType[] = ["ORDER", "CATERING", "MEETING", "CONTACT"];
const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "CLOSED"];

export default async function Enquiries({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const type = TYPES.find((t) => t === sp.type);
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number(sp.page) || 1);
  const where = { ...(type ? { type } : {}), ...(status ? { status } : {}) };
  const [rows, total] = await Promise.all([
    db().enquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: 30, skip: (page - 1) * 30 }),
    db().enquiry.count({ where }),
  ]);
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { type, status, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/admin/enquiries${p.size ? `?${p}` : ""}`;
  };
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl uppercase">Enquiries</h1>
        <p className="meta mt-1 max-w-2xl">
          A copy of every order, catering request, meeting request and message started on the website. The customer still has to press send in WhatsApp, so an entry here does not always mean a message arrived.
        </p>
        {sp.deleted ? <p className="mt-2 text-ok">Enquiry deleted.</p> : null}
      </header>
      <div className="flex flex-wrap gap-2">
        <Link href={link({ type: undefined })} className={`rounded-full border px-3 py-1.5 text-[0.875rem] ${!type ? "border-gold text-gold" : "border-line text-sand"}`}>
          All types
        </Link>
        {TYPES.map((t) => (
          <Link key={t} href={link({ type: t })} className={`rounded-full border px-3 py-1.5 text-[0.875rem] ${type === t ? "border-gold text-gold" : "border-line text-sand"}`}>
            {t.toLowerCase()}
          </Link>
        ))}
        <span className="mx-2 w-px bg-line" />
        <Link href={link({ status: undefined })} className={`rounded-full border px-3 py-1.5 text-[0.875rem] ${!status ? "border-gold text-gold" : "border-line text-sand"}`}>
          Any status
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={link({ status: s })} className={`rounded-full border px-3 py-1.5 text-[0.875rem] ${status === s ? "border-gold text-gold" : "border-line text-sand"}`}>
            {s.toLowerCase()}
          </Link>
        ))}
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-start text-[0.9375rem]">
            <thead className="text-start text-muted">
              <tr className="border-b border-line">
                <th className="py-2 text-start font-normal">Received</th>
                <th className="py-2 text-start font-normal">Type</th>
                <th className="py-2 text-start font-normal">Name</th>
                <th className="py-2 text-start font-normal">Phone</th>
                <th className="py-2 text-start font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-ivory/[0.03]">
                  <td className="py-3 text-sand">{e.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Riyadh", dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="py-3 text-gold">{e.type.toLowerCase()}</td>
                  <td className="py-3">
                    <Link href={`/admin/enquiries/${e.id}`} className="link-underline text-ivory">
                      {e.name}
                    </Link>
                  </td>
                  <td className="py-3 text-sand" dir="ltr">
                    {e.phone}
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[0.8125rem] ${e.status === "NEW" ? "bg-gold/20 text-gold" : e.status === "CONTACTED" ? "bg-ok/15 text-ok" : "bg-ivory/10 text-muted"}`}>{e.status.toLowerCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="meta">Nothing here yet.</p>
      )}
      {total > 30 ? (
        <div className="flex gap-4">
          {page > 1 ? <Link href={link({ page: String(page - 1) })} className="action link-underline text-gold">Newer</Link> : null}
          {page * 30 < total ? <Link href={link({ page: String(page + 1) })} className="action link-underline text-gold">Older</Link> : null}
        </div>
      ) : null}
    </div>
  );
}
