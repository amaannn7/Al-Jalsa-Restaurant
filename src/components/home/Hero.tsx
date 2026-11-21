"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";
import { IconArrow } from "@/components/ui/Icons";

type HeroPlate = { slug: string; src: string; name: string; description: string; price: string };

/**
 * Reference 1's split plate: two dishes cut in half, meeting in the middle.
 * Scroll (pinned, scrubbed): the halves rotate apart and drift outward like opening doors,
 * the name recedes, and a line about the restaurant's name rises in the gap.
 */
export function Hero({
  eyebrow,
  title,
  nameOther,
  tagline,
  intro,
  scrollLine,
  left,
  right,
  ctas,
}: {
  eyebrow: string;
  title: string;
  nameOther: string;
  tagline: string;
  intro: string;
  scrollLine: string;
  left: HeroPlate;
  right: HeroPlate;
  ctas: { order: { href: string; label: string }; menu: { href: string; label: string }; catering: { href: string; label: string } };
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const s = dirSign();
      const mm = gsap.matchMedia();

      // Entrance (transform and opacity only; the heading itself never starts hidden).
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        // The plates' entrance is a CSS animation (transform only, starts before JS) so the
        // largest image paints immediately; GSAP only handles the title and the scroll timeline.
        tl.from(q("[data-hero-title] [data-part]"), { yPercent: 40, duration: 1.4, stagger: 0.04 }, 0)
          .from(q("[data-hero-fade]"), { opacity: 0, y: 24, duration: 1.2, stagger: 0.08 }, 0.5)
          .from(q("[data-hero-dust]"), { opacity: 0, scale: 0.7, duration: 2 }, 0.2);
      });

      // Desktop: pin and scrub.
      mm.add(MQ.full, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=130%", scrub: 0.8, pin: true, anticipatePin: 1, refreshPriority: 10 },
        });
        tl.to(q("[data-half='a']"), { xPercent: -95 * s, x: () => -window.innerWidth * 0.1 * s, rotate: -38, scale: 1.12 }, 0)
          .to(q("[data-half='b']"), { xPercent: 95 * s, x: () => window.innerWidth * 0.1 * s, rotate: 38, scale: 1.12 }, 0)
          .to(q("[data-hero-title]"), { scale: 0.86, yPercent: -18, opacity: 0.12 }, 0)
          .to(q("[data-hero-caption]"), { opacity: 0, y: 30, duration: 0.3 }, 0)
          .to(q("[data-hero-ctas]"), { opacity: 0, y: 40, duration: 0.35 }, 0)
          .to(q("[data-hero-dust]"), { scale: 1.7, opacity: 0.35 }, 0)
          .fromTo(q("[data-hero-line]"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.4 }, 0.55)
          .to(q("[data-hero-eyebrow]"), { opacity: 0, duration: 0.3 }, 0);
      });

      // Phones and tablets: no pin; the halves turn as the hero scrolls away.
      mm.add(MQ.lite, () => {
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 } })
          .to(q("[data-half='a']"), { xPercent: -30 * s, rotate: -24 }, 0)
          .to(q("[data-half='b']"), { xPercent: 30 * s, rotate: 24 }, 0)
          .to(q("[data-hero-title]"), { yPercent: -25, opacity: 0.3 }, 0);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // Arabic letters join, so Arabic splits by word; Latin display type splits by letter.
  const titleIsArabic = /[\u0600-\u06FF]/.test(title);
  const letters = titleIsArabic ? title.split(/(\s+)/) : Array.from(title);

  return (
    <section ref={root} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 lg:pt-28" aria-labelledby="hero-title">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8">
        <p className="eyebrow rule mx-auto max-w-xl gap-6" data-hero-fade data-hero-eyebrow>
          <span>{eyebrow}</span>
        </p>
        <div data-hero-title className="relative z-0 mt-4 origin-top text-center sm:mt-6">
          <h1 id="hero-title" className="font-display text-[clamp(3.2rem,min(11.5vw,15.5vh),10.5rem)] uppercase leading-none tracking-[0.04em] text-ivory rtl:tracking-normal" aria-label={`${title} ${nameOther}`}>
            <span aria-hidden className="block whitespace-nowrap">
              {letters.map((c, i) => (
                <span key={i} data-part className="inline-block">
                  {/^\s+$/.test(c) ? "\u00a0" : c}
                </span>
              ))}
            </span>
          </h1>
          <p className="mt-1 flex items-center justify-center gap-4 text-gold sm:mt-3" data-hero-fade>
            <span className="h-px w-10 bg-gold/60 sm:w-20" aria-hidden />
            <span lang={/[؀-ۿ]/.test(nameOther) ? "ar" : "en"} className={/[؀-ۿ]/.test(nameOther) ? "font-[family-name:var(--font-messiri)] text-[clamp(1.5rem,3.4vw,2.6rem)] font-semibold" : "font-display text-[clamp(1.1rem,2.2vw,1.6rem)] uppercase tracking-[0.2em]"}>
              {nameOther}
            </span>
            <span className="h-px w-10 bg-gold/60 sm:w-20" aria-hidden />
          </p>
          <p className="action mt-3 text-sand" data-hero-fade>
            {tagline}
          </p>
        </div>
      </div>

      {/* Split plate */}
      <div className="relative z-10 mx-auto mt-6 flex w-full max-w-[1440px] flex-1 items-center justify-center px-5 lg:mt-2">
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
          <Image data-hero-dust src="/images/texture/dust-2.webp" alt="" width={900} height={900} sizes="(max-width: 900px) 120vw, 1100px" quality={75} className="h-auto w-[min(120vw,1100px)] max-w-none opacity-90 [mask-image:radial-gradient(closest-side,#000_30%,transparent_62%)]" />
        </div>
        <div className="relative flex items-center gap-2 sm:gap-3" style={{ ["--plate" as string]: "clamp(250px, min(43vh, 38vw), 580px)" }}>
          <div className="hero-in-a">
          <div data-half="a" className="plate-shadow relative h-[var(--plate)] w-[calc(var(--plate)/2)] origin-[100%_50%] overflow-hidden rtl:origin-[0%_50%]">
            <Image src={left.src} alt={left.name} width={1000} height={1000} preload quality={85} sizes="(max-width: 900px) 70vw, 40vw" className="absolute start-0 top-0 h-[var(--plate)] w-[var(--plate)] max-w-none" />
          </div>
          </div>
          <div className="hero-in-b">
          <div data-half="b" className="plate-shadow relative h-[var(--plate)] w-[calc(var(--plate)/2)] origin-[0%_50%] overflow-hidden rtl:origin-[100%_50%]">
            <Image src={right.src} alt={right.name} width={1000} height={1000} preload quality={85} sizes="(max-width: 900px) 70vw, 40vw" className="absolute end-0 top-0 h-[var(--plate)] w-[var(--plate)] max-w-none" />
          </div>
          </div>
        </div>

        {/* Dish captions, as in reference 1 (desktop) */}
        {[left, right].map((p, i) => (
          <div
            key={p.slug}
            data-hero-caption
            className={`absolute top-1/2 hidden w-[min(22vw,300px)] -translate-y-1/2 lg:block ${i === 0 ? "start-[4%] text-end xl:start-[7%]" : "end-[4%] text-start xl:end-[7%]"}`}
          >
            <p className="font-display text-[1.35rem] uppercase leading-tight text-gold">{p.name}</p>
            <p className="meta mt-2 line-clamp-3 text-sand">{p.description}</p>
            <p className="mt-2 text-lg text-ivory">{p.price}</p>
          </div>
        ))}

        <p data-hero-line className="font-dish pointer-events-none absolute hidden lg:block inset-x-6 top-1/2 mx-auto max-w-2xl -translate-y-1/2 text-center text-[clamp(1.6rem,3.4vw,3rem)] rtl:max-w-xl rtl:text-[clamp(1.5rem,3vw,2.6rem)] italic leading-tight text-ivory opacity-0 [text-shadow:0_2px_24px_rgb(0_0_0/0.9),0_0_60px_rgb(0_0_0/0.8)] rtl:not-italic">
          {scrollLine}
        </p>
      </div>

      <div data-hero-ctas className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 pb-10 pt-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pb-9 lg:pt-4 lg:pe-24">
        <p className="mx-auto max-w-xl text-center text-sand lg:mx-0 lg:max-w-[46ch] lg:text-start" data-hero-fade>
          {intro}
        </p>
        <div className="flex shrink-0 flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" data-hero-fade>
          <Link href={ctas.order.href} className="btn btn-gold action">
            {ctas.order.label}
          </Link>
          <Link href={ctas.menu.href} className="btn btn-line action">
            {ctas.menu.label}
          </Link>
          <Link href={ctas.catering.href} className="action link-underline inline-flex items-center justify-center gap-2 px-3 py-3 text-ivory">
            {ctas.catering.label} <IconArrow size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
