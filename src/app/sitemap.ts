import type { MetadataRoute } from "next";
import { pages, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((path) =>
    (["en", "ar"] as const).map((lang) => ({
      url: `${siteUrl}/${lang}${path}`,
      changeFrequency: path === "/menu" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/menu" ? 0.9 : 0.7,
      alternates: { languages: { en: `${siteUrl}/en${path}`, ar: `${siteUrl}/ar${path}` } },
    })),
  );
}
