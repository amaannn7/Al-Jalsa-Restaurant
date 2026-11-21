"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cateringSchema } from "@/lib/validation";
import { useToday } from "./useToday";
import { buildEnquiryMessage } from "@/lib/whatsapp";
import { logCatering } from "@/app/actions/enquiries";
import { errorText, SentPanel, useEnquiry } from "./useEnquiry";
import { Honeypot, SelectField, TextArea, TextField } from "./Field";
import { IconWhatsApp } from "@/components/ui/Icons";

export function CateringForm({
  locale,
  dict,
  whatsapp,
  packages,
}: {
  locale: Locale;
  dict: Dictionary;
  whatsapp: string;
  packages: string[];
}) {
  const f = dict.forms;
  const today = useToday();
  const ar = locale === "ar";
  const { errors, sentUrl, pending, onSubmit, reset } = useEnquiry({
    schema: cateringSchema,
    whatsapp,
    build: (d) =>
      buildEnquiryMessage(
        ar ? "طلب عرض سعر للضيافة (من الموقع)" : "Catering quote request (from the website)",
        [
          [f.name, d.name],
          [f.phone, d.phone],
          [ar ? "البريد الإلكتروني" : "Email", d.email],
          [f.eventType, d.eventType],
          [f.eventDate, d.eventDate],
          [f.eventLocation, d.eventLocation],
          [f.guests, d.guests],
          [f.package, d.packageName],
          [f.quantity, d.quantity],
          [f.preferred, d.preferred],
          [ar ? "الميزانية" : "Budget", d.budget],
          [f.requirements, d.requirements],
        ],
        ar ? "أرجو التواصل معي بخصوص التوفر وعرض السعر." : "Please contact me about availability and a quote.",
      ),
    log: (raw, message) => logCatering(raw, message, locale),
  });

  if (sentUrl) return <SentPanel dict={dict} url={sentUrl} onReset={reset} />;
  const e = (k: string) => errorText(dict, errors[k]);

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <TextField id="name" label={f.name} required autoComplete="name" error={e("name")} />
      <TextField id="phone" label={f.phone} required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" error={e("phone")} />
      <TextField id="email" label={f.email} type="email" autoComplete="email" dir="ltr" error={e("email")} className="sm:col-span-2" />
      <SelectField id="eventType" label={f.eventType} required placeholder={f.select} options={dict.eventTypes.map((t) => ({ value: t, label: t }))} error={e("eventType")} />
      <TextField id="eventDate" label={f.eventDate} required type="date" min={today} error={e("eventDate")} />
      <TextField id="eventLocation" label={f.eventLocation} required autoComplete="street-address" error={e("eventLocation")} />
      <TextField id="guests" label={f.guests} required type="number" inputMode="numeric" min={1} error={e("guests")} />
      {packages.length ? (
        <SelectField
          id="packageName"
          label={f.package}
          options={[{ value: "", label: f.noPackage }, ...packages.map((p) => ({ value: p, label: p }))]}
          className="sm:col-span-2"
        />
      ) : (
        <input type="hidden" name="packageName" value="" />
      )}
      <TextField id="quantity" label={f.quantity} placeholder={f.quantityPlaceholder} className="sm:col-span-2" />
      <TextArea id="preferred" label={f.preferred} placeholder={f.preferredPlaceholder} className="sm:col-span-2" rows={3} />
      <TextField id="budget" label={f.budget} placeholder={f.budgetPlaceholder} className="sm:col-span-2" />
      <TextArea id="requirements" label={f.requirements} placeholder={f.requirementsPlaceholder} className="sm:col-span-2" rows={4} />
      <div className="sm:col-span-2">
        <p className="meta mb-5">{f.cateringNotice}</p>
        <button type="submit" className="btn btn-gold action w-full sm:w-auto" disabled={pending}>
          <IconWhatsApp size={18} /> {pending ? f.sending : f.submitCatering}
        </button>
      </div>
    </form>
  );
}
