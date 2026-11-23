import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/i18n/config";

/**
 * Official logo pieces (emblem + wordmark). `tone="light"` for dark grounds, `"dark"` for light ones.
 * Never mirrored in Arabic. `stacked` puts the wordmark under the emblem (footer).
 */
export function Logo({
  locale,
  className = "",
  size = "md",
  tone = "light",
  stacked = false,
  priority = false,
}: {
  locale: Locale;
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  stacked?: boolean;
  priority?: boolean;
}) {
  const h = size === "lg" ? 64 : size === "sm" ? 36 : 46;
  const markW = Math.round((h * 1115) / 1493);
  const wordH = Math.round(h * (stacked ? 0.3 : 0.34));
  const wordW = Math.round((wordH * 3466) / 445);
  const sfx = tone === "light" ? "-light" : "";
  return (
    <Link
      href={href(locale)}
      dir="ltr"
      className={`inline-flex min-h-11 items-center ${stacked ? "flex-col gap-3" : "gap-3"} ${className}`}
      aria-label={locale === "ar" ? "مطعم الجلسة، الصفحة الرئيسية" : "Al Jalsa Restaurant, home"}
    >
      <Image src={`/brand/logo-mark${sfx}.png`} alt="" width={markW} height={h} preload={priority} className="max-w-none shrink-0" style={{ width: markW, height: h }} />
      <Image src={`/brand/logo-wordmark${sfx}.png`} alt="" width={wordW} height={wordH} preload={priority} className="max-w-none shrink-0" style={{ width: wordW, height: wordH }} />
    </Link>
  );
}
