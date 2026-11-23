import Image from "next/image";
import Link from "next/link";
import { IconArrow } from "@/components/ui/Icons";

type Pillar = { title: string; text: string; image: string; alt: string };

/** Editorial split: a large photo with an inset second photo, and three numbered kitchen notes. */
export function Kitchen({ eyebrow, title, pillars, more }: { eyebrow: string; title: string; pillars: Pillar[]; more: { href: string; label: string } }) {
  const [a, b] = pillars;
  return (
    <section className="py-20 lg:py-28" aria-labelledby="kitchen-title">
      <div className="mx-auto grid max-w-[var(--container-site)] items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="relative pb-16 sm:pb-20">
          <div data-reveal="photo" className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-stone sm:w-[86%]">
            {a ? <Image src={a.image} alt={a.alt} fill sizes="(max-width: 1024px) 86vw, 520px" quality={85} className="object-cover" /> : null}
          </div>
          {b ? (
            <div className="absolute bottom-0 end-0 w-[46%] rounded-[24px] bg-linen p-2 sm:w-[44%]">
              <div data-reveal="photo" className="relative aspect-square overflow-hidden rounded-[18px] bg-stone">
                <Image src={b.image} alt={b.alt} fill sizes="(max-width: 1024px) 44vw, 260px" quality={85} className="object-cover" />
              </div>
            </div>
          ) : null}
        </div>
        <div>
          <p data-reveal className="eyebrow">
            {eyebrow}
          </p>
          <h2 data-reveal id="kitchen-title" className="font-display text-display mt-4 text-ink [text-wrap:balance]">
            {title}
          </h2>
          <ol className="mt-10 grid gap-0">
            {pillars.map((p, i) => (
              <li key={p.title} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="grid grid-cols-[auto_1fr] gap-6 border-t border-hair py-7 last:border-b">
                <span className="font-display text-[1.6rem] leading-none text-bronze tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-dish text-[1.45rem] leading-tight text-ink">{p.title}</h3>
                  <p className="mt-2 max-w-[48ch] text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link data-reveal href={more.href} className="btn btn-dark action mt-10">
            {more.label} <IconArrow size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
