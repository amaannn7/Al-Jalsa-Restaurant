"use client";

import { useRef } from "react";
import { dirSign, gsap, MQ, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { Plate } from "@/components/ui/Plate";
import { AddButton } from "@/components/menu/AddButton";
import type { Locale } from "@/i18n/config";
import type { MenuItemData } from "@/lib/types";
import { formatPrice, lowestPrice } from "@/lib/money";

/**
 * Pinned horizontal gallery: vertical scroll moves the dishes sideways. Each plate rolls as it
 * travels and tilts in 3D according to its distance from the centre of the screen.
 * Phones get a native swipe rail with snap points instead.
 */
export function FeaturedRail({
  locale,
  title,
  text,
  items,
  labels,
}: {
  locale: Locale;
  title: string;
  text: string;
  items: MenuItemData[];
  labels: { add: string; added: string; priceOnRequest: string; from: string; unavailable: string };
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.full, () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 80);
        const move = gsap.to(el, {
          x: () => -distance() * s,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 5,
          },
        });
        el.querySelectorAll<HTMLElement>("[data-rail-card]").forEach((card) => {
          const plate = card.querySelector("[data-rail-plate]");
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: card,
              containerAnimation: move,
              start: s === 1 ? "left right" : "right left",
              end: s === 1 ? "right left" : "left right",
              scrub: true,
            },
          });
          tl.fromTo(plate, { rotate: 90 * s, rotateY: 22 * s }, { rotate: -90 * s, rotateY: -22 * s, duration: 1 }, 0)
            .fromTo(plate, { scale: 0.84 }, { scale: 1.06, duration: 0.5 }, 0)
            .to(plate, { scale: 0.84, duration: 0.5 }, 0.5);
        });
        ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden py-20 lg:flex lg:h-[100svh] lg:items-center lg:py-0" aria-labelledby="featured-title">
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 items-center gap-6 overflow-x-auto px-5 sm:scroll-px-8 sm:px-8 lg:snap-none lg:gap-[4vw] lg:overflow-visible lg:px-[6vw] lg:will-change-transform"
      >
        <div className="w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-[32vw]">
          <p className="eyebrow flex items-center gap-3">
            <span className="diamond" aria-hidden /> {locale === "ar" ? "مختارات" : "Featured"}
          </p>
          <h2 id="featured-title" className="font-display text-display mt-5 uppercase text-ivory">
            {title}
          </h2>
          <p className="mt-6 max-w-[34ch] text-sand">{text}</p>
          <div className="mt-8 hidden h-px w-24 bg-gold lg:block" aria-hidden />
        </div>
        {items.map((item) => {
          const name = locale === "ar" && item.nameAr ? item.nameAr : item.nameEn;
          const desc = locale === "ar" && item.descriptionAr ? item.descriptionAr : item.descriptionEn;
          const low = lowestPrice(item.variants);
          const price = low == null ? labels.priceOnRequest : `${item.variants.length > 1 ? `${labels.from} ` : ""}${formatPrice(low, locale)}`;
          return (
            <article key={item.id} data-rail-card className="w-[76vw] shrink-0 snap-center sm:w-[44vw] lg:w-[min(30vw,420px)]">
              <div className="[perspective:1000px]">
                <div data-rail-plate className="mx-auto w-[86%] [transform-style:preserve-3d]">
                  <Plate item={item} name={name} sizes="(max-width: 1024px) 70vw, 30vw" />
                </div>
              </div>
              <div className="mt-6 border-t border-line pt-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-dish text-[1.45rem] leading-tight text-ivory">{name}</h3>
                  <p className="shrink-0 pt-1 text-gold">{price}</p>
                </div>
                <p className="meta mt-2 line-clamp-2 text-sand">{desc}</p>
                <div className="mt-4">
                  <AddButton locale={locale} item={item} labels={labels} />
                </div>
              </div>
            </article>
          );
        })}
        <div className="w-4 shrink-0 lg:w-[4vw]" aria-hidden />
      </div>
    </section>
  );
}
