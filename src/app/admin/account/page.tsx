import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/admin/editors";
import { logoutAction } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Account" };

export default async function Account() {
  const me = await requireAdmin();
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl uppercase">Your account</h1>
        <p className="meta mt-1">
          {me.name} · {me.email} · {me.role.toLowerCase()}
        </p>
      </header>
      <section>
        <h2 className="font-display text-lg uppercase">Change password</h2>
        <p className="meta mt-1">Changing your password signs you out everywhere.</p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>
      <form action={logoutAction}>
        <button className="btn btn-line action">Sign out</button>
      </form>
    </div>
  );
}
