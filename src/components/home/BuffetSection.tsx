"use client";

import Image from "next/image";
import { useRef } from "react";
import { dirSign, gsap, MQ, useGSAP } from "@/components/motion/gsap";
import { IconClock, IconPin, IconWhatsApp } from "@/components/ui/Icons";

type Group = { title: string; items: string[] };

function Badge({ label, price, regular, regularLabel }: { label: string; price: string; regular: string; regularLabel: string }) {
  return (
    <div data-badge className="grid h-36 w-36 place-items-center rounded-full border border-gold bg-ink/80 text-center shadow-[0_20px_40px_rgb(0_0_0/0.45)] sm:h-40 sm:w-40">
      <div>
        <p className="eyebrow !text-gold-soft">{label}</p>
        <p className="font-display mt-1 text-[2rem] leading-none text-ivory rtl:text-[1.8rem]">{price}</p>
        {regular ? (
          <p className="meta mt-1.5">
            <span className="sr-only">{regularLabel}: </span>
            <s>{regular}</s>
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The restaurant's lunch buffet poster, as a section: offer, prices (regular price crossed out),
 * and the dish lists. A biryani plate turns with the scroll behind the price badges.
 */
export function BuffetSection({
  eyebrow,
  title,
  schedule,
  adult,
  kids,
  labels,
  kidsAge,
  note,
  groups,
  plate,
  directions,
  whatsapp,
}: {
  eyebrow: string;
  title: string;
  schedule: string;
  adult: { price: string; regular: string };
  kids: { price: string; regular: string };
  labels: { adult: string; kids: string; regular: string; directions: string; whatsapp: string };
  kidsAge: string;
  note: string;
  groups: Group[];
  plate: string | null;
  directions: string;
  whatsapp: string;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const s = dirSign();
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        if (q("[data-buffet-plate]").length) {
          gsap.fromTo(q("[data-buffet-plate]"), { rotate: -120 * s, xPercent: -20 * s, scale: 0.8 }, { rotate: 40 * s, xPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.7 } });
        }
        gsap.fromTo(q("[data-badge]"), { scale: 0.6, rotate: -25 * s, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, stagger: 0.12, duration: 1.1, ease: "back.out(1.6)", scrollTrigger: { trigger: q("[data-badges]")[0], start: "top 85%", toggleActions: "play none none reverse" } });
        gsap.fromTo(q("[data-group]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: q("[data-groups]")[0], start: "top 80%", toggleActions: "play none none reverse" } });
        gsap.fromTo(q("[data-frame]"), { clipPath: "inset(8% 8% 8% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 90%", end: "top 40%", scrub: 0.6 } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="buffet" className="relative scroll-mt-24 overflow-hidden py-20 lg:py-28" aria-labelledby="buffet-title">
      <div data-frame className="relative mx-auto max-w-[var(--container-site)] border border-gold/40 px-5 py-14 sm:mx-5 sm:px-10 lg:mx-auto lg:px-14 lg:py-20">
        <span className="absolute inset-2 border border-gold/15" aria-hidden />
        <div className="relative grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="relative">
            <p className="eyebrow flex items-center gap-3">
              <span className="diamond" aria-hidden /> {eyebrow}
            </p>
            <h2 id="buffet-title" className="font-display text-display mt-5 uppercase text-ivory">
              {title}
            </h2>
            <p className="mt-6 flex items-center gap-3 text-lg text-sand">
              <IconClock size={20} className="shrink-0 text-gold" /> {schedule}
            </p>
            <div data-badges className="relative mt-10 flex flex-wrap items-center gap-5">
              {plate ? (
                <div data-buffet-plate className="pointer-events-none absolute -end-28 -top-20 hidden w-60 opacity-90 lg:block" aria-hidden>
                  <div className="relative aspect-square">
                    <Image src={plate} alt="" fill sizes="256px" className="plate-shadow object-contain" />
                  </div>
                </div>
              ) : null}
              <Badge label={labels.adult} price={adult.price} regular={adult.regular} regularLabel={labels.regular} />
              <Badge label={labels.kids} price={kids.price} regular={kids.regular} regularLabel={labels.regular} />
            </div>
            <p className="meta mt-5">{kidsAge}</p>
            <p className="meta mt-1">{note}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-gold action">
                <IconPin size={17} /> {labels.directions}
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-line action">
                <IconWhatsApp size={17} /> {labels.whatsapp}
              </a>
            </div>
          </div>
          <div data-groups className="grid content-start gap-x-10 gap-y-9 sm:grid-cols-2">
            {groups
              .filter((g) => g.items.length)
              .map((g) => (
                <div key={g.title} data-group>
                  <h3 className="eyebrow flex items-center gap-3 border-b border-line pb-3">
                    <span className="diamond !h-1.5 !w-1.5" aria-hidden /> {g.title}
                  </h3>
                  <ul className="mt-4 grid gap-1.5">
                    {g.items.map((i) => (
                      <li key={i} className="font-dish text-lg leading-snug text-ivory">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
