"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { dirSign, gsap, MQ, useGSAP } from "./gsap";

/**
 * Staggered reveal for children marked with data-reveal. Plays forward on entry and reverses
 * when scrolled back above. Without JS (or with reduced motion) everything is simply visible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  from = "up",
  stagger = 0.08,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  from?: "up" | "start" | "fade";
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
      mm.add(MQ.motion, () => {
        const vars =
          from === "start" ? { x: -40 * dirSign(), y: 0 } : from === "fade" ? { x: 0, y: 0 } : { x: 0, y: 36 };
        gsap.fromTo(
          targets,
          { opacity: 0, ...vars },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1,
            ease: "expo.out",
            stagger,
            scrollTrigger: { trigger: el, start, toggleActions: "play none none reverse" },
          },
        );
      });
      mm.add(MQ.reduce, () => {
        gsap.set(targets, { opacity: 1 });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
