import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SiteSettingsData } from "@/lib/types";
import { groupHours } from "@/lib/hours";
import { displayPhone } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { MapEmbed } from "./MapEmbed";
import { OpenStatus } from "./OpenStatus";
import { Reveal } from "@/components/motion/Reveal";
import { IconClock, IconPhone, IconPin, IconWhatsApp } from "@/components/ui/Icons";

/** Location, hours and contact with a map. Used on the home, about and contact pages. */
export function VisitBlock({
  locale,
  dict,
  settings,
  title,
  text,
  headingLevel = "h2",
}: {
  locale: Locale;
  dict: Dictionary;
  settings: SiteSettingsData;
  title: string;
  text?: string;
  headingLevel?: "h1" | "h2";
}) {
  const H = headingLevel;
  const address = locale === "ar" ? settings.addressAr : settings.addressEn;
  const hours = groupHours(settings.hours, dict.days, locale, dict.common.closed);
  return (
    <div className="mx-auto grid max-w-[var(--container-site)] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
      <Reveal className="flex flex-col justify-center">
        <p data-reveal className="eyebrow flex items-center gap-3">
          <span className="diamond" aria-hidden /> {dict.common.address}
        </p>
        <H data-reveal className="font-display text-display mt-5 uppercase text-ivory">
          {title}
        </H>
        {text ? (
          <p data-reveal className="mt-5 max-w-[40ch] text-sand">
            {text}
          </p>
        ) : null}
        <dl className="mt-10 grid gap-7">
          <div data-reveal className="flex gap-4">
            <dt className="mt-1 text-gold">
              <IconPin size={20} />
              <span className="sr-only">{dict.common.address}</span>
            </dt>
            <dd>
              <p className="text-ivory">{address}</p>
              <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="action link-underline mt-2 inline-block text-gold">
                {dict.common.directions}
              </a>
            </dd>
          </div>
          <div data-reveal className="flex gap-4">
            <dt className="mt-1 text-gold">
              <IconClock size={20} />
              <span className="sr-only">{dict.common.hours}</span>
            </dt>
            <dd className="grid w-full gap-2">
              <OpenStatus hours={settings.hours} labels={{ open: dict.common.openNow, closed: dict.common.closedNow }} />
              {hours.map((h) => (
                <p key={h.days} className="flex flex-wrap justify-between gap-x-6 border-b border-line/60 pb-2">
                  <span className="text-sand">{h.days}</span>
                  <span className="text-ivory">{h.range}</span>
                </p>
              ))}
            </dd>
          </div>
          <div data-reveal className="flex gap-4">
            <dt className="mt-1 text-gold">
              <IconPhone size={20} />
              <span className="sr-only">{dict.common.phone}</span>
            </dt>
            <dd>
              <a href={`tel:${settings.phone}`} dir="ltr" className="text-ivory transition-colors hover:text-gold">
                {displayPhone(settings.phone)}
              </a>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-gold action !min-h-11">
                  <IconWhatsApp size={17} /> {dict.common.whatsapp}
                </a>
                <a href={`tel:${settings.phone}`} className="btn btn-line action !min-h-11">
                  {dict.common.call}
                </a>
              </div>
            </dd>
          </div>
        </dl>
      </Reveal>
      <MapEmbed query={settings.mapsEmbedQuery} title={dict.common.mapTitle} loadLabel={dict.common.loadMap} address={address} className="min-h-[360px] lg:min-h-[560px]" />
    </div>
  );
}
