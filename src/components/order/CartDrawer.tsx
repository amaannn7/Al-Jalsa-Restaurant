"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/money";
import { useCart } from "@/store/cart";
import { lockScroll } from "@/components/motion/scroll-lock";
import { IconArrow, IconBag, IconClose } from "@/components/ui/Icons";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer({
  locale,
  dict,
  deliveryEnabled,
  deliveryFeeHalalas,
}: {
  locale: Locale;
  dict: Dictionary;
  deliveryEnabled: boolean;
  deliveryFeeHalalas: number | null;
}) {
  const cart = useCart();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const t = dict.cart;
  const fromStart = locale === "ar" ? "-100%" : "100%";

  useEffect(() => {
    if (!cart.isOpen) return;
    lastFocus.current = document.activeElement as HTMLElement;
    lockScroll(true);
    const id = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("button,a")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cart.close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>("a,button,input,textarea")].filter((n) => !n.hasAttribute("disabled"));
      if (!nodes.length) return;
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
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      lastFocus.current?.focus?.();
    };
  }, [cart.isOpen, cart]);

  // Close when navigating.
  useEffect(() => {
    cart.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const showBar = cart.count > 0 && !pathname?.endsWith("/order") && !cart.isOpen;

  return (
    <>
      {/* Mobile order bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            className="fixed inset-x-3 bottom-3 z-40 md:hidden"
            initial={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <button
              type="button"
              onClick={cart.open}
              className="flex w-full items-center justify-between gap-4 rounded-sm bg-gold px-5 py-4 text-ink shadow-[0_18px_40px_rgb(0_0_0/0.5)]"
            >
              <span className="action flex items-center gap-3">
                <IconBag size={18} />
                {t.title} · {cart.count} {cart.count === 1 ? t.item : t.items}
              </span>
              <span className="font-medium">{formatPrice(cart.subtotal, locale)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cart.isOpen && (
          <motion.div
            key="cart-scrim"
            className="fixed inset-0 z-[60] bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cart.close}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cart.isOpen && (
          <motion.aside
            key="cart-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="stone fixed inset-y-0 end-0 z-[61] flex w-full max-w-[460px] flex-col border-s border-line"
            initial={reduce ? { opacity: 0 } : { x: fromStart }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: fromStart }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 id="cart-title" className="font-display text-title uppercase">
                {t.title}
              </h2>
              <button
                type="button"
                onClick={cart.close}
                className="grid h-11 w-11 place-items-center rounded-full border border-ivory/25 transition-colors hover:border-gold hover:text-gold"
                aria-label={dict.menu.close}
              >
                <IconClose size={18} />
              </button>
            </div>

            {cart.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="relative h-40 w-40 opacity-80">
                  <Image src="/brand/logo-mark-light.png" alt="" fill sizes="160px" className="object-contain opacity-30" />
                </div>
                <p className="font-dish text-2xl">{t.empty}</p>
                <p className="text-sand">{t.emptyHint}</p>
                <Link href={href(locale, "/menu")} onClick={cart.close} className="btn btn-gold action mt-2">
                  {t.browse}
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6" data-lenis-prevent>
                  <AnimatePresence initial={false}>
                    {cart.lines.map((l) => (
                      <motion.li
                        key={l.key}
                        layout={!reduce}
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-line"
                      >
                        <div className="flex gap-4 py-5">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink-3">
                            {l.image ? <Image src={l.image} alt="" fill sizes="80px" className="object-cover" /> : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-dish text-lg leading-snug">{locale === "ar" && l.nameAr ? l.nameAr : l.nameEn}</p>
                                {l.variantEn ? (
                                  <p className="meta">{locale === "ar" && l.variantAr ? l.variantAr : l.variantEn}</p>
                                ) : null}
                              </div>
                              <p className="shrink-0 text-gold">
                                {l.unitHalalas == null ? dict.common.priceOnRequest : formatPrice(l.unitHalalas * l.quantity, locale)}
                              </p>
                            </div>
                            {l.note ? (
                              <p className="meta mt-1 line-clamp-2">
                                {t.notePrefix}: {l.note}
                              </p>
                            ) : null}
                            <div className="mt-3 flex items-center justify-between">
                              <QuantityStepper
                                value={l.quantity}
                                onChange={(q) => cart.setQuantity(l.key, q)}
                                labels={{ decrease: dict.menu.decrease, increase: dict.menu.increase, quantity: dict.menu.quantity }}
                                size="sm"
                              />
                              <button type="button" onClick={() => cart.remove(l.key)} className="action link-underline text-muted hover:text-ivory">
                                {t.remove}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="border-t border-line px-6 py-5">
                  <dl className="grid gap-2">
                    <div className="flex justify-between">
                      <dt className="text-sand">{t.subtotal}</dt>
                      <dd className="text-ivory">{formatPrice(cart.subtotal, locale)}</dd>
                    </div>
                    {deliveryEnabled ? (
                      <div className="flex justify-between">
                        <dt className="meta">{t.delivery}</dt>
                        <dd className="meta">{deliveryFeeHalalas == null ? t.deliveryTbc : formatPrice(deliveryFeeHalalas, locale)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <Link href={href(locale, "/order")} onClick={cart.close} className="btn btn-gold action mt-5 w-full">
                    {t.checkout} <IconArrow size={18} />
                  </Link>
                  <button type="button" onClick={cart.close} className="action link-underline mx-auto mt-4 block text-sand hover:text-ivory">
                    {t.continue}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
