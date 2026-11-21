import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/i18n/config";

/** Official logo pieces (emblem + wordmark), light version for dark grounds. Never mirrored. */
export function Logo({
  locale,
  className = "",
  size = "md",
  priority = false,
}: {
  locale: Locale;
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}) {
  const h = size === "lg" ? 64 : size === "sm" ? 38 : 46;
  const markW = Math.round((h * 383) / 511);
  const wordH = Math.round(h * 0.36);
  const wordW = Math.round((wordH * 1157) / 150);
  return (
    <Link
      href={href(locale)}
      dir="ltr"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label={locale === "ar" ? "مطعم الجلسة، الصفحة الرئيسية" : "Al Jalsa Restaurant, home"}
    >
      <Image
        src="/brand/logo-mark-light.png"
        alt=""
        width={markW}
        height={h}
        preload={priority}
        className="max-w-none shrink-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-6"
        style={{ width: markW, height: h }}
      />
      <Image
        src="/brand/logo-wordmark-light.png"
        alt=""
        width={wordW}
        height={wordH}
        preload={priority}
        className="max-w-none shrink-0"
        style={{ width: wordW, height: wordH }}
      />
    </Link>
  );
}
