import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettingsFresh } from "@/lib/admin-data";
import { SettingsEditor } from "@/components/admin/editors";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Restaurant details" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettingsFresh();
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl uppercase">Restaurant details</h1>
        <p className="meta mt-1">Contact numbers, address, hours, ordering options and social links used across the website.</p>
      </header>
      <SettingsEditor s={s} />
    </div>
  );
}
