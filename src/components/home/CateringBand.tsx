"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";
import { IconArrow } from "@/components/ui/Icons";

/** Maroon band. The photo opens through an expanding circle and settles from a zoom as you scroll. */
export function CateringBand({
  eyebrow,
  title,
  text,
  cta,
  secondary,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  text: string;
  cta: { href: string; label: string };
  secondary: { href: string; label: string };
  image: string;
  imageAlt: string;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 45%", scrub: 0.7 } });
        tl.fromTo(q("[data-cat-mask]"), { clipPath: "circle(8% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)" }, 0)
          .fromTo(q("[data-cat-img]"), { scale: 1.45, rotate: -25 * s }, { scale: 1, rotate: 0 }, 0)
          .fromTo(q("[data-cat-ring]"), { scale: 0.6, opacity: 0, rotate: 0 }, { scale: 1, opacity: 1, rotate: 90 * s }, 0);
        gsap.fromTo(q("[data-cat-copy] > *"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.09, duration: 1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%", toggleActions: "play none none reverse" } });
        gsap.to(q("[data-cat-img]"), { rotate: 20 * s, ease: "none", scrollTrigger: { trigger: root.current, start: "center 45%", end: "bottom top", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} className="band-maroon relative overflow-hidden border-y border-gold/25" aria-labelledby="catering-band-title">
      <div className="mx-auto grid max-w-[var(--container-site)] items-center gap-12 px-5 py-24 sm:px-8 md:grid-cols-2 lg:py-32">
        <div data-cat-copy>
          <p className="eyebrow !text-gold-soft">{eyebrow}</p>
          <h2 id="catering-band-title" className="font-display text-display mt-5 uppercase text-ivory">
            {title}
          </h2>
          <p className="mt-6 max-w-[42ch] text-lg text-ivory/85">{text}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={cta.href} className="btn btn-gold action">
              {cta.label}
            </Link>
            <Link href={secondary.href} className="action link-underline inline-flex items-center justify-center gap-2 px-2 py-3 text-ivory">
              {secondary.label} <IconArrow size={16} />
            </Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-[min(82vw,520px)]">
          <div data-cat-ring className="absolute -inset-[6%] rounded-full border border-dashed border-gold/45" aria-hidden />
          <div data-cat-mask className="absolute inset-0 overflow-hidden rounded-full">
            <Image data-cat-img src={image} alt={imageAlt} fill sizes="(max-width: 768px) 82vw, 520px" quality={85} className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
