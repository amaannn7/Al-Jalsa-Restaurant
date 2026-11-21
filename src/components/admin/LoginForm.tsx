"use client";

import { startTransition, useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="mt-6 grid gap-4"
    >
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span className="field-label">Email</span>
        <input name="email" type="email" required autoComplete="username" className="input" />
      </label>
      <label className="field">
        <span className="field-label">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="input" />
      </label>
      {state?.message ? (
        <p role="alert" className="field-error">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-gold action mt-2" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
