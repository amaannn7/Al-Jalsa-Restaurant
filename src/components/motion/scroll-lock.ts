"use client";

import type Lenis from "lenis";

let count = 0;
let saved = "";

export function getLenis(): Lenis | undefined {
  return (window as unknown as { __lenis?: Lenis }).__lenis;
}

/** Locks page scroll (body + Lenis). Calls are counted so nested overlays behave. */
export function lockScroll(lock: boolean) {
  if (typeof document === "undefined") return;
  if (lock) {
    if (count++ === 0) {
      saved = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      getLenis()?.stop();
    }
  } else if (count > 0 && --count === 0) {
    document.body.style.overflow = saved;
    getLenis()?.start();
  }
}
