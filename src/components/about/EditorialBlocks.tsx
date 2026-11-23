import Image from "next/image";

type Block = { title: string; text: string; image: string; alt: string; inset?: { src: string; alt: string } | null };

/** Alternating rounded photo and text; an optional small inset photo overlaps the large one. */
export function EditorialBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto grid max-w-[var(--container-site)] gap-20 px-5 sm:px-8 lg:gap-28">
      {blocks.map((b, i) => (
        <article key={b.title} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className={`relative ${b.inset ? "pb-12" : ""} ${i % 2 ? "md:order-2" : ""}`}>
            <div data-reveal="photo" className={`relative aspect-[4/5] overflow-hidden rounded-[28px] bg-stone ${b.inset ? "w-[88%]" : ""} ${b.inset && i % 2 ? "ms-auto" : ""}`}>
              <Image src={b.image} alt={b.alt} fill sizes="(max-width: 768px) 90vw, 560px" quality={85} className="object-cover" />
            </div>
            {b.inset ? (
              <div className={`absolute bottom-0 w-[42%] rounded-[24px] bg-linen p-2 ${i % 2 ? "start-0" : "end-0"}`}>
                <div data-reveal="photo" className="relative aspect-square overflow-hidden rounded-[18px] bg-stone">
                  <Image src={b.inset.src} alt={b.inset.alt} fill sizes="240px" quality={85} className="object-cover" />
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <span data-reveal className="font-display block text-[1.6rem] text-bronze">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 data-reveal className="font-display text-display mt-3 text-ink">
              {b.title}
            </h2>
            <p data-reveal className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">
              {b.text}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
