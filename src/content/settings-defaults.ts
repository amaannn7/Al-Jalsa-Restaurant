import type { SiteSettingsData } from "@/lib/types";

/**
 * Restaurant details. Sources are recorded in docs/01-research-and-plan.md.
 * Fields listed in `unconfirmed` show a "needs confirmation" badge in the admin.
 */
export const settingsDefaults: SiteSettingsData = {
  nameEn: "Al Jalsa Restaurant",
  nameAr: "مطعم الجلسة",
  phone: "+966566715786",
  whatsapp: "966566715786",
  email: null,
  // Street from Google Maps (client); "behind the Chamber of Commerce" from the restaurant's buffet posters.
  addressEn: "Ibn Al Nadeem Street, Al Murabba (behind the Chamber of Commerce), Riyadh 12626, Saudi Arabia",
  addressAr: "شارع ابن النديم، حي المربع (خلف الغرفة التجارية)، الرياض 12626، المملكة العربية السعودية",
  mapsUrl: "https://share.google/Q3kOWnG8Lw7v25VOw",
  mapsEmbedQuery: "Al Jalsa Restaurant, Ibn Al Nadeem, Al Murabba, Riyadh",
  // 0 = Sunday ... 6 = Saturday. Times are 24h; a close time earlier than open means after midnight.
  hours: [
    { day: 0, open: "06:00", close: "01:00", closed: false },
    { day: 1, open: "06:00", close: "01:00", closed: false },
    { day: 2, open: "06:00", close: "01:00", closed: false },
    { day: 3, open: "06:00", close: "01:00", closed: false },
    { day: 4, open: "06:00", close: "02:00", closed: false },
    { day: 5, open: "06:00", close: "02:00", closed: false },
    { day: 6, open: "06:00", close: "01:00", closed: false },
  ],
  socials: {
    facebook: "https://www.facebook.com/aljalsarestaurant/",
    instagram: "https://www.instagram.com/aljalsarestaurant/",
    tiktok: "",
    snapchat: "",
    x: "",
  },
  takeawayEnabled: true,
  deliveryEnabled: true,
  deliveryFeeHalalas: null,
  deliveryNoteEn: "",
  deliveryNoteAr: "",
  buffetEnabled: true,
  googleRating: null,
  googleReviewCount: null,
  ratingCheckedOn: null,
  // Confirmed by the restaurant: WhatsApp (buffet posters), Facebook page, and that they deliver.
  // The delivery fee is not known yet, so customers see "confirmed by the restaurant".
  unconfirmed: ["deliveryFeeHalalas"],
};
