"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { z } from "zod";
import type { Dictionary } from "@/i18n/dictionaries";
import { fieldErrors } from "@/lib/validation";
import { waLink } from "@/lib/whatsapp";
import { openWhatsApp } from "./whatsapp-open";
import { IconCheck, IconWhatsApp } from "@/components/ui/Icons";

/**
 * Form engine for WhatsApp enquiries: validates in the browser, opens WhatsApp with the full
 * message straight away (inside the click, so it is not blocked), then saves a copy on the server.
 */
export function useEnquiry<S extends z.ZodType>({
  schema,
  whatsapp,
  build,
  log,
}: {
  schema: S;
  whatsapp: string;
  build: (data: z.output<S>) => string;
  log: (raw: Record<string, string>, message: string) => Promise<unknown>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    const message = build(parsed.data);
    const url = waLink(whatsapp, message);
    openWhatsApp(url);
    setSentUrl(url);
    startTransition(async () => {
      try {
        await log(raw, message);
      } catch {
        /* the WhatsApp message is what matters; the saved copy is a convenience */
      }
    });
  }

  return { errors, sentUrl, pending, onSubmit, reset: () => setSentUrl(null) };
}

export function errorText(dict: Dictionary, code?: string): string | undefined {
  if (!code) return undefined;
  const map: Record<string, string> = {
    required: dict.forms.errorRequired,
    phone: dict.forms.errorPhone,
    email: dict.forms.errorEmail,
    date: dict.forms.errorDate,
    guests: dict.forms.errorGuests,
  };
  return map[code] ?? dict.forms.errorGeneric;
}

export function SentPanel({ dict, url, onReset, children }: { dict: Dictionary; url: string; onReset: () => void; children?: ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[22px] bg-linen p-8 text-center sm:p-12"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-bronze text-bronze">
          <IconCheck size={28} />
        </span>
        <h3 className="font-display text-title mt-6">{dict.forms.sentTitle}</h3>
        <p className="mx-auto mt-4 max-w-md text-muted">{dict.forms.sentText}</p>
        {children}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-dark action">
            <IconWhatsApp size={18} /> {dict.forms.openAgain}
          </a>
          <button type="button" onClick={onReset} className="btn btn-outline action">
            {dict.forms.sendAnother}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
