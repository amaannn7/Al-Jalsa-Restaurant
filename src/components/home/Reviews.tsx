import type { ReviewData } from "@/lib/types";
import { IconGoogle } from "@/components/ui/Icons";
import { ReviewText } from "./ReviewText";

/**
 * Verbatim reviews typed in by the restaurant. With none added, the section links to Google
 * instead of showing anything invented.
 */
export function Reviews({
  reviews,
  title,
  emptyText,
  mapsUrl,
  readLabel,
  rating,
  ratingCount,
  checkedOn,
  locale,
}: {
  reviews: ReviewData[];
  title: string;
  emptyText: string;
  mapsUrl: string;
  readLabel: string;
  rating: number | null;
  ratingCount: number | null;
  checkedOn: string | null;
  locale: "en" | "ar";
}) {
  const ratingLine =
    rating != null && ratingCount != null ? (
      <p className="mt-3 text-sand">
        <span className="text-2xl text-gold">{rating.toFixed(1)}</span>
        <span role="img" aria-label={`${rating.toFixed(1)} / 5`} className="mx-2 text-gold">
          {"★".repeat(Math.round(rating))}
        </span>
        <span className="meta">
          {ratingCount} {locale === "ar" ? "تقييم على Google" : "Google reviews"}
          {checkedOn ? ` (${checkedOn})` : ""}
        </span>
      </p>
    ) : null;

  if (!reviews.length) {
    return (
      <div className="mx-auto max-w-2xl px-5 text-center">
        <IconGoogle size={30} className="mx-auto text-ivory" />
        <h2 className="font-display text-title mt-6 uppercase">{title}</h2>
        {ratingLine}
        <p className="mt-4 text-sand">{emptyText}</p>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line action mt-8">
          {readLabel}
        </a>
      </div>
    );
  }

  const doubled = reviews.length >= 3;
  const Card = ({ r, hidden = false }: { r: ReviewData; hidden?: boolean }) => (
    <figure
      className="flex w-[min(84vw,400px)] shrink-0 flex-col justify-between self-start border border-line bg-ink-2/80 p-7"
      aria-hidden={hidden || undefined}
      {...(hidden ? { inert: true } : {})}
    >
      <ReviewText text={r.text} lang={r.lang} more={locale === "ar" ? "اقرأ المزيد" : "Read more"} less={locale === "ar" ? "عرض أقل" : "Show less"} />
      <figcaption className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sand">{r.author}</span>
        <span className="meta">
          {r.rating ? <span className="me-2 text-gold" role="img" aria-label={`${r.rating} / 5`}>{"★".repeat(r.rating)}</span> : null}
          {r.source}
          {r.dateText ? `, ${r.dateText}` : ""}
        </span>
      </figcaption>
    </figure>
  );
  return (
    <div>
      <div className="mx-auto max-w-[var(--container-site)] px-5 text-center sm:px-8">
        <h2 className="font-display text-display uppercase">{title}</h2>
        {ratingLine}
      </div>
      <div className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div
          className={`flex w-max gap-5 px-5 ${doubled ? "motion-safe:animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused] group-has-[:focus-visible]:[animation-play-state:paused] group-has-[[aria-expanded=true]]:[animation-play-state:paused] rtl:[animation-direction:reverse]" : "mx-auto"} motion-reduce:w-auto motion-reduce:overflow-x-auto`}
        >
          {reviews.map((r) => (
            <Card key={r.id} r={r} />
          ))}
          {doubled ? reviews.map((r) => <Card key={`d-${r.id}`} r={r} hidden />) : null}
        </div>
      </div>
      <div className="mt-10 text-center">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="action link-underline inline-flex items-center gap-2 text-ivory">
          <IconGoogle size={16} /> {readLabel}
        </a>
      </div>
    </div>
  );
}
