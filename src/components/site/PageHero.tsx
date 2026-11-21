"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";
import { SplitHeading } from "@/components/motion/SplitHeading";

/**
 * Inner-page header: title, intro and an optional plate that turns and drifts as you scroll
 * away (scroll-linked rotation, scale and parallax).
 */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt = "",
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  image?: string | null;
  imageAlt?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        if (q("[data-ph-plate]").length) {
          gsap.fromTo(q("[data-ph-plate]"), { rotate: -50 * s, scale: 0.8, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: 1.6, ease: "expo.out" });
          gsap.to(q("[data-ph-plate-wrap]"), { rotate: 70 * s, yPercent: 28, scale: 1.15, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 } });
          gsap.to(q("[data-ph-dust]"), { yPercent: 15, scale: 1.3, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        }
        gsap.to(q("[data-ph-copy]"), { yPercent: -12, opacity: 0.3, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        if (q("[data-ph-fade]").length) gsap.fromTo(q("[data-ph-fade]"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.25 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} className={`relative overflow-hidden ${compact ? "pb-10 pt-32 lg:pt-40" : "pb-16 pt-32 lg:pb-24 lg:pt-44"}`}>
      <div className={`mx-auto grid max-w-[var(--container-site)] items-center gap-10 px-5 sm:px-8 ${image ? "lg:grid-cols-[1.2fr_0.8fr]" : ""}`}>
        <div data-ph-copy className={image ? "" : "mx-auto max-w-3xl text-center"}>
          <p data-ph-fade className={`eyebrow flex items-center gap-3 ${image ? "" : "justify-center"}`}>
            <span className="diamond" aria-hidden /> {eyebrow}
          </p>
          <SplitHeading as="h1" text={title} mode="chars" immediate className="font-display text-display mt-5 uppercase text-ivory" />
          {text ? (
            <p data-ph-fade className={`mt-6 text-lg text-sand ${image ? "max-w-[46ch]" : "mx-auto max-w-[52ch]"}`}>
              {text}
            </p>
          ) : null}
          {children ? (
            <div data-ph-fade className="mt-8">
              {children}
            </div>
          ) : null}
        </div>
        {image ? (
          <div className="relative mx-auto aspect-square w-[min(72vw,440px)]">
            <Image data-ph-dust src="/images/texture/dust-3.webp" alt="" fill sizes="440px" className="pointer-events-none scale-150 object-contain" aria-hidden />
            <div data-ph-plate-wrap className="absolute inset-0">
              <div data-ph-plate className="absolute inset-0">
                <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 72vw, 440px" preload quality={85} className="plate-shadow object-contain" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
