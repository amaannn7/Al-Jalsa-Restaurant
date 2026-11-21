import type { CategoryData, MenuItemData } from "./types";

export function allItems(menu: CategoryData[]): MenuItemData[] {
  return menu.flatMap((c) => c.items);
}

export function findItem(menu: CategoryData[], slug: string): MenuItemData | undefined {
  return allItems(menu).find((i) => i.slug === slug);
}

/** True when a category has at least one dish with a real photo or cut-out. */
export function hasPhoto(items: MenuItemData[]): boolean {
  return items.some((i) => i.cutoutUrl || i.imageUrl);
}

/**
 * Picks a dish with a whole cut-out plate, trying the preferred slugs first, then any featured
 * whole plate, then any whole plate, never repeating one already used on the page.
 */
export function pickPlate(menu: CategoryData[], preferred: string[], used: Set<string>, within?: string): MenuItemData | undefined {
  const pool = within ? menu.find((c) => c.slug === within)?.items ?? [] : allItems(menu);
  const ok = (i: MenuItemData) => i.cutoutWhole && i.cutoutUrl && !used.has(i.slug);
  const pick =
    preferred.map((s) => pool.find((i) => i.slug === s)).find((i) => i && ok(i)) ??
    pool.find((i) => i.isFeatured && ok(i)) ??
    pool.find(ok) ??
    pool.find((i) => !used.has(i.slug) && (i.imageUrl || i.cutoutUrl)) ??
    pool[0];
  if (pick) used.add(pick.slug);
  return pick;
}

export const PLATE_PREFERENCES = {
  hero: [["shahi-bbq-platter"], ["paneer-butter-masala"]],
  story: [["garlic-naan"], ["mutton-rogan-josh"], ["shahi-chicken-biryani"]],
  category: {
    appetizers: ["honey-chilli-potato", "crispy-corn", "corn-soup"],
    kebab: ["tandoori-prawns"],
    "jalsa-special-chicken": ["murgh-mastaan", "murgh-lajawab"],
    "jalsa-special-mutton": ["mutton-maharaja", "lasooni-gosht"],
    vegetables: ["palak-paneer"],
    rice: ["zeera-rice", "steamed-rice"],
    bread: ["laccha-paratha", "butter-naan"],
    desserts: ["gajar-ka-halwa"],
  } as Record<string, string[]>,
};
