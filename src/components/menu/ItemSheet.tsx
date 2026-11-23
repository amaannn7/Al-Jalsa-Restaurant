"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MenuItemData } from "@/lib/types";
import { formatCalories, formatPrice } from "@/lib/money";
import { useCart } from "@/store/cart";
import { lockScroll } from "@/components/motion/scroll-lock";
import Image from "next/image";
import { IconClose } from "@/components/ui/Icons";
import { QuantityStepper } from "@/components/order/QuantityStepper";

/** Dish details: size, quantity and special instructions, then add to the order. */
export function ItemSheet({ locale, dict, item, onClose }: { locale: Locale; dict: Dictionary; item: MenuItemData | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {item ? (
        <>
          <motion.div key="sheet-scrim" className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-[71] max-h-[92dvh] md:inset-0 md:m-auto md:h-fit md:max-w-4xl md:px-6"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <SheetBody locale={locale} dict={dict} item={item} onClose={onClose} />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function SheetBody({ locale, dict, item, onClose }: { locale: Locale; dict: Dictionary; item: MenuItemData; onClose: () => void }) {
  const cart = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const [variantId, setVariantId] = useState(item.variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const variant = item.variants.find((v) => v.id === variantId) ?? item.variants[0];
  const name = locale === "ar" && item.nameAr ? item.nameAr : item.nameEn;
  const otherName = locale === "ar" ? item.nameEn : item.nameAr;
  const desc = locale === "ar" && item.descriptionAr ? item.descriptionAr : item.descriptionEn;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    lockScroll(true);
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>("button")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !ref.current) return;
      const nodes = [...ref.current.querySelectorAll<HTMLElement>("button:not([disabled]),textarea,input")];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      prev?.focus?.();
    };
  }, [onClose]);

  const add = () => {
    if (!variant) return;
    cart.add({
      itemId: item.id,
      variantId: variant.id,
      slug: item.slug,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      variantEn: item.variants.length > 1 ? variant.nameEn : "",
      variantAr: item.variants.length > 1 ? variant.nameAr : "",
      unitHalalas: variant.priceHalalas,
      note,
      quantity: qty,
      image: item.imageUrl ?? item.cutoutUrl,
    });
    onClose();
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="relative grid max-h-[92dvh] overflow-y-auto rounded-t-[28px] bg-card text-ink md:max-h-[86dvh] md:grid-cols-[0.95fr_1.05fr] md:rounded-[28px]"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute end-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-ink hover:text-white"
        aria-label={dict.menu.close}
      >
        <IconClose size={18} />
      </button>
      <div className="p-2.5 md:p-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-stone md:aspect-auto md:h-full md:min-h-[440px]">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={name} fill sizes="(max-width: 768px) 100vw, 440px" quality={88} className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-muted">{dict.menu.noPhoto}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <h2 id="sheet-title" className="font-dish pe-12 text-[clamp(1.7rem,3vw,2.3rem)] leading-tight text-ink">
          {name}
        </h2>
        {otherName ? (
          <p lang={locale === "ar" ? "en" : "ar"} className="mt-1 text-bronze">
            {otherName}
          </p>
        ) : null}
        {desc ? <p className="mt-4 text-muted">{desc}</p> : null}
        {item.variants.length === 1 && formatCalories([item.variants[0].calories], locale) ? (
          <p className="meta mt-2">{formatCalories([item.variants[0].calories], locale)}</p>
        ) : null}

        {item.variants.length > 1 ? (
          <fieldset className="mt-6">
            <legend className="eyebrow mb-3">{dict.menu.size}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {item.variants.map((v) => {
                const on = v.id === variant?.id;
                return (
                  <label key={v.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border px-4 py-3 transition-colors ${on ? "border-ink bg-linen" : "border-hair hover:border-muted"}`}>
                    <span className="flex items-center gap-3">
                      <input type="radio" name="variant" className="accent-[var(--color-ink)]" checked={on} onChange={() => setVariantId(v.id)} />
                      <span>
                        {locale === "ar" && v.nameAr ? v.nameAr : v.nameEn}
                        {v.calories != null ? <span className="meta block">{formatCalories([v.calories], locale)}</span> : null}
                      </span>
                    </span>
                    <span className="font-medium text-bronze">{v.priceHalalas == null ? dict.common.priceOnRequest : formatPrice(v.priceHalalas, locale)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="mt-6">
          <label htmlFor="sheet-note" className="eyebrow mb-3 block">
            {dict.menu.instructions}
          </label>
          <textarea
            id="sheet-note"
            className="input min-h-20 resize-y"
            maxLength={200}
            placeholder={dict.menu.instructionsPlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
          <QuantityStepper value={qty} onChange={setQty} min={1} labels={{ decrease: dict.menu.decrease, increase: dict.menu.increase, quantity: dict.menu.quantity }} />
          {item.isAvailable && variant ? (
            <button type="button" onClick={add} className="btn btn-dark action flex-1 justify-between sm:flex-none sm:gap-8">
              <span>{dict.menu.addToOrder}</span>
              <span>{variant.priceHalalas == null ? dict.common.priceOnRequest : formatPrice(variant.priceHalalas * qty, locale)}</span>
            </button>
          ) : (
            <p className="meta">{dict.common.unavailable}</p>
          )}
        </div>
      </div>
    </div>
  );
}
