import type { Locale } from "@/i18n/config";

/** Formats halalas as SAR. Whole riyals show no decimals: 4200 -> "SAR 42" / "42 ر.س". */
export function formatPrice(halalas: number, locale: Locale): string {
  const riyals = halalas / 100;
  const digits = Number.isInteger(riyals) ? 0 : 2;
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(riyals);
  return locale === "ar" ? `${n} ر.س` : `SAR ${n}`;
}

/** "450 cal" / "450 سعرة حرارية"; several sizes join with " / ". Empty when none are known. */
export function formatCalories(values: (number | null)[], locale: Locale): string {
  const known = values.filter((v): v is number => v != null);
  if (!known.length) return "";
  const unique = [...new Set(known)];
  return locale === "ar" ? `${unique.join(" / ")} سعرة حرارية` : `${unique.join(" / ")} cal`;
}

export function lowestPrice(variants: { priceHalalas: number | null }[]): number | null {
  const prices = variants.map((v) => v.priceHalalas).filter((p): p is number => p != null);
  return prices.length ? Math.min(...prices) : null;
}
