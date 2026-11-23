import Link from "next/link";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteSettingsData } from "@/lib/types";
import { groupHours } from "@/lib/hours";
import { displayPhone } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { navLinks } from "./nav";
import { IconArrowUpRight, IconPhone, IconWhatsApp } from "@/components/ui/Icons";

/** Dark rounded card at the bottom of every page. */
export function Footer({ locale, dict, settings, tagline }: { locale: Locale; dict: Dictionary; settings: SiteSettingsData; tagline: string }) {
  const hours = groupHours(settings.hours, dict.days, locale, dict.common.closed);
  const pages = [{ path: "/", label: dict.nav.home }, ...navLinks(dict)];
  const address = locale === "ar" ? settings.addressAr : settings.addressEn;
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="dark-card">
        <div className="mx-auto grid max-w-[var(--container-site)] gap-12 px-6 pb-10 pt-16 sm:px-10 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr] lg:gap-10 lg:pt-20">
          <div className="max-w-sm">
            <Logo locale={locale} size="md" />
            <p className="mt-6 text-white/70">{tagline}</p>
            <div className="mt-6">
              <SocialLinks socials={settings.socials} label={dict.common.follow} />
            </div>
          </div>
          <nav aria-label={locale === "ar" ? "روابط التذييل" : "Footer"}>
            <p className="eyebrow !text-sand">{locale === "ar" ? "الصفحات" : "Pages"}</p>
            <ul className="mt-5 grid gap-2.5">
              {pages.map((l) => (
                <li key={l.path}>
                  <Link href={href(locale, l.path)} className="link-underline text-white/75 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow !text-sand">{dict.common.hours}</p>
            <dl className="mt-5 grid gap-3">
              {hours.map((h) => (
                <div key={h.days}>
                  <dt className="text-white/60">{h.days}</dt>
                  <dd dir="auto" className="text-white">
                    {h.range}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="eyebrow !text-sand">{dict.common.address}</p>
            <p className="mt-5 text-white/75">{address}</p>
            <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="action mt-3 inline-flex items-center gap-2 text-white hover:text-sand">
              {dict.common.directions} <IconArrowUpRight size={16} />
            </a>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-sand action !min-h-11 !px-4">
                <IconWhatsApp size={17} /> {dict.common.whatsapp}
              </a>
              <a href={`tel:${settings.phone}`} className="btn btn-ghost action !min-h-11 !px-4">
                <IconPhone size={16} /> <span dir="ltr">{displayPhone(settings.phone)}</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[var(--container-site)] px-6 sm:px-10">
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:text-start">
            <p className="text-sm text-white/55">
              © {locale === "ar" ? settings.nameAr : settings.nameEn}. {dict.common.rightsReserved}
            </p>
            <p className="text-sm text-white/55" lang={locale === "ar" ? "en" : "ar"}>
              {locale === "ar" ? settings.nameEn : settings.nameAr}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
