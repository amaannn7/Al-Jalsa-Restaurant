"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import type { FormState } from "@/app/admin/actions";

/** Wraps a server action form with pending state and a success/error banner. */
export function AdminForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "",
  resetOnSuccess = false,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  children: (state: FormState) => ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
    if (state && !state.ok && state.errors) {
      const first = Object.keys(state.errors)[0];
      ref.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  }, [state, resetOnSuccess]);
  return (
    <form
      ref={ref}
      // Submitting through a transition (instead of action=) keeps what was typed if saving fails.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className={`grid gap-5 ${className}`}
    >
      {state?.message ? (
        <p role="status" className={`border px-4 py-3 text-[0.9375rem] ${state.ok ? "border-ok/50 bg-ok/10 text-ok" : "border-danger/50 bg-danger/10 text-danger"}`}>
          {state.message}
        </p>
      ) : null}
      {children(state)}
      <div className="sticky bottom-0 -mx-1 flex items-center gap-4 border-t border-line bg-ink/95 px-1 py-4 backdrop-blur">
        <button type="submit" className="btn btn-gold action" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </button>
        {pending ? <span className="meta">Uploading and saving can take a few seconds.</span> : null}
      </div>
    </form>
  );
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-[var(--color-gold)]" />
      <span>
        <span className="text-ivory">{label}</span>
        {hint ? <span className="meta block">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Panel({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return (
    <section className="rounded-[20px] border border-line bg-ink-2/70 p-5 sm:p-6">
      <h2 className="font-display text-lg uppercase tracking-wide">{title}</h2>
      {description ? <p className="meta mt-1">{description}</p> : null}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
