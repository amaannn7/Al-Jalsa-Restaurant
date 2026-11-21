import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/editors";
import { setUserActive } from "../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Admin users" };

export default async function Users({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireAdmin("OWNER");
  const sp = await searchParams;
  const users = await db().adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="font-display text-3xl uppercase">Admin users</h1>
        <p className="meta mt-1">Owners can manage admin accounts. Editors can manage the menu, text, reviews and enquiries.</p>
        {sp.error === "self" ? <p className="mt-2 text-danger">You cannot deactivate your own account.</p> : null}
        {sp.error === "last-owner" ? <p className="mt-2 text-danger">Keep at least one active owner.</p> : null}
      </header>
      <ul className="divide-y divide-line border-y border-line">
        {users.map((u) => (
          <li key={u.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="text-ivory">
                {u.name} {u.id === me.id ? <span className="meta">(you)</span> : null}
              </p>
              <p className="meta">
                {u.email} · {u.role.toLowerCase()} · {u.isActive ? "active" : "deactivated"}
                {u.lastLoginAt ? ` · last sign-in ${u.lastLoginAt.toLocaleDateString("en-GB", { timeZone: "Asia/Riyadh" })}` : ""}
              </p>
            </div>
            {u.id !== me.id ? <ResetPasswordForm id={u.id} /> : <span />}
            {u.id !== me.id ? (
              <form action={setUserActive}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="active" value={u.isActive ? "false" : "true"} />
                <button className={`action rounded-sm border px-3 py-2 ${u.isActive ? "border-danger/50 text-danger" : "border-ok/50 text-ok"}`}>{u.isActive ? "Deactivate" : "Reactivate"}</button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      <section className="border border-dashed border-line p-5">
        <h2 className="font-display text-lg uppercase">New admin account</h2>
        <div className="mt-4">
          <CreateUserForm />
        </div>
      </section>
    </div>
  );
}
