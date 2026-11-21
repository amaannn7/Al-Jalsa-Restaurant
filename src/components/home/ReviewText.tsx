"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Review text clamped to six lines, with an in-place Read more / Show less when it is cut off. */
export function ReviewText({ text, lang, more, less }: { text: string; lang: string; more: string; less: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div>
      <blockquote ref={ref} lang={lang} dir="auto" className={`font-dish whitespace-pre-line text-lg leading-relaxed text-ivory ${open ? "" : "line-clamp-6"}`}>
        &ldquo;{text}&rdquo;
      </blockquote>
      {clamped || open ? (
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="action link-underline mt-3 text-gold">
          {open ? less : more}
        </button>
      ) : null}
    </div>
  );
}
