"use client";

import Link from "next/link";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";
import { Plate } from "@/components/ui/Plate";
import { IconArrow } from "@/components/ui/Icons";
import type { MenuItemData } from "@/lib/types";

type Row = {
  slug: string;
  name: string;
  description: string;
  count: string;
  href: string;
  plate: Pick<MenuItemData, "slug" | "imageUrl" | "cutoutUrl" | "cutoutWhole" | "nameEn">;
  plateName: string;
};

/**
 * Reference 3's zigzag: plates alternate sides with a dust splash behind. Each plate rolls in
 * (rotation + travel tied to scroll) and keeps turning slowly while it crosses the screen.
 */
export function CategoryShowcase({
  rows,
  viewLabel,
  more,
}: {
  rows: Row[];
  viewLabel: string;
  more?: { title: string; dishes: string; links: { slug: string; name: string; href: string; count: number }[] };
}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, (ctx) => {
        const full = window.matchMedia("(min-width: 900px)").matches;
        q("[data-cat-row]").forEach((row, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const plate = row.querySelector("[data-plate]");
          const dust = row.querySelector("[data-dust]");
          const text = row.querySelectorAll("[data-cat-text]");
          gsap.fromTo(
            plate,
            { rotate: -110 * side * s, xPercent: (full ? 45 : 20) * side * s, scale: 0.75 },
            { rotate: 0, xPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "center 55%", scrub: 0.7 } },
          );
          gsap.to(plate, { rotate: 35 * side * s, ease: "none", scrollTrigger: { trigger: row, start: "center 55%", end: "bottom top", scrub: 0.7 } });
          if (dust) {
            gsap.fromTo(dust, { scale: 1.1, opacity: 0, yPercent: 12 }, { scale: 1.55, opacity: 0.95, yPercent: -10, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
          }
          gsap.fromTo(text, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 70%", toggleActions: "play none none reverse" } });
        });
        void ctx;
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto mt-16 max-w-[var(--container-site)] overflow-x-clip px-5 sm:px-8 lg:mt-24">
      {rows.map((r, i) => (
        <article
          key={r.slug}
          data-cat-row
          className={`grid items-center gap-6 py-10 md:grid-cols-2 md:gap-12 lg:py-6 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
        >
          <Link href={r.href} className="group mx-auto block w-[min(78vw,460px)]" tabIndex={-1} aria-hidden>
            <Plate item={r.plate} name={r.plateName} sizes="(max-width: 768px) 78vw, 460px" dust={((i % 3) + 1) as 1 | 2 | 3} imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
          </Link>
          <div className={`text-center md:text-start ${i % 2 ? "md:ps-[8%]" : "md:pe-[8%]"}`}>
            <p data-cat-text className="eyebrow">
              {String(i + 1).padStart(2, "0")} · {r.count}
            </p>
            <h3 data-cat-text className="font-display text-title mt-3 uppercase text-ivory">
              {r.name}
            </h3>
            <p data-cat-text className="mx-auto mt-4 max-w-[38ch] text-sand md:mx-0">
              {r.description}
            </p>
            <Link data-cat-text href={r.href} className="action link-underline mt-6 inline-flex items-center gap-2 text-gold">
              {viewLabel} <IconArrow size={16} />
            </Link>
          </div>
        </article>
      ))}
      {more && more.links.length ? (
        <div className="mt-16 border-t border-line pt-10 text-center">
          <p className="eyebrow">{more.title}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-5">
            {more.links.map((l) => (
              <li key={l.slug}>
                <Link href={l.href} className="group inline-flex items-baseline gap-3">
                  <span className="font-display text-title uppercase text-ivory transition-colors group-hover:text-gold">{l.name}</span>
                  <span className="meta">
                    {l.count} {more.dishes}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
