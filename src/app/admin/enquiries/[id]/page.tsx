import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { waLink } from "@/lib/whatsapp";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteEnquiry, updateEnquiry } from "../../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryDetail({ params }: PageProps<"/admin/enquiries/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const e = await db().enquiry.findUnique({ where: { id } });
  if (!e) notFound();
  const greeting = e.locale === "ar" ? `مرحباً ${e.name}، شكراً لتواصلك مع مطعم الجلسة.` : `Hello ${e.name}, thank you for contacting Al Jalsa Restaurant.`;
  return (
    <div className="grid max-w-4xl gap-6">
      <Link href="/admin/enquiries" className="action link-underline text-sand inline-flex min-h-11 items-center">
        Back to enquiries
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{e.type.toLowerCase()}</p>
          <h1 className="font-display mt-2 text-3xl uppercase">{e.name}</h1>
          <p className="meta mt-1">
            {e.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Riyadh", dateStyle: "full", timeStyle: "short" })} · site language: {e.locale}
          </p>
        </div>
        <a href={waLink(e.phone, greeting)} target="_blank" rel="noopener noreferrer" className="btn btn-gold action">
          Reply on WhatsApp
        </a>
      </header>
      <section className="rounded-[20px] border border-line bg-ink-2/70 p-5">
        <h2 className="eyebrow">Message as generated</h2>
        <pre dir="auto" className="mt-4 whitespace-pre-wrap font-[inherit] text-[0.9375rem] leading-relaxed text-ivory">{e.message}</pre>
      </section>
      <form action={updateEnquiry} className="grid gap-4 rounded-[20px] border border-line bg-ink-2/70 p-5">
        <input type="hidden" name="id" value={e.id} />
        <fieldset className="flex flex-wrap gap-2">
          <legend className="field-label mb-2">Status</legend>
          {(["NEW", "CONTACTED", "CLOSED"] as const).map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 border border-line px-3 py-2 has-[:checked]:border-gold has-[:checked]:text-gold">
              <input type="radio" name="status" value={s} defaultChecked={e.status === s} className="accent-[var(--color-gold)]" /> {s.toLowerCase()}
            </label>
          ))}
        </fieldset>
        <label className="field">
          <span className="field-label">Internal notes</span>
          <textarea name="notes" defaultValue={e.notes} rows={3} className="input" />
        </label>
        <button className="btn btn-line action justify-self-start">Save</button>
      </form>
      {admin.role === "OWNER" ? (
        <form action={deleteEnquiry}>
          <input type="hidden" name="id" value={e.id} />
          <ConfirmButton message="Delete this enquiry permanently?">Delete enquiry</ConfirmButton>
        </form>
      ) : null}
    </div>
  );
}
