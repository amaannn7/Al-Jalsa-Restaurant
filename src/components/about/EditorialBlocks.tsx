"use client";

import Image from "next/image";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";

type Block = { title: string; text: string; image: string; alt: string; plate?: string | null };

/**
 * Alternating photo and text. Each photo opens from its outer edge (direction mirrors in Arabic),
 * settles from a zoom, and a cut-out plate overlaps the corner, turning with scroll for depth.
 */
export function EditorialBlocks({ blocks }: { blocks: Block[] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-ed]", root.current).forEach((row, i) => {
          const fromStart = (i % 2 === 0) === (s === 1);
          const frame = row.querySelector("[data-ed-frame]");
          const img = row.querySelector("[data-ed-img]");
          const plate = row.querySelector("[data-ed-plate]");
          const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: row, start: "top 85%", end: "center 50%", scrub: 0.7 } });
          tl.fromTo(frame, { clipPath: fromStart ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, 0).fromTo(img, { scale: 1.35 }, { scale: 1.05 }, 0);
          gsap.to(img, { yPercent: 8, ease: "none", scrollTrigger: { trigger: row, start: "center 50%", end: "bottom top", scrub: true } });
          if (plate) gsap.fromTo(plate, { rotate: -90 * s, y: 80 }, { rotate: 30 * s, y: -60, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6 } });
          gsap.fromTo(row.querySelectorAll("[data-ed-copy] > *"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 65%", toggleActions: "play none none reverse" } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <div ref={root} className="mx-auto grid max-w-[var(--container-site)] gap-24 px-5 sm:px-8 lg:gap-36">
      {blocks.map((b, i) => (
        <article key={b.title} data-ed className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className={`relative ${i % 2 ? "md:order-2" : ""}`}>
            <div data-ed-frame className="relative aspect-[4/5] overflow-hidden bg-ink-2">
              <Image data-ed-img src={b.image} alt={b.alt} fill sizes="(max-width: 768px) 90vw, 45vw" quality={85} className="object-cover" />
            </div>
            {b.plate ? (
              <div data-ed-plate className={`absolute -bottom-10 w-[38%] ${i % 2 ? "-start-8" : "-end-8"}`} aria-hidden>
                <div className="relative aspect-square">
                  <Image src={b.plate} alt="" fill sizes="220px" className="plate-shadow object-contain" />
                </div>
              </div>
            ) : null}
          </div>
          <div data-ed-copy>
            <span className="font-display text-gold">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="font-display text-display mt-3 uppercase">{b.title}</h2>
            <span className="mt-6 block h-px w-16 bg-gold" aria-hidden />
            <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-sand">{b.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
