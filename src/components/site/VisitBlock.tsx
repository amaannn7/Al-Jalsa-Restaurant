import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteSettingsData } from "@/lib/types";
import { groupHours } from "@/lib/hours";
import { displayPhone } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { MapEmbed } from "./MapEmbed";
import { OpenStatus } from "./OpenStatus";
import { IconArrowUpRight, IconClock, IconPhone, IconPin, IconWhatsApp } from "@/components/ui/Icons";

/** Location, hours and contact beside a map, in one white card. Used on home, about and contact. */
export function VisitBlock({
  locale,
  dict,
  settings,
  title,
  text,
  eyebrow,
  headingLevel = "h2",
}: {
  locale: Locale;
  dict: Dictionary;
  settings: SiteSettingsData;
  title: string;
  text?: string;
  eyebrow?: string;
  headingLevel?: "h1" | "h2";
}) {
  const H = headingLevel;
  const address = locale === "ar" ? settings.addressAr : settings.addressEn;
  const hours = groupHours(settings.hours, dict.days, locale, dict.common.closed);
  return (
    <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
      <div className="card grid gap-2 p-2 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col p-5 sm:p-8 lg:p-10">
          <p data-reveal className="eyebrow">
            {eyebrow ?? dict.common.address}
          </p>
          <H data-reveal className="font-display text-display mt-4 text-ink">
            {title}
          </H>
          {text ? (
            <p data-reveal className="mt-4 max-w-[40ch] text-muted">
              {text}
            </p>
          ) : null}
          <dl className="mt-10 grid gap-6">
            <div className="flex gap-4">
              <dt className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linen text-ink">
                <IconPin size={19} />
                <span className="sr-only">{dict.common.address}</span>
              </dt>
              <dd>
                <p className="text-ink">{address}</p>
                <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="action mt-1.5 inline-flex items-center gap-1.5 text-bronze hover:text-ink">
                  {dict.common.directions} <IconArrowUpRight size={15} />
                </a>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linen text-ink">
                <IconClock size={19} />
                <span className="sr-only">{dict.common.hours}</span>
              </dt>
              <dd className="grid w-full gap-2">
                <span className="justify-self-start">
                  <OpenStatus hours={settings.hours} labels={{ open: dict.common.openNow, closed: dict.common.closedNow }} />
                </span>
                {hours.map((h) => (
                  <p key={h.days} className="flex flex-wrap justify-between gap-x-6 border-b border-hair pb-2">
                    <span className="text-muted">{h.days}</span>
                    <span className="text-ink">{h.range}</span>
                  </p>
                ))}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linen text-ink">
                <IconPhone size={19} />
                <span className="sr-only">{dict.common.phone}</span>
              </dt>
              <dd>
                <a href={`tel:${settings.phone}`} dir="ltr" className="text-ink hover:text-bronze">
                  {displayPhone(settings.phone)}
                </a>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-dark action !min-h-11">
                    <IconWhatsApp size={17} /> {dict.common.whatsapp}
                  </a>
                  <a href={`tel:${settings.phone}`} className="btn btn-outline action !min-h-11">
                    {dict.common.call}
                  </a>
                </div>
              </dd>
            </div>
          </dl>
        </div>
        <MapEmbed query={settings.mapsEmbedQuery} title={dict.common.mapTitle} address={address} openHref={settings.mapsUrl} openLabel={dict.common.openInMaps} className="min-h-[360px] rounded-[20px] lg:min-h-full" />
      </div>
    </div>
  );
}
