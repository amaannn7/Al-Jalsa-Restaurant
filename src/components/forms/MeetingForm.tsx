"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { meetingSchema } from "@/lib/validation";
import { useToday } from "./useToday";
import { buildEnquiryMessage } from "@/lib/whatsapp";
import { logMeeting } from "@/app/actions/enquiries";
import { errorText, SentPanel, useEnquiry } from "./useEnquiry";
import { Honeypot, TextArea, TextField } from "./Field";
import { IconWhatsApp } from "@/components/ui/Icons";

export function MeetingForm({ locale, dict, whatsapp }: { locale: Locale; dict: Dictionary; whatsapp: string }) {
  const f = dict.forms;
  const today = useToday();
  const ar = locale === "ar";
  const modes = { visit: f.modeVisit, call: f.modeCall, video: f.modeVideo } as const;
  const { errors, sentUrl, pending, onSubmit, reset } = useEnquiry({
    schema: meetingSchema,
    whatsapp,
    build: (d) =>
      buildEnquiryMessage(
        ar ? "طلب اجتماع لمناقشة الضيافة (من الموقع)" : "Catering consultation request (from the website)",
        [
          [f.name, d.name],
          [f.phone, d.phone],
          [ar ? "البريد الإلكتروني" : "Email", d.email],
          [f.meetingDate, d.date],
          [f.meetingTime, d.time],
          [f.meetingMode, modes[d.mode]],
          [f.meetingAbout, d.about],
        ],
        ar ? "هذا طلب وليس موعداً مؤكداً. أرجو تأكيد التاريخ والوقت." : "This is a request, not a confirmed appointment. Please confirm the date and time.",
      ),
    log: (raw, message) => logMeeting(raw, message, locale),
  });

  if (sentUrl) return <SentPanel dict={dict} url={sentUrl} onReset={reset} />;
  const e = (k: string) => errorText(dict, errors[k]);

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <TextField id="name" label={f.name} required autoComplete="name" error={e("name")} />
      <TextField id="phone" label={f.phone} required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" error={e("phone")} />
      <TextField id="email" label={f.email} type="email" autoComplete="email" dir="ltr" error={e("email")} className="sm:col-span-2" />
      <TextField id="date" label={f.meetingDate} required type="date" min={today} error={e("date")} />
      <TextField id="time" label={f.meetingTime} required type="time" step={900} error={e("time")} />
      <fieldset className="sm:col-span-2">
        <legend className="field-label mb-3">{f.meetingMode}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(modes) as (keyof typeof modes)[]).map((m, i) => (
            <label key={m} className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-hair px-4 py-3 transition-colors hover:border-muted has-[:checked]:border-ink has-[:checked]:bg-linen">
              <input type="radio" name="mode" value={m} defaultChecked={i === 0} className="accent-[var(--color-ink)]" />
              {modes[m]}
            </label>
          ))}
        </div>
      </fieldset>
      <TextArea id="about" label={f.meetingAbout} required placeholder={f.meetingAboutPlaceholder} className="sm:col-span-2" rows={5} error={e("about")} />
      <div className="sm:col-span-2">
        <p className="mb-5 border-s-2 border-bronze ps-4 text-muted">{f.meetingNotice}</p>
        <button type="submit" className="btn btn-dark action w-full sm:w-auto" disabled={pending}>
          <IconWhatsApp size={18} /> {pending ? f.sending : f.submitMeeting}
        </button>
      </div>
    </form>
  );
}
