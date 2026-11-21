import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteSettingsData } from "@/lib/types";
import { groupHours } from "@/lib/hours";
import { displayPhone } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { IconPhone, IconPin, IconWhatsApp } from "@/components/ui/Icons";

export function Footer({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: SiteSettingsData }) {
  const hours = groupHours(settings.hours, dict.days, locale, dict.common.closed);
  const left = [
    { path: "/", label: dict.nav.home },
    { path: "/menu", label: dict.nav.menu },
    { path: "/order", label: dict.nav.order },
    { path: "/catering", label: dict.nav.catering },
  ];
  const right = [
    { path: "/book-meeting", label: dict.nav.meeting },
    { path: "/about", label: dict.nav.about },
    { path: "/contact", label: dict.nav.contact },
  ];
  const address = locale === "ar" ? settings.addressAr : settings.addressEn;
  return (
    <footer className="relative border-t border-line/70 bg-ink/70">
      <div className="mx-auto grid max-w-[var(--container-site)] gap-12 px-5 pb-14 pt-20 sm:px-8 md:grid-cols-3 md:gap-8">
        <div>
          <p className="eyebrow mb-4">{dict.common.address}</p>
          <p className="text-sand">{address}</p>
          <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="action link-underline mt-4 inline-flex items-center gap-2 text-ivory">
            <IconPin size={16} /> {dict.common.directions}
          </a>
        </div>
        <div>
          <p className="eyebrow mb-4">{dict.common.hours}</p>
          <dl className="grid gap-2 text-sand">
            {hours.map((h) => (
              <div key={h.days} className="flex flex-wrap justify-between gap-x-4">
                <dt>{h.days}</dt>
                <dd dir="auto" className="text-ivory">{h.range}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="eyebrow mb-4">{dict.common.phone}</p>
          <a href={`tel:${settings.phone}`} className="text-ivory transition-colors hover:text-gold" dir="ltr">
            {displayPhone(settings.phone)}
          </a>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-gold action !min-h-11 !px-4">
              <IconWhatsApp size={17} /> {dict.common.whatsapp}
            </a>
            <a href={`tel:${settings.phone}`} className="btn btn-line action !min-h-11 !px-4">
              <IconPhone size={16} /> {dict.common.call}
            </a>
          </div>
        </div>
      </div>

      {/* Reference 1: social icons over a hairline, nav either side of a centred logo */}
      <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
        <div className="rule">
          <SocialLinks socials={settings.socials} label={dict.common.follow} />
        </div>
        <div className="grid items-center gap-8 py-10 lg:grid-cols-[1fr_auto_1fr]">
          <nav aria-label={locale === "ar" ? "روابط التذييل" : "Footer"} className="order-2 flex flex-wrap justify-center gap-x-7 gap-y-3 lg:order-1 lg:justify-start">
            {left.map((l) => (
              <Link key={l.path} href={href(locale, l.path)} className="action link-underline text-sand hover:text-ivory">
                {l.label}
              </Link>
            ))}
          </nav>
          <Logo locale={locale} size="md" className="order-1 justify-self-center lg:order-2" />
          <nav aria-label={locale === "ar" ? "روابط التذييل الإضافية" : "Footer, more pages"} className="order-3 flex flex-wrap justify-center gap-x-7 gap-y-3 lg:justify-end">
            {right.map((l) => (
              <Link key={l.path} href={href(locale, l.path)} className="action link-underline text-sand hover:text-ivory">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line/60 py-6 text-center sm:flex-row sm:text-start">
          <p className="meta">
            {locale === "ar" ? settings.nameAr : settings.nameEn}. {dict.common.rightsReserved}
          </p>
          <p className="meta" lang={locale === "ar" ? "en" : "ar"}>
            {locale === "ar" ? settings.nameEn : settings.nameAr}
          </p>
        </div>
      </div>
    </footer>
  );
}
