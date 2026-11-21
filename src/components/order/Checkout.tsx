"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, useTransition, type FormEvent } from "react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/money";
import { buildOrderMessage, orderTotals, waLink } from "@/lib/whatsapp";
import { fieldErrors, orderSchema } from "@/lib/validation";
import { useCart } from "@/store/cart";
import { logOrder } from "@/app/actions/enquiries";
import { openWhatsApp } from "@/components/forms/whatsapp-open";
import { errorText, SentPanel } from "@/components/forms/useEnquiry";
import { TextArea, TextField } from "@/components/forms/Field";
import { QuantityStepper } from "./QuantityStepper";
import { IconInfo, IconWhatsApp } from "@/components/ui/Icons";

export function Checkout({
  locale,
  dict,
  whatsapp,
  restaurantName,
  takeawayEnabled,
  deliveryEnabled,
  deliveryFeeHalalas,
  deliveryNote,
}: {
  locale: Locale;
  dict: Dictionary;
  whatsapp: string;
  restaurantName: string;
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFeeHalalas: number | null;
  deliveryNote: string;
}) {
  const cart = useCart();
  const reduce = useReducedMotion();
  const c = dict.checkout;
  const [fulfilment, setFulfilment] = useState<"takeaway" | "delivery">(takeawayEnabled ? "takeaway" : "delivery");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const totals = orderTotals(cart.lines, fulfilment, deliveryFeeHalalas);
  const noFulfilment = !takeawayEnabled && !deliveryEnabled;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const payload = {
      name: raw.name ?? "",
      phone: raw.phone ?? "",
      fulfilment,
      address: raw.address ?? "",
      notes: raw.notes ?? "",
      lines: cart.lines.map((l) => ({ itemId: l.itemId, variantId: l.variantId, quantity: l.quantity, note: l.note })),
    };
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    const message = buildOrderMessage({
      locale,
      restaurantName,
      name: parsed.data.name,
      phone: parsed.data.phone,
      fulfilment,
      address: parsed.data.address,
      notes: parsed.data.notes,
      lines: cart.lines.map((l) => ({
        nameEn: l.nameEn,
        nameAr: l.nameAr,
        variantEn: l.variantEn,
        variantAr: l.variantAr,
        unitHalalas: l.unitHalalas,
        quantity: l.quantity,
        note: l.note,
      })),
      deliveryFeeHalalas,
    });
    const url = waLink(whatsapp, message);
    openWhatsApp(url);
    setSentUrl(url);
    startTransition(async () => {
      try {
        await logOrder(payload, locale);
      } catch {
        /* saved copy is optional */
      }
    });
  }

  if (sentUrl) {
    return (
      <div className="mx-auto max-w-2xl">
        <SentPanel dict={{ ...dict, forms: { ...dict.forms, sentTitle: c.sentTitle, sentText: c.sentText, openAgain: c.openAgain } }} url={sentUrl} onReset={() => setSentUrl(null)}>
          <button
            type="button"
            className="action link-underline mt-6 text-muted hover:text-ivory"
            onClick={() => {
              cart.clear();
              setSentUrl(null);
            }}
          >
            {dict.cart.clear}
          </button>
        </SentPanel>
      </div>
    );
  }

  if (cart.ready && cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-dish text-3xl">{dict.cart.empty}</p>
        <p className="mt-3 text-sand">{dict.cart.emptyHint}</p>
        <Link href={href(locale, "/menu")} className="btn btn-gold action mt-8">
          {dict.cart.browse}
        </Link>
      </div>
    );
  }

  const e = (k: string) => errorText(dict, errors[k]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
      {/* Order review */}
      <section aria-labelledby="summary-title" className="order-2 lg:order-1">
        <h2 id="summary-title" className="font-display text-title uppercase">
          {c.summary}
        </h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          <AnimatePresence initial={false}>
            {cart.lines.map((l) => (
              <motion.li
                key={l.key}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: locale === "ar" ? 40 : -40 }}
                className="flex gap-4 py-5"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink-3">{l.image ? <Image src={l.image} alt="" fill sizes="80px" className="object-cover" /> : null}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-dish text-xl leading-snug">{locale === "ar" && l.nameAr ? l.nameAr : l.nameEn}</p>
                      {l.variantEn ? <p className="meta">{locale === "ar" && l.variantAr ? l.variantAr : l.variantEn}</p> : null}
                    </div>
                    <p className="shrink-0 text-gold">{l.unitHalalas == null ? dict.common.priceOnRequest : formatPrice(l.unitHalalas * l.quantity, locale)}</p>
                  </div>
                  <label className="mt-3 block">
                    <span className="sr-only">{dict.menu.instructions}</span>
                    <input
                      className="input !min-h-10 !py-2 text-[0.9375rem]"
                      defaultValue={l.note}
                      maxLength={200}
                      placeholder={`${dict.menu.instructions}: ${dict.menu.instructionsPlaceholder}`}
                      onBlur={(ev) => ev.target.value !== l.note && cart.setNote(l.key, ev.target.value)}
                    />
                  </label>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper value={l.quantity} onChange={(q) => cart.setQuantity(l.key, q)} size="sm" labels={{ decrease: dict.menu.decrease, increase: dict.menu.increase, quantity: dict.menu.quantity }} />
                    <button type="button" onClick={() => cart.remove(l.key)} className="action link-underline text-muted hover:text-ivory">
                      {dict.cart.remove}
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <dl className="mt-6 grid gap-2.5">
          <div className="flex justify-between">
            <dt className="text-sand">{dict.cart.subtotal}</dt>
            <dd>{formatPrice(totals.subtotal, locale)}</dd>
          </div>
          {fulfilment === "delivery" ? (
            <div className="flex justify-between">
              <dt className="text-sand">{dict.cart.delivery}</dt>
              <dd className={totals.delivery == null ? "meta" : ""}>{totals.delivery == null ? dict.cart.deliveryTbc : formatPrice(totals.delivery, locale)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-line pt-3 text-lg">
            <dt>{totals.total == null ? dict.cart.totalTbc : dict.cart.total}</dt>
            <dd className="text-gold">{formatPrice(totals.total ?? totals.subtotal, locale)}</dd>
          </div>
        </dl>
        <Link href={href(locale, "/menu")} className="action link-underline mt-6 inline-block text-sand hover:text-ivory">
          {dict.cart.continue}
        </Link>
      </section>

      {/* Details */}
      <section aria-labelledby="details-title" className="order-1 lg:order-2">
        <div className="border border-line bg-ink-2/80 p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 id="details-title" className="font-display text-title uppercase">
            {c.yourDetails}
          </h2>
          {noFulfilment ? (
            <p className="mt-6 text-danger">{c.noFulfilment}</p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
              <TextField id="name" label={c.name} required autoComplete="name" error={e("name")} />
              <TextField id="phone" label={c.phone} required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" error={e("phone")} />
              <fieldset>
                <legend className="field-label mb-3">{c.fulfilment}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {takeawayEnabled ? (
                    <label className="flex cursor-pointer items-center gap-3 border border-line px-4 py-3 transition-colors hover:border-ivory/40 has-[:checked]:border-gold has-[:checked]:bg-gold/10">
                      <input type="radio" name="fulfilment" value="takeaway" checked={fulfilment === "takeaway"} onChange={() => setFulfilment("takeaway")} className="accent-[var(--color-gold)]" />
                      {c.takeaway}
                    </label>
                  ) : null}
                  {deliveryEnabled ? (
                    <label className="flex cursor-pointer items-center gap-3 border border-line px-4 py-3 transition-colors hover:border-ivory/40 has-[:checked]:border-gold has-[:checked]:bg-gold/10">
                      <input type="radio" name="fulfilment" value="delivery" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} className="accent-[var(--color-gold)]" />
                      {c.deliveryOpt}
                    </label>
                  ) : null}
                </div>
              </fieldset>
              <AnimatePresence initial={false}>
                {fulfilment === "delivery" ? (
                  <motion.div key="addr" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <TextArea id="address" label={c.address} required rows={3} placeholder={c.addressPlaceholder} autoComplete="street-address" error={e("address")} />
                    {deliveryNote ? <p className="meta mt-2">{deliveryNote}</p> : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <TextArea id="notes" label={c.notes} rows={2} />
              {errors.lines ? <p className="field-error">{dict.forms.errorGeneric}</p> : null}
              <p className="flex gap-3 border-s-2 border-gold ps-4 text-[0.9375rem] text-sand">
                <IconInfo size={18} className="mt-0.5 shrink-0 text-gold" />
                {c.disclaimer}
              </p>
              <button type="submit" className="btn btn-gold action w-full" disabled={!cart.lines.length}>
                <IconWhatsApp size={18} /> {c.send}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
