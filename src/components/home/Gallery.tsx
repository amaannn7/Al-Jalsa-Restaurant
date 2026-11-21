"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/components/motion/gsap";
import type { GalleryImageData } from "@/lib/types";

/* Editorial composition: varied spans and ratios on a 12-column grid. */
const LAYOUT = [
  "md:col-span-5 md:row-span-2 aspect-[4/5]",
  "md:col-span-4 md:col-start-7 aspect-square md:mt-24",
  "md:col-span-3 aspect-[3/4] md:-mt-10",
  "md:col-span-4 md:col-start-6 aspect-[5/4]",
  "md:col-span-3 md:col-start-10 aspect-[3/4] md:mt-20",
  "md:col-span-4 aspect-square",
  "md:col-span-5 md:col-start-6 aspect-[16/10] md:-mt-16",
  "md:col-span-3 md:col-start-2 aspect-[3/4] md:mt-10",
  "md:col-span-4 md:col-start-6 aspect-square",
  "md:col-span-3 aspect-[4/5] md:mt-24",
];
const REVEALS = ["inset(100% 0% 0% 0%)", "inset(0% 0% 100% 0%)", "inset(0% 100% 0% 0%)", "inset(50% 50% 50% 50%)"];

/**
 * Clip-path reveals tied to scroll, plus inner parallax at different speeds per image
 * (layered depth). Images stay put without JS or with reduced motion.
 */
export function Gallery({ images, locale }: { images: GalleryImageData[]; locale: "en" | "ar" }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        q("[data-gal]").forEach((fig, i) => {
          const img = fig.querySelector("img");
          const rtl = document.documentElement.dir === "rtl";
          let from = REVEALS[i % REVEALS.length];
          if (rtl && from === "inset(0% 100% 0% 0%)") from = "inset(0% 0% 0% 100%)";
          gsap.fromTo(fig, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: fig, start: "top 95%", end: "top 45%", scrub: 0.6 } });
          const speed = Number(fig.getAttribute("data-speed") || 1);
          gsap.fromTo(img, { yPercent: -10 * speed, scale: 1.25 }, { yPercent: 10 * speed, scale: 1.12, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  if (!images.length) return null;
  return (
    <div ref={root} className="mx-auto mt-14 grid max-w-[var(--container-site)] grid-cols-2 gap-3 px-5 sm:gap-5 sm:px-8 md:grid-cols-12 md:gap-6 lg:mt-20">
      {images.slice(0, LAYOUT.length).map((g, i) => (
        <figure key={g.id} data-gal data-speed={[1, 1.6, 0.8, 1.3, 1.8, 1, 1.4, 0.9, 1.2, 1.6][i]} className={`relative overflow-hidden bg-ink-2 ${LAYOUT[i]} ${i % 3 === 0 ? "col-span-2" : ""}`}>
          <Image src={g.url} alt={locale === "ar" ? g.altAr : g.altEn} fill sizes="(max-width: 768px) 50vw, 40vw" quality={85} className="object-cover" />
        </figure>
      ))}
    </div>
  );
}
