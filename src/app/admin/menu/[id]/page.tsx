import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MenuItemEditor } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteMenuItem } from "../../actions";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Edit dish" };

export default async function EditItem({ params }: PageProps<"/admin/menu/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [item, categories] = await Promise.all([
    db().menuItem.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } } } }),
    db().category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameEn: true } }),
  ]);
  if (!item) notFound();
  return (
    <div className="grid gap-6">
      <Link href="/admin/menu" className="action link-underline text-sand">
        Back to menu
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl uppercase">{item.nameEn}</h1>
        <form action={deleteMenuItem}>
          <input type="hidden" name="id" value={item.id} />
          <ConfirmButton message={`Delete "${item.nameEn}" permanently? To hide it for now, untick "Show on the website" instead.`}>Delete dish</ConfirmButton>
        </form>
      </div>
      <MenuItemEditor
        categories={categories}
        item={{
          id: item.id,
          nameEn: item.nameEn,
          nameAr: item.nameAr,
          descriptionEn: item.descriptionEn,
          descriptionAr: item.descriptionAr,
          categoryId: item.categoryId,
          sortOrder: item.sortOrder,
          imageUrl: item.imageUrl,
          cutoutUrl: item.cutoutUrl,
          cutoutWhole: item.cutoutWhole,
          isAvailable: item.isAvailable,
          isActive: item.isActive,
          isFeatured: item.isFeatured,
          isPopular: item.isPopular,
          variants: item.variants.map((v) => ({ nameEn: v.nameEn, nameAr: v.nameAr, priceHalalas: v.priceHalalas, calories: v.calories })),
          source: item.source,
        }}
      />
    </div>
  );
}
