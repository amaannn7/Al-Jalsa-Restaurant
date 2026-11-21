import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db, hasDatabase } from "./db";
import {
  seedCategoriesData,
  seedContentMap,
  seedGalleryData,
  seedReviewsData,
  seedSettings,
} from "./seed-source";
import type {
  CateringPackageData,
  CategoryData,
  ContentMap,
  DayHours,
  GalleryImageData,
  ReviewData,
  SiteSettingsData,
  Socials,
} from "./types";
import { contentDefaults } from "@/content/defaults";
import { settingsDefaults } from "@/content/settings-defaults";

/** Cache tags. Admin actions call updateTag() with these so edits go live immediately. */
export const TAGS = {
  menu: "menu",
  settings: "settings",
  content: "content",
  catering: "catering",
  reviews: "reviews",
  gallery: "gallery",
} as const;

export async function getMenu(): Promise<CategoryData[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.menu);
  if (!hasDatabase) return seedCategoriesData();
  const categories = await db().category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: {
      items: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
        include: { variants: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    descriptionEn: c.descriptionEn,
    descriptionAr: c.descriptionAr,
    items: c.items.map((i) => ({
      id: i.id,
      slug: i.slug,
      categorySlug: c.slug,
      nameEn: i.nameEn,
      nameAr: i.nameAr,
      descriptionEn: i.descriptionEn,
      descriptionAr: i.descriptionAr,
      imageUrl: i.imageUrl,
      cutoutUrl: i.cutoutUrl,
      cutoutWhole: i.cutoutWhole,
      isFeatured: i.isFeatured,
      isPopular: i.isPopular,
      isAvailable: i.isAvailable,
      variants: i.variants.map((v) => ({
        id: v.id,
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        priceHalalas: v.priceHalalas,
        calories: v.calories,
      })),
    })),
  }));
}

export async function getSettings(): Promise<SiteSettingsData> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.settings);
  if (!hasDatabase) return seedSettings();
  const s = await db().siteSettings.findUnique({ where: { id: 1 } });
  if (!s) return settingsDefaults;
  return {
    nameEn: s.nameEn,
    nameAr: s.nameAr,
    phone: s.phone,
    whatsapp: s.whatsapp,
    email: s.email,
    addressEn: s.addressEn,
    addressAr: s.addressAr,
    mapsUrl: s.mapsUrl,
    mapsEmbedQuery: s.mapsEmbedQuery,
    hours: (s.hours as unknown as DayHours[]) ?? settingsDefaults.hours,
    socials: { ...settingsDefaults.socials, ...((s.socials as unknown as Partial<Socials>) ?? {}) },
    takeawayEnabled: s.takeawayEnabled,
    deliveryEnabled: s.deliveryEnabled,
    deliveryFeeHalalas: s.deliveryFeeHalalas,
    deliveryNoteEn: s.deliveryNoteEn,
    deliveryNoteAr: s.deliveryNoteAr,
    buffetEnabled: s.buffetEnabled,
    googleRating: s.googleRating,
    googleReviewCount: s.googleReviewCount,
    ratingCheckedOn: s.ratingCheckedOn,
    unconfirmed: s.unconfirmed,
  };
}

export async function getContent(): Promise<ContentMap> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  const base = seedContentMap();
  if (!hasDatabase) return base;
  const rows = await db().contentBlock.findMany();
  for (const r of rows) base[r.key] = { en: r.en, ar: r.ar };
  return base;
}

export async function getCateringPackages(): Promise<CateringPackageData[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.catering);
  if (!hasDatabase) return [];
  const rows = await db().cateringPackage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    descriptionEn: p.descriptionEn,
    descriptionAr: p.descriptionAr,
    includesEn: p.includesEn,
    includesAr: p.includesAr,
    priceHalalas: p.priceHalalas,
    priceNoteEn: p.priceNoteEn,
    priceNoteAr: p.priceNoteAr,
    minGuests: p.minGuests,
    imageUrl: p.imageUrl,
  }));
}

export async function getReviews(): Promise<ReviewData[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.reviews);
  if (!hasDatabase) return seedReviewsData();
  const rows = await db().review.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    text: r.text,
    rating: r.rating,
    source: r.source,
    dateText: r.dateText,
    lang: r.lang,
  }));
}

export async function getGallery(): Promise<GalleryImageData[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.gallery);
  if (!hasDatabase) return seedGalleryData();
  const rows = await db().galleryImage.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((g) => ({ id: g.id, url: g.url, altEn: g.altEn, altAr: g.altAr }));
}

/** Reads one content key in a locale, falling back to English and then to the default. */
export function t(content: ContentMap, key: string, locale: "en" | "ar"): string {
  const row = content[key];
  const fallback = contentDefaults.find((c) => c.key === key);
  if (locale === "ar") return row?.ar?.trim() || fallback?.ar || row?.en || fallback?.en || "";
  return row?.en?.trim() || fallback?.en || "";
}
