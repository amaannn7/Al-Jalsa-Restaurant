"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IconArrow } from "@/components/ui/Icons";

export type Signature = { slug: string; name: string; text: string; price: string; image: string; href: string };

/** Hero card from the reference: counter with progress line, a glass text card and a photo card. */
export function SignatureCarousel({
  items,
  labels,
}: {
  items: Signature[];
  labels: { title: string; view: string; previous: string; next: string };
}) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  const n = items.length;
  const cur = items[i];
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const pad = (x: number) => String(x).padStart(2, "0");
  return (
    <div className="w-full max-w-[460px]" role="group" aria-roledescription="carousel" aria-label={labels.title}>
      <div className="flex items-center gap-4 text-white/90" aria-hidden>
        <span className="tabular-nums">{pad(i + 1)}</span>
        <span className="relative h-px flex-1 bg-white/25">
          <span className="absolute inset-y-0 start-0 bg-white transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${((i + 1) / n) * 100}%` }} />
        </span>
        <span className="tabular-nums">{pad(n)}</span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_0.82fr] gap-3" aria-live="polite">
        <div className="glass flex flex-col rounded-[22px] p-5 backdrop-blur-md">
          <p className="action text-white">{labels.title}</p>
          <p key={cur.slug} className="rise-fade font-dish mt-3 text-[1.35rem] leading-tight text-white">
            {cur.name}
          </p>
          <p className="mt-2 line-clamp-3 text-sm text-white/70">{cur.text}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-5">
            <Link href={cur.href} className="btn btn-sand action !min-h-10 !px-4">
              {labels.view}
            </Link>
            <span className="text-sm text-white/80">{cur.price}</span>
          </div>
        </div>
        <Link href={cur.href} className="glass group relative block overflow-hidden rounded-[22px] p-2 backdrop-blur-md" tabIndex={-1} aria-hidden>
          <span className="relative block aspect-[4/5] overflow-hidden rounded-[16px]">
            {items.map((it, k) => (
              <Image
                key={it.slug}
                src={it.image}
                alt=""
                fill
                sizes="200px"
                quality={85}
                className={`object-cover transition-opacity duration-700 ${k === i ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </span>
        </Link>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={() => go(-1)} aria-label={labels.previous} className="icon-btn !h-12 !w-12 bg-ink text-white ring-1 ring-white/15 hover:bg-ink-3">
          <span className="inline-flex -scale-x-100">
            <IconArrow size={18} />
          </span>
        </button>
        <button type="button" onClick={() => go(1)} aria-label={labels.next} className="icon-btn !h-12 !w-12 bg-sand text-ink hover:bg-[#e7d4b6]">
          <IconArrow size={18} />
        </button>
      </div>
    </div>
  );
}
