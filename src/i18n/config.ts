export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "aj_lang";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Picks the English or Arabic field of a bilingual record, falling back to English. */
export function pick<T extends Record<string, unknown>>(
  record: T,
  base: string,
  locale: Locale,
): string {
  const ar = record[`${base}Ar`];
  const en = record[`${base}En`];
  if (locale === "ar" && typeof ar === "string" && ar.trim()) return ar;
  return typeof en === "string" ? en : "";
}

/** Builds a locale-prefixed path: href("ar", "/menu") -> "/ar/menu". */
export function href(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}
