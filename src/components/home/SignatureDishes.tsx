"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { MenuItemData } from "@/lib/types";
import { formatPrice, lowestPrice } from "@/lib/money";
import { AddButton } from "@/components/menu/AddButton";
import { IconArrow } from "@/components/ui/Icons";

/**
 * Featured dishes as a spotlight: one large photo card (the selected dish, with size choice and Add)
 * beside a list of the others. Choosing a dish in the list brings it into the spotlight.
 */
export function SignatureDishes({
  locale,
  eyebrow,
  title,
  text,
  items,
  menuHref,
  labels,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  text: string;
  items: MenuItemData[];
  menuHref: string;
  labels: { add: string; added: string; priceOnRequest: string; from: string; unavailable: string; fullMenu: string };
}) {
  const list = items.filter((i) => i.imageUrl).slice(0, 6);
  const [sel, setSel] = useState(0);
  if (!list.length) return null;
  const cur = list[Math.min(sel, list.length - 1)];
  const name = (i: MenuItemData) => (locale === "ar" && i.nameAr ? i.nameAr : i.nameEn);
  const desc = (i: MenuItemData) => (locale === "ar" && i.descriptionAr ? i.descriptionAr : i.descriptionEn);
  const price = (i: MenuItemData) => {
    const low = lowestPrice(i.variants);
    return low == null ? labels.priceOnRequest : `${i.variants.length > 1 ? `${labels.from} ` : ""}${formatPrice(low, locale)}`;
  };
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-20 lg:py-28" aria-labelledby="signature-title">
      <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
          {/* Spotlight */}
          <div className="dark-card min-h-[520px] min-w-0 sm:min-h-[600px]" aria-live="polite">
            {list.map((it, k) => (
              <Image
                key={it.slug}
                src={it.imageUrl!}
                alt={k === sel ? name(it) : ""}
                fill
                sizes="(max-width: 1024px) 92vw, 640px"
                quality={85}
                className={`-z-20 object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${k === sel ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
              />
            ))}
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-black/10" aria-hidden />
            <div className="flex h-full min-h-[inherit] flex-col justify-between p-6 sm:p-9">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur">{eyebrow}</span>
                <span className="text-sm tabular-nums text-white/80">
                  {pad(sel + 1)} / {pad(list.length)}
                </span>
              </div>
              <div key={cur.slug} className="rise-fade">
                <p className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] text-white">{name(cur)}</p>
                <p className="mt-3 max-w-[44ch] text-white/80">{desc(cur)}</p>
                <p className="mt-4 text-lg font-medium text-sand">{price(cur)}</p>
                <div className="mt-6">
                  <AddButton key={cur.id} locale={locale} item={cur} labels={labels} tone="dark" />
                </div>
              </div>
            </div>
          </div>

          {/* Heading and the list */}
          <div className="flex min-w-0 flex-col">
            <p data-reveal className="eyebrow">
              {eyebrow}
            </p>
            <h2 data-reveal id="signature-title" className="font-display text-display mt-4 text-ink">
              {title}
            </h2>
            <p data-reveal className="mt-4 max-w-[46ch] text-lg text-muted">
              {text}
            </p>
            <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-2">
              {list.map((it, k) => {
                const on = k === sel;
                return (
                  <li key={it.slug}>
                    <button
                      type="button"
                      onClick={() => setSel(k)}
                      aria-pressed={on}
                      className={`group flex w-full items-center gap-4 rounded-[20px] p-2 pe-4 text-start transition-colors ${on ? "bg-card shadow-[0_8px_24px_rgb(22_18_15/0.06)]" : "hover:bg-card/60"}`}
                    >
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-stone sm:h-[72px] sm:w-[72px]">
                        <Image src={it.imageUrl!} alt="" fill sizes="72px" quality={80} className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-dish block text-[1.15rem] leading-tight text-ink">{name(it)}</span>
                        <span className="mt-1 block truncate text-sm text-muted">{desc(it)}</span>
                      </span>
                      <span className={`shrink-0 text-[0.95rem] font-medium ${on ? "text-ink" : "text-bronze"}`}>{price(it)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link href={menuHref} className="btn btn-outline action mt-8 self-start">
              {labels.fullMenu} <IconArrow size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
