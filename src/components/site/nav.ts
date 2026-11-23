import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/** Site pages in menu order (shared by the header and footer). */
export function navLinks(dict: Dictionary) {
  return [
    { path: "/menu", label: dict.nav.menu },
    { path: "/order", label: dict.nav.order },
    { path: "/catering", label: dict.nav.catering },
    { path: "/book-meeting", label: dict.nav.meeting },
    { path: "/about", label: dict.nav.about },
    { path: "/contact", label: dict.nav.contact },
  ];
}

export function switchLocalePath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  parts[1] = to;
  return parts.join("/") || `/${to}`;
}
