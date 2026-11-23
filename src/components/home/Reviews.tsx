import type { CSSProperties } from "react";
import type { ReviewData } from "@/lib/types";
import { IconGoogle, IconStar } from "@/components/ui/Icons";
import { ReviewText } from "./ReviewText";

const AVATAR = ["bg-sand text-ink", "bg-ink text-white", "bg-[#c7d3c0] text-ink", "bg-[#e8c9b5] text-ink", "bg-bronze text-white"];

/**
 * Verbatim reviews typed in by the restaurant, in a tinted panel: heading and Google link on top,
 * then one marquee row of review cards. With no reviews added, the section links to
 * Google instead of showing anything invented.
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
  eyebrow,
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
  eyebrow?: string;
}) {
  const ar = locale === "ar";
  const ratingBadge =
    rating != null && ratingCount != null ? (
      <span className="inline-flex items-center gap-2">
        <span className="font-display text-3xl leading-none text-ink">{rating.toFixed(1)}</span>
        <span className="flex text-sand-2" role="img" aria-label={`${rating.toFixed(1)} / 5`}>
          {Array.from({ length: Math.round(rating) }, (_, i) => (
            <IconStar key={i} size={16} />
          ))}
        </span>
        <span className="text-sm text-muted">
          {ratingCount} {ar ? "تقييم" : "reviews"}
          {checkedOn ? ` (${checkedOn})` : ""}
        </span>
      </span>
    ) : null;

  const googleLink = (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark action">
      <IconGoogle size={16} /> {readLabel}
    </a>
  );

  if (!reviews.length) {
    return (
      <div className="mx-auto max-w-2xl px-5 text-center">
        <IconGoogle size={30} className="mx-auto text-ink" />
        <h2 className="font-display text-display mt-6 text-ink">{title}</h2>
        {ratingBadge ? <div className="mt-4">{ratingBadge}</div> : null}
        <p className="mt-4 text-muted">{emptyText}</p>
        <div className="mt-8">{googleLink}</div>
      </div>
    );
  }

  const Card = ({ r, hidden = false, n }: { r: ReviewData; hidden?: boolean; n: number }) => (
    <figure
      className="card relative flex w-[min(82vw,400px)] shrink-0 flex-col p-7 shadow-[0_10px_30px_rgb(22_18_15/0.05)]"
      aria-hidden={hidden || undefined}
      {...(hidden ? { inert: true } : {})}
    >
      <span className="font-display pointer-events-none absolute end-6 top-2 select-none text-[5.5rem] leading-none text-sand/70" aria-hidden>
        &ldquo;
      </span>
      <div className="flex items-center gap-2">
        {r.rating ? (
          <span className="flex gap-0.5 text-sand-2" role="img" aria-label={`${r.rating} / 5`}>
            {Array.from({ length: r.rating }, (_, i) => (
              <IconStar key={i} size={16} />
            ))}
          </span>
        ) : null}
      </div>
      <div className="mb-6 mt-4 pe-6">
        <ReviewText text={r.text} lang={r.lang} more={ar ? "اقرأ المزيد" : "Read more"} less={ar ? "عرض أقل" : "Show less"} />
      </div>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-hair pt-5">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[0.95rem] font-semibold ${AVATAR[n % AVATAR.length]}`} aria-hidden>
          {r.author.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">{r.author}</span>
          <span className="block text-sm text-muted">
            {r.source}
            {r.dateText ? ` · ${r.dateText}` : ""}
          </span>
        </span>
        {/google/i.test(r.source) ? <IconGoogle size={20} className="shrink-0 text-ink/70" /> : null}
      </figcaption>
    </figure>
  );

  // One row, repeated until it is wide enough, then doubled so the marquee loops seamlessly.
  // Only the first appearance of each review is read by screen readers;
  // with reduced motion the rows become plain scrollable rows and the copies are hidden.
  const rows = [reviews];
  const loop = reviews.length >= 3;

  return (
    <div className="px-3 sm:px-4">
      <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[28px] bg-[#ebe3d8] py-16 lg:py-24">
        <div className="mx-auto flex max-w-[var(--container-site)] flex-col gap-8 px-6 sm:px-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            {eyebrow ? (
              <p data-reveal className="eyebrow">
                {eyebrow}
              </p>
            ) : null}
            <h2 data-reveal className="font-display text-display mt-4 text-ink">
              {title}
            </h2>
            <p data-reveal className="mt-4 text-lg text-muted">
              {ar ? "تقييمات كتبها ضيوفنا على Google، كما كتبوها." : "Reviews our guests left on Google, shown as they wrote them."}
            </p>
          </div>
          <div data-reveal className="flex flex-col items-start gap-4 md:items-end">
            {ratingBadge}
            {googleLink}
          </div>
        </div>

        <div className="mt-12 grid gap-5">
          {rows.map((row, ri) => {
            let base = row;
            while (loop && base.length < 6) base = [...base, ...row];
            const track = loop ? [...base, ...base] : base;
            return (
              <div
                key={ri}
                className={`marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] motion-reduce:overflow-x-auto ${ri % 2 ? "marquee-reverse" : ""}`}
                aria-label={ri === 0 ? title : undefined}
                role={ri === 0 ? "region" : undefined}
              >
                <div
                  className={`flex w-max items-stretch gap-5 px-5 ${loop ? "marquee-track" : "mx-auto"}`}
                  style={{ "--marquee-duration": `${Math.max(50, base.length * 11)}s` } as CSSProperties}
                >
                  {track.map((r, i) => (
                    <Card key={`${r.id}-${i}`} r={r} n={reviews.indexOf(r)} hidden={i >= row.length} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
