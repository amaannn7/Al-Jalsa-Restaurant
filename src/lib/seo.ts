import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const pages = ["", "/menu", "/order", "/catering", "/book-meeting", "/about", "/contact"] as const;

export function pageMetadata(opts: {
  locale: Locale;
  path: (typeof pages)[number];
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const { locale, path, title, description } = opts;
  const url = `${siteUrl}/${locale}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { en: `${siteUrl}/en${path}`, ar: `${siteUrl}/ar${path}`, "x-default": `${siteUrl}/en${path}` },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: locale === "ar" ? "مطعم الجلسة" : "Al Jalsa Restaurant",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      images: [{ url: opts.image ?? "/og-image.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/** Serialises JSON-LD safely for a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
