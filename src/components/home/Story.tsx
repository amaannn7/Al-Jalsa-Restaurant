"use client";

import Image from "next/image";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";

type Panel = { title: string; text: string; image: string; alt: string };

/**
 * Sticky storytelling. Desktop: the plate column stays in view while three panels scroll past;
 * each new dish opens through a circular mask and turns into place over the previous one
 * (image-to-image transition tied to scroll). Phones: plates sit above each panel and turn in.
 */
export function Story({ eyebrow, panels }: { eyebrow: string; panels: Panel[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.full, () => {
        const plates = q("[data-story-plate]");
        const panels = q("[data-story-panel]");
        const counter = q("[data-story-count]");
        // Slow continuous turn of the plate stack across the whole section.
        gsap.to(q("[data-story-stack]"), {
          rotate: 50 * s,
          ease: "none",
          scrollTrigger: { trigger: q("[data-story-panels]")[0], start: "top center", end: "bottom bottom", scrub: 0.8 },
        });
        // Each dish change is tied to its own panel arriving, so text and image stay in step.
        plates.forEach((plate, i) => {
          if (i === 0) return;
          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: { trigger: panels[i], start: "top 80%", end: "top 40%", scrub: 0.8 },
          });
          tl.fromTo(plate, { clipPath: "circle(0% at 50% 50%)", rotate: -70 * s, scale: 1.15 }, { clipPath: "circle(75% at 50% 50%)", rotate: 0, scale: 1, immediateRender: true }, 0)
            .fromTo(plates[i - 1], { scale: 1, opacity: 1 }, { scale: 0.82, opacity: 0.25, immediateRender: false }, 0)
            .fromTo(counter, { yPercent: (-100 / plates.length) * (i - 1) }, { yPercent: (-100 / plates.length) * i, immediateRender: false }, 0.3);
        });
        // Dust drifts slower than the plate (parallax depth).
        gsap.to(q("[data-story-dust]"), {
          yPercent: -18,
          rotate: -25 * s,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
        // Each panel brightens while it is the one being read.
        panels.forEach((panel) => {
          gsap.fromTo(
            panel,
            { opacity: 0.18 },
            { opacity: 1, ease: "none", scrollTrigger: { trigger: panel, start: "top 75%", end: "top 40%", scrub: true } },
          );
          gsap.to(panel, { opacity: 0.18, ease: "none", scrollTrigger: { trigger: panel, start: "bottom 45%", end: "bottom 15%", scrub: true } });
        });
      });
      mm.add(MQ.lite, () => {
        q("[data-story-inline]").forEach((el) => {
          gsap.fromTo(el, { rotate: -45 * s, scale: 0.8 }, { rotate: 0, scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "center 55%", scrub: 0.6 } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative" aria-label={eyebrow}>
      <div className="mx-auto grid max-w-[1440px] gap-x-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Sticky plate (desktop) */}
        <div className="relative hidden lg:block">
          <div className="sticky top-0 flex h-[100svh] items-center justify-center">
            <Image data-story-dust src="/images/texture/dust-1.webp" alt="" width={900} height={900} aria-hidden className="pointer-events-none absolute h-auto w-[115%] max-w-none opacity-80" />
            <div data-story-stack className="relative aspect-square w-[min(44vw,72vh,640px)]">
              {panels.map((p, i) => (
                <div key={p.image} data-story-plate className="absolute inset-0 will-change-transform" style={{ zIndex: i + 1 }}>
                  <Image src={p.image} alt={i === 0 ? p.alt : ""} fill sizes="44vw" quality={85} className="plate-shadow object-contain" />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-[12vh] start-0 flex items-end gap-3" aria-hidden>
              <span className="block h-[clamp(3rem,5vw,4.5rem)] overflow-hidden">
                <span data-story-count className="block">
                  {panels.map((_, i) => (
                    <span key={i} className="font-display block text-[clamp(3rem,5vw,4.5rem)] leading-none text-gold">
                      0{i + 1}
                    </span>
                  ))}
                </span>
              </span>
              <span className="action pb-2 text-muted">/ 0{panels.length}</span>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div data-story-panels className="py-24 lg:py-[30vh]">
          <p className="eyebrow mb-10 flex items-center gap-3 lg:mb-0">
            <span className="diamond" aria-hidden /> {eyebrow}
          </p>
          {panels.map((p, i) => (
            <article key={p.title} data-story-panel className="flex flex-col justify-center py-10 lg:min-h-[80svh] lg:py-0">
              <div data-story-inline className="relative mx-auto mb-8 aspect-square w-[min(78vw,420px)] lg:hidden">
                <Image src={p.image} alt={p.alt} fill sizes="78vw" quality={85} className="plate-shadow object-contain" />
              </div>
              <span className="font-display text-gold lg:hidden">0{i + 1}</span>
              <h2 className="font-display text-display mt-2 uppercase text-ivory">{p.title}</h2>
              <span className="mt-6 block h-px w-16 bg-gold" aria-hidden />
              <p className="mt-6 max-w-[34ch] text-lg leading-relaxed text-sand">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
