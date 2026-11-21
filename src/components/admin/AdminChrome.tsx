import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "./AdminNav";

/** Sidebar shell for signed-in admins; the login page renders without it. */
export async function AdminChrome({ children }: { children: ReactNode }) {
  if (!hasDatabase) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-xl place-items-center p-8 text-center">
        <div>
          <h1 className="font-display text-3xl uppercase">Database not connected</h1>
          <p className="mt-4 text-sand">
            The public site is running from the built-in menu data. To edit content, connect a Postgres database (Neon in the Vercel dashboard) and redeploy. See README, &ldquo;Deploy on Vercel&rdquo;.
          </p>
        </div>
      </main>
    );
  }
  const admin = await getCurrentAdmin();
  if (!admin) return <main className="min-h-dvh">{children}</main>;
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-ink-2 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-e">
        <div className="flex items-center justify-between gap-3 p-5 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/brand/logo-mark-light.png" alt="" width={30} height={40} />
            <span className="font-display text-sm uppercase tracking-wider">Al Jalsa Admin</span>
          </Link>
        </div>
        <AdminNav role={admin.role} />
        <div className="hidden border-t border-line p-5 lg:block">
          <p className="text-[0.9375rem] text-ivory">{admin.name}</p>
          <p className="meta truncate">{admin.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/admin/account" className="action link-underline text-sand">
              Account
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="action link-underline text-sand">
                Sign out
              </button>
            </form>
          </div>
          <a href="/en" target="_blank" className="action link-underline mt-4 inline-block text-gold">
            View website
          </a>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
