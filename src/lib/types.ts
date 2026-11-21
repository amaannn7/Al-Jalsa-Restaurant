/** Plain, serialisable shapes used by the public site (safe to pass through "use cache"). */

export type DayHours = { day: number; open: string; close: string; closed: boolean };

export type Socials = {
  facebook: string;
  instagram: string;
  tiktok: string;
  snapchat: string;
  x: string;
};

export type SiteSettingsData = {
  nameEn: string;
  nameAr: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  addressEn: string;
  addressAr: string;
  mapsUrl: string;
  mapsEmbedQuery: string;
  hours: DayHours[];
  socials: Socials;
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFeeHalalas: number | null;
  deliveryNoteEn: string;
  deliveryNoteAr: string;
  buffetEnabled: boolean;
  googleRating: number | null;
  googleReviewCount: number | null;
  ratingCheckedOn: string | null;
  unconfirmed: string[];
};

export type Variant = {
  id: string;
  nameEn: string;
  nameAr: string;
  priceHalalas: number | null;
  calories: number | null;
};

export type MenuItemData = {
  id: string;
  slug: string;
  categorySlug: string;
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
  variants: Variant[];
};

export type CategoryData = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  items: MenuItemData[];
};

export type CateringPackageData = {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  includesEn: string;
  includesAr: string;
  priceHalalas: number | null;
  priceNoteEn: string;
  priceNoteAr: string;
  minGuests: number | null;
  imageUrl: string | null;
};

export type ReviewData = {
  id: string;
  author: string;
  text: string;
  rating: number | null;
  source: string;
  dateText: string | null;
  lang: string;
};

export type GalleryImageData = { id: string; url: string; altEn: string; altAr: string };

export type ContentMap = Record<string, { en: string; ar: string }>;
