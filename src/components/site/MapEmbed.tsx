"use client";

import { useState } from "react";
import { IconPin } from "@/components/ui/Icons";

/**
 * Google Maps embed loaded on request, so the page does not load Google scripts or set
 * third-party cookies until the visitor asks for the map.
 */
export function MapEmbed({ query, title, loadLabel, address, className = "" }: { query: string; title: string; loadLabel: string; address: string; className?: string }) {
  const [show, setShow] = useState(false);
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div className={`relative overflow-hidden border border-line bg-ink-2 ${className}`}>
      {show ? (
        <iframe title={title} src={src} className="absolute inset-0 h-full w-full grayscale-[0.35] invert-[0.92] hue-rotate-180" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setShow(true)} className="group absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="absolute inset-0 opacity-40 [background:repeating-linear-gradient(0deg,transparent_0_47px,rgb(58_47_39/0.6)_47px_48px),repeating-linear-gradient(90deg,transparent_0_47px,rgb(58_47_39/0.6)_47px_48px)]" aria-hidden />
          <span className="relative grid h-16 w-16 place-items-center rounded-full border border-gold text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
            <IconPin size={26} />
          </span>
          <span className="relative max-w-xs text-sand">{address}</span>
          <span className="action link-underline relative text-ivory">{loadLabel}</span>
        </button>
      )}
    </div>
  );
}
