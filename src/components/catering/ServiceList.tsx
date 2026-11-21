"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, MQ, useGSAP } from "@/components/motion/gsap";

type Service = { title: string; text: string; image: string };

/**
 * Editorial list of catering services. On desktop a round photo follows the cursor and turns
 * as it moves (cursor-responsive image), swapping to the photo of the row under the pointer.
 */
export function ServiceList({ services }: { services: Service[] }) {
  const root = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.full} and (pointer: fine)`, () => {
        gsap.set(follower.current, { xPercent: -50, yPercent: -50, scale: 0, rotate: -30 });
      });
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          gsap.utils.toArray("[data-svc]", root.current),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 80%", toggleActions: "play none none reverse" } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Event handlers (not render code): short tweens that follow the pointer.
  function move(e: React.PointerEvent) {
    const el = follower.current;
    if (!el || !root.current || e.pointerType !== "mouse") return;
    const box = root.current.getBoundingClientRect();
    gsap.to(el, { x: e.clientX - box.left, y: e.clientY - box.top, rotate: (e.movementX || 0) * 1.5, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  }
  function show(i: number | null) {
    setActive(i);
    const el = follower.current;
    if (!el || !window.matchMedia(`${MQ.full} and (pointer: fine)`).matches) return;
    gsap.to(el, { scale: i === null ? 0 : 1, duration: 0.5, ease: "expo.out" });
  }

  return (
    <div ref={root} className="relative" onPointerMove={move} onPointerLeave={() => show(null)}>
      <ol className="border-t border-line">
        {services.map((s, i) => (
          <li
            key={s.title}
            data-svc
            onPointerEnter={() => show(i)}
            className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b border-line py-8 transition-colors duration-500 hover:bg-ivory/[0.03] md:grid-cols-[6rem_1fr_1fr] md:py-10"
          >
            <span className="font-display text-gold">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-title uppercase text-ivory transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-3 rtl:group-hover:-translate-x-3">{s.title}</h3>
            <p className="col-start-2 text-sand md:col-start-3">{s.text}</p>
          </li>
        ))}
      </ol>
      <div ref={follower} className="pointer-events-none absolute start-0 top-0 z-10 hidden h-64 w-64 overflow-hidden rounded-full ring-1 ring-gold/40 lg:block rtl:start-auto rtl:left-0" aria-hidden>
        {services.map((s, i) => (
          <Image key={s.image} src={s.image} alt="" fill sizes="256px" className={`object-cover transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-0"}`} />
        ))}
      </div>
    </div>
  );
}
