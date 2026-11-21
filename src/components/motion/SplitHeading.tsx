"use client";

import { useRef, type ElementType } from "react";
import { dirSign, gsap, MQ, useGSAP } from "./gsap";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** chars: English display type only. Arabic always splits by word (letters join). */
  mode?: "chars" | "words";
  /** Tie the reveal to scroll position instead of playing once the heading enters. */
  scrub?: boolean;
  delay?: number;
  id?: string;
  /** Above-the-fold headings: CSS entrance that starts on first paint (no hidden text before JS). */
  immediate?: boolean;
};

/**
 * Heading whose words (or letters) rise out of a mask. The full text stays in the DOM for
 * screen readers and search engines; the split copies are aria-hidden.
 */
export function SplitHeading({ text, as: Tag = "h2", className = "", mode = "words", scrub = false, delay = 0, id, immediate = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isArabic = /[؀-ۿ]/.test(text);
  const useChars = mode === "chars" && !isArabic;
  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || immediate) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const parts = el.querySelectorAll<HTMLElement>("[data-part]");
        const tween = gsap.fromTo(parts, { yPercent: 115, rotate: useChars ? 0 : 4 * dirSign(), transformOrigin: "0% 100%" }, {
          yPercent: 0,
          rotate: 0,
          duration: useChars ? 0.9 : 1.1,
          ease: "expo.out",
          stagger: useChars ? 0.028 : 0.07,
          delay,
          scrollTrigger: scrub
            ? { trigger: el, start: "top 90%", end: "top 45%", scrub: 0.6 }
            : { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
        });
        return () => tween.kill();
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [text, immediate] },
  );
  let n = 0;

  return (
    <Tag ref={ref} className={className} id={id} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          <span className="word-mask">
            {useChars ? (
              <span>
                {Array.from(w).map((c, j) => (
                  <span key={j} data-part className={`inline-block ${immediate ? "split-rise" : ""}`} style={immediate ? { animationDelay: `${(n++) * 28}ms` } : undefined}>
                    {c}
                  </span>
                ))}
              </span>
            ) : (
              <span data-part className={immediate ? "split-rise" : ""} style={immediate ? { animationDelay: `${i * 70}ms` } : undefined}>
                {w}
              </span>
            )}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
