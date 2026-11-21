/**
 * The verified seed data as plain objects. Used by prisma/seed.ts to fill the database, and by
 * the public site as a read-only fallback when DATABASE_URL is not set (for example, a first
 * preview deploy before the database is connected).
 */
import menu from "../../prisma/seed-data/menu.json";
import { contentDefaults } from "@/content/defaults";
import { settingsDefaults } from "@/content/settings-defaults";
import type { CategoryData, ContentMap, GalleryImageData, ReviewData, SiteSettingsData } from "./types";

type SeedVariant = { nameEn: string; nameAr: string; priceHalalas: number | null; calories: number | null; sortOrder: number };
export type SeedItem = {
  slug: string;
  category: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  imageUrl: string | null;
  cutoutUrl: string | null;
  cutoutWhole: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  sortOrder: number;
  source: string;
  variants: SeedVariant[];
};
export type SeedCategory = { slug: string; nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; sortOrder: number };

export const seedMenu = menu as { source: string; categories: SeedCategory[]; items: SeedItem[] };

export const seedGallery: { slug: string; altEn: string; altAr: string }[] = [
  { slug: "shahi-chicken-biryani", altEn: "Shahi chicken biryani in a clay pot", altAr: "شاهي دجاج برياني في وعاء فخاري" },
  { slug: "chicken-tandoori", altEn: "Chicken tandoori with onion and lemon", altAr: "دجاج تندوري مع البصل والليمون" },
  { slug: "garlic-naan", altEn: "Garlic naan with a dipping sauce", altAr: "نان بالثوم مع صلصة" },
  { slug: "mutton-sheekh-kabab", altEn: "Mutton sheekh kabab on skewers", altAr: "شيش كباب لحم على الأسياخ" },
  { slug: "gulab-jamun", altEn: "Gulab jamun in syrup", altAr: "جلاب جامن في القطر" },
  { slug: "butter-chicken", altEn: "Butter chicken in a copper karahi", altAr: "دجاج بالزبدة في كراهي نحاسي" },
  { slug: "tandoori-prawns", altEn: "Tandoori prawns with lemon", altAr: "روبيان تندوري مع الليمون" },
  { slug: "mutton-dum-biryani", altEn: "Mutton dum biryani", altAr: "لحم دوم برياني" },
  { slug: "honey-chilli-potato", altEn: "Honey chilli potato with sesame", altAr: "بطاطا بالعسل والفلفل الحار مع السمسم" },
  { slug: "spring-rolls", altEn: "Spring rolls with chilli sauce", altAr: "سبرنج رول مع صلصة الفلفل" },
];

export function seedCategoriesData(): CategoryData[] {
  return seedMenu.categories.map((c) => ({
    id: c.slug,
    slug: c.slug,
    nameEn: c.nameEn,
    nameAr: c.nameAr,
    descriptionEn: c.descriptionEn || null,
    descriptionAr: c.descriptionAr || null,
    items: seedMenu.items
      .filter((i) => i.category === c.slug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        id: i.slug,
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
        variants: i.variants.map((v, n) => ({
          id: `${i.slug}-${n}`,
          nameEn: v.nameEn,
          nameAr: v.nameAr,
          priceHalalas: v.priceHalalas,
          calories: v.calories,
        })),
      })),
  }));
}

/**
 * Google reviews supplied by the restaurant as screenshots (22 Nov 2026), typed word for word.
 * Relative dates ("3 weeks ago") are left out because they go stale.
 */
export const seedReviews: Omit<ReviewData, "id">[] = [
  { author: "Shahid fiaz", rating: 5, source: "Google", dateText: null, lang: "en", text: "The ambience was on point, the Food was good quality and a good selection was available at a reasonable price. Adults 32 riyals. 5 to 10 year old 23 riyals. The hospitality of the waiting staff was amazing. Our table was kept clean as we filled up on our buffet. Sir Sameer helped us have an excellent experience. It is family friendly. With a well maintained play area. We came on a saturday afternoon for a buffet. Highly recommended!" },
  { author: "Little Adam", rating: 5, source: "Google", dateText: null, lang: "en", text: "Highly Highly recommended! Al Jalsa Restaurant is definitely a place worth visiting. The food was excellent, the service was outstanding, and the overall atmosphere was wonderful.\n\nA special thanks to Sameer for his exceptional service. He was extremely friendly, professional, attentive, and made sure everything was perfect. His hospitality really made our experience special.\n\nOne of the best dining experiences I've had. I would definitely come back again and highly recommend Al Jalsa Restaurant to everyone!" },
  { author: "Jamil Clicks", rating: 5, source: "Google", dateText: null, lang: "en", text: "Tried lunch buffet and it really amazing. The price is very reasonable and staff is so nice.\nNihari and wings were so delicious as well the naan. Recommended and must try place." },
  { author: "Nabil Khan", rating: 4, source: "Google", dateText: null, lang: "en", text: "We had a wonderful lunch experience at Jalsa Restaurant, Hara!\n\nMr. Samir and Mr. Salim provided excellent hospitality and made us feel truly welcome. We thoroughly enjoyed the delicious food, attentive service, and pleasant atmosphere. Every aspect of the experience made our visit memorable.\n\nA big thank you to the entire Jalsa team, especially Mr. Samir and Mr. Salim, for making our lunch so special.\n\nHighly recommended! Looking forward to visiting again." },
  { author: "safia yasmeen", rating: 5, source: "Google", dateText: null, lang: "en", text: "The atmosphere was cozy and welcoming. The buffet offered a good variety of Indian, Pakistani, and Chinese cuisines. The Dum Ki Chai was the highlight of the experience\u2014rich and flavorful. The buffet was reasonably priced, and the food was tasty with plenty of options to choose from. Overall, it was a pleasant dining experience." },
  { author: "Muhammad Faisal Chaudhary", rating: 5, source: "Google", dateText: null, lang: "en", text: "We had a really enjoyable experience at AL JALSA restaurant! The Saturday Special Lunch Buffet for only 32 SAR offers a great variety of delicious and freshly prepared dishes. The food was flavorful, and the service was friendly and attentive. Muhammad Faiq deserves special appreciation for his excellent service and hospitality.\n\nThe overall atmosphere was comfortable and welcoming. Excellent value for money and a great choice for a weekend lunch. Definitely recommended! \u{1F44C}" },
  { author: "FZ K", rating: 4, source: "Google", dateText: null, lang: "en", text: "Very good restaurant, great staff you can bring friends and family. A bit pricey cost of protein 25% higher. Tastes more Indian in the meat dishes but overall good taste. French fries were great. Chicken popcorn were made more like Chicken Dhaka. Mutton white handi was good taste. Well cooked and a bit starchy.\nShahi BBQ mix platter was not up to regular taste, just OK. Will come again." },
  { author: "Mohamed AlzaerY", rating: 5, source: "Google", dateText: null, lang: "en", text: "If you\u2019re looking for delicious Pak food, Al Jalza Restaurant is definitely worth a visit! \u{1F60D} \u2026" },
];

export function seedReviewsData(): ReviewData[] {
  return seedReviews.map((r, i) => ({ ...r, id: `review-${i}` }));
}

export function seedContentMap(): ContentMap {
  return Object.fromEntries(contentDefaults.map((c) => [c.key, { en: c.en, ar: c.ar }]));
}

export function seedSettings(): SiteSettingsData {
  return settingsDefaults;
}

export function seedGalleryData(): GalleryImageData[] {
  return seedGallery.map((g) => ({ id: g.slug, url: `/images/menu/${g.slug}.webp`, altEn: g.altEn, altAr: g.altAr }));
}
