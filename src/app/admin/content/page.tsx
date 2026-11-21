import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ContentEditor } from "@/components/admin/editors";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Website text" };

export default async function ContentPage({ searchParams }: PageProps<"/admin/content">) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await db().contentBlock.findMany({ orderBy: { sortOrder: "asc" } });
  const groups = [...new Set(rows.map((r) => r.group))];
  const active = typeof sp.group === "string" && groups.includes(sp.group) ? sp.group : groups[0];
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl uppercase">Website text</h1>
        <p className="meta mt-1">English on the left, Arabic on the right. If an Arabic field is empty, the English text is shown.</p>
      </header>
      <nav className="flex flex-wrap gap-2" aria-label="Text groups">
        {groups.map((g) => (
          <a key={g} href={`/admin/content?group=${encodeURIComponent(g)}`} aria-current={g === active ? "page" : undefined} className={`rounded-full border px-3 py-1.5 text-[0.875rem] ${g === active ? "border-gold bg-gold/15 text-gold" : "border-line text-sand hover:text-ivory"}`}>
            {g}
          </a>
        ))}
      </nav>
      <ContentEditor key={active} blocks={rows.filter((r) => r.group === active).map((r) => ({ key: r.key, label: r.label, en: r.en, ar: r.ar, multiline: r.multiline }))} />
    </div>
  );
}
