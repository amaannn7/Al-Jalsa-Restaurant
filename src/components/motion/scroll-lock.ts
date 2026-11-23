"use client";

let count = 0;
let saved = "";

/** Locks page scroll while an overlay is open. Calls are counted so nested overlays behave. */
export function lockScroll(lock: boolean) {
  if (typeof document === "undefined") return;
  if (lock) {
    if (count++ === 0) {
      saved = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
  } else if (count > 0 && --count === 0) {
    document.body.style.overflow = saved;
  }
}
