import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

/**
 * The site's public address. Accepts "example.com" as well as "https://example.com" (adds https://),
 * falls back to the production address Vercel provides, and never throws on a bad value.
 */
function resolveSiteUrl(): string {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL];
  for (const raw of candidates) {
    const v = (raw ?? "").trim().replace(/^["']|["']$/g, "");
    if (!v) continue;
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      return u.origin;
    } catch {
      // try the next candidate
    }
  }
  return "http://localhost:3000";
}
export const siteUrl = resolveSiteUrl();
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
