"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  if (process.env.NODE_ENV !== "production") (window as unknown as { ST: typeof ScrollTrigger }).ST = ScrollTrigger;
}

/** Breakpoint contexts for gsap.matchMedia(): full effects, lighter mobile effects, or none. */
export const MQ = {
  full: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  lite: "(max-width: 899.98px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

/** +1 in LTR, -1 in RTL: multiply horizontal movement by this so effects mirror in Arabic. */
export function dirSign(): 1 | -1 {
  return typeof document !== "undefined" && document.documentElement.dir === "rtl" ? -1 : 1;
}

export { gsap, ScrollTrigger, useGSAP };
