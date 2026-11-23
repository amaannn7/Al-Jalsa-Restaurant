"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { contactSchema } from "@/lib/validation";
import { buildEnquiryMessage } from "@/lib/whatsapp";
import { logContact } from "@/app/actions/enquiries";
import { errorText, SentPanel, useEnquiry } from "./useEnquiry";
import { Honeypot, TextArea, TextField } from "./Field";
import { IconWhatsApp } from "@/components/ui/Icons";

export function ContactForm({ locale, dict, whatsapp }: { locale: Locale; dict: Dictionary; whatsapp: string }) {
  const f = dict.forms;
  const ar = locale === "ar";
  const { errors, sentUrl, pending, onSubmit, reset } = useEnquiry({
    schema: contactSchema,
    whatsapp,
    build: (d) =>
      buildEnquiryMessage(ar ? "رسالة من الموقع" : "Message from the website", [
        [f.name, d.name],
        [f.phone, d.phone],
        [f.message, d.message],
      ]),
    log: (raw, message) => logContact(raw, message, locale),
  });
  if (sentUrl) return <SentPanel dict={dict} url={sentUrl} onReset={reset} />;
  const e = (k: string) => errorText(dict, errors[k]);
  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <TextField id="name" label={f.name} required autoComplete="name" error={e("name")} />
      <TextField id="phone" label={f.phone} required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" error={e("phone")} />
      <TextArea id="message" label={f.message} required className="sm:col-span-2" rows={5} error={e("message")} />
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-dark action w-full sm:w-auto" disabled={pending}>
          <IconWhatsApp size={18} /> {pending ? f.sending : f.submitContact}
        </button>
      </div>
    </form>
  );
}
