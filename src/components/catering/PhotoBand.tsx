"use client";

import Image from "next/image";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";

/**
 * Three photos that open from the centre as the band scrolls in, then drift at different
 * speeds (layered parallax) while the band as a whole scales up slightly.
 */
export function PhotoBand({ images }: { images: { src: string; alt: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(q("[data-band]"), { scale: 0.86 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: 0.6 } });
        q("[data-band-item]").forEach((el, i) => {
          gsap.fromTo(el, { clipPath: "inset(50% 50% 50% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: root.current, start: `top ${85 - i * 6}%`, end: "center 55%", scrub: 0.6 } });
          gsap.fromTo(el.querySelector("img"), { yPercent: -12 * (i - 1), xPercent: 6 * (1 - i) * dirSign(), scale: 1.3 }, { yPercent: 12 * (i - 1), xPercent: -6 * (1 - i) * dirSign(), scale: 1.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <div ref={root} className="overflow-hidden py-10">
      <div data-band className="mx-auto grid max-w-[1440px] grid-cols-3 gap-3 px-5 sm:gap-5 sm:px-8">
        {images.map((im, i) => (
          <div key={im.src} data-band-item className={`relative overflow-hidden bg-ink-2 ${i === 1 ? "aspect-[3/4] translate-y-0" : "aspect-[3/4] translate-y-10"}`}>
            <Image src={im.src} alt={im.alt} fill sizes="33vw" quality={85} className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
