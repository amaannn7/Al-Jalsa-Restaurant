import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MenuItemEditor } from "@/components/admin/editors";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Add dish" };

export default async function NewItem({ searchParams }: PageProps<"/admin/menu/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await db().category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameEn: true } });
  return (
    <div className="grid gap-6">
      <Link href="/admin/menu" className="action link-underline text-sand inline-flex min-h-11 items-center">
        Back to menu
      </Link>
      <h1 className="font-display text-3xl uppercase">Add dish</h1>
      <MenuItemEditor
        categories={categories}
        item={{
          nameEn: "",
          nameAr: "",
          descriptionEn: "",
          descriptionAr: "",
          categoryId: typeof sp.category === "string" ? sp.category : "",
          sortOrder: 100,
          imageUrl: null,
          cutoutUrl: null,
          cutoutWhole: false,
          isAvailable: true,
          isActive: true,
          isFeatured: false,
          isPopular: false,
          variants: [],
        }}
      />
    </div>
  );
}
