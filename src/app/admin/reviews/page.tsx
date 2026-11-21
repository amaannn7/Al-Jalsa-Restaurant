import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewEditor } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteReview } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsAdmin({ searchParams }: PageProps<"/admin/reviews">) {
  await requireAdmin();
  const sp = await searchParams;
  const reviews = await db().review.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl uppercase">Reviews</h1>
        <p className="meta mt-1 max-w-2xl">
          Only add genuine reviews, copied word for word from Google (spelling included), with the reviewer&apos;s name as shown. With no reviews, the website links to your Google listing instead.
        </p>
        {sp.deleted ? <p className="mt-2 text-ok">Review deleted.</p> : null}
      </header>
      {reviews.map((r) => (
        <details key={r.id} className="border border-line bg-ink-2/60">
          <summary className="flex cursor-pointer items-center justify-between gap-3 p-4">
            <span className="truncate text-ivory">
              {r.author}: <span className="text-sand">{r.text.slice(0, 70)}</span>
            </span>
            <span className="meta shrink-0">{r.isActive ? "shown" : "hidden"}</span>
          </summary>
          <div className="border-t border-line p-4">
            <ReviewEditor r={r} />
            <form action={deleteReview} className="mt-4">
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton message="Delete this review?">Delete review</ConfirmButton>
            </form>
          </div>
        </details>
      ))}
      <section className="border border-dashed border-line p-5">
        <h2 className="font-display text-lg uppercase">Add a review</h2>
        <div className="mt-4">
          <ReviewEditor r={{ author: "", text: "", rating: null, source: "Google", dateText: null, lang: "en", sortOrder: reviews.length, isActive: true }} />
        </div>
      </section>
    </div>
  );
}
