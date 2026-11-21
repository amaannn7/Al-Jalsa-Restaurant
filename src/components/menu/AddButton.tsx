"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { MenuItemData } from "@/lib/types";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/money";
import { IconCheck, IconPlus } from "@/components/ui/Icons";

/** Quick add: a size choice (when the dish has sizes) and an Add button with a short "Added" state. */
export function AddButton({
  locale,
  item,
  labels,
  compact = false,
}: {
  locale: Locale;
  item: MenuItemData;
  labels: { add: string; added: string; unavailable: string };
  compact?: boolean;
}) {
  const cart = useCart();
  const [variantId, setVariantId] = useState(item.variants[0]?.id);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(false), 1600);
    return () => window.clearTimeout(t);
  }, [flash]);

  if (!item.isAvailable || !item.variants.length) {
    return <p className="meta">{labels.unavailable}</p>;
  }
  const variant = item.variants.find((v) => v.id === variantId) ?? item.variants[0];
  const add = () => {
    cart.add({
      itemId: item.id,
      variantId: variant.id,
      slug: item.slug,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      variantEn: item.variants.length > 1 ? variant.nameEn : "",
      variantAr: item.variants.length > 1 ? variant.nameAr : "",
      unitHalalas: variant.priceHalalas,
      note: "",
      image: item.imageUrl ?? item.cutoutUrl,
    });
    setFlash(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {item.variants.length > 1 ? (
        <div className="inline-flex rounded-full border border-line p-0.5" role="radiogroup" aria-label={locale === "ar" ? "الحجم" : "Size"}>
          {item.variants.map((v) => {
            const on = v.id === variant.id;
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full px-3 py-1.5 text-[0.875rem] transition-colors ${on ? "bg-ivory text-ink" : "text-sand hover:text-ivory"}`}
              >
                {locale === "ar" && v.nameAr ? v.nameAr : v.nameEn}
                {v.priceHalalas != null && !compact ? <span className="ms-1.5 opacity-70">{formatPrice(v.priceHalalas, locale)}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      <button
        type="button"
        onClick={add}
        className={`btn action !min-h-10 !px-4 ${flash ? "btn-maroon" : "btn-gold"}`}
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={flash ? "y" : "n"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2"
          >
            {flash ? <IconCheck size={16} /> : <IconPlus size={16} />}
            {flash ? labels.added : labels.add}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
