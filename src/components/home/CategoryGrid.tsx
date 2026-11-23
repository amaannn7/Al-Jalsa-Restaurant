import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrowUpRight } from "@/components/ui/Icons";

export type CategoryCard = { slug: string; name: string; description: string; count: string; href: string; image: string | null };

/**
 * Menu sections as a bento of photo tiles. With 12 sections the large-screen grid is exactly 4 x 4:
 * one 2 x 2 feature tile (with its description), one wide tile, and ten small ones, so no cell is empty.
 * Other counts fall back to an even grid.
 */
export function CategoryGrid({ eyebrow, title, text, cards }: { eyebrow: string; title: string; text: string; cards: CategoryCard[] }) {
  const bento = cards.length === 12;
  const span = (i: number) => {
    if (!bento) return "aspect-[4/5]";
    if (i === 0) return "col-span-2 aspect-square md:row-span-2 md:aspect-auto";
    if (i === 5) return "col-span-2 aspect-[2/1] md:aspect-auto";
    return "aspect-[4/5] md:aspect-auto";
  };
  return (
    <section className="py-20 lg:py-28" aria-labelledby="categories-title">
      <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
        <SectionTitle id="categories-title" eyebrow={eyebrow} title={title} text={text} />
        <ul className={`mt-12 grid grid-cols-2 gap-3 sm:gap-4 ${bento ? "md:auto-rows-[190px] md:grid-cols-4 lg:auto-rows-[230px]" : "md:grid-cols-3 lg:grid-cols-4"}`}>
          {cards.map((c, i) => {
            const big = bento && i === 0;
            return (
              <li key={c.slug} data-reveal style={{ transitionDelay: `${(i % 4) * 60}ms` }} className={span(i)}>
                <Link href={c.href} className="group relative block h-full overflow-hidden rounded-[22px] bg-ink-2 text-white">
                  {c.image ? (
                    <span className="zoom-on-hover absolute inset-0">
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes={big || (bento && i === 5) ? "(max-width: 768px) 92vw, 620px" : "(max-width: 768px) 46vw, 300px"}
                        quality={85}
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" aria-hidden />
                  <span className="absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white group-hover:text-ink sm:end-4 sm:top-4 sm:h-11 sm:w-11">
                    <IconArrowUpRight size={18} />
                  </span>
                  <span className={`absolute inset-x-0 bottom-0 ${big ? "p-6 sm:p-8" : "p-4 sm:p-5"}`}>
                    <span className={`font-dish block leading-tight ${big ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-[1.2rem] sm:text-[1.4rem]"}`}>{c.name}</span>
                    {big && c.description ? <span className="mt-2 block max-w-[36ch] text-white/80">{c.description}</span> : null}
                    <span className={`block text-sm text-white/75 ${big ? "mt-3" : "mt-1"}`}>{c.count}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
