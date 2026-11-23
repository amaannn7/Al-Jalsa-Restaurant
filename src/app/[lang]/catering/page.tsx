import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCateringPackages, getContent, getMenu, getSettings, t } from "@/lib/data";
import { formatPrice } from "@/lib/money";
import { findItem } from "@/lib/menu-helpers";
import { displayPhone } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { ServiceList } from "@/components/catering/ServiceList";
import { CateringForm } from "@/components/forms/CateringForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrow, IconCheck, IconPhone, IconWhatsApp } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/catering">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMetadata({
    locale: lang,
    path: "/catering",
    title: lang === "ar" ? "خدمات الضيافة والطلبات الكبيرة" : "Catering and Large Orders",
    description:
      lang === "ar"
        ? "ضيافة من مطعم الجلسة لفعاليات الشركات والتجمعات العائلية والاحتفالات والطلبات الكبيرة في الرياض. اطلب عرض سعر عبر واتساب."
        : "Catering from Al Jalsa Restaurant for corporate events, family gatherings, celebrations and large group orders in Riyadh. Request a quote on WhatsApp.",
  });
}

export default async function CateringPage({ params }: PageProps<"/[lang]/catering">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [content, settings, packages, menu] = await Promise.all([getContent(), getSettings(), getCateringPackages(), getMenu()]);
  const c = (k: string) => t(content, k, lang);
  const photo = (slug: string, fallback = "shahi-chicken-biryani") => findItem(menu, slug)?.imageUrl ?? findItem(menu, fallback)?.imageUrl ?? "/images/menu/shahi-chicken-biryani.webp";
  const services = [
    { n: 1, img: photo("shahi-chicken-biryani") },
    { n: 2, img: photo("mutton-dum-biryani") },
    { n: 3, img: photo("gulab-jamun") },
    { n: 4, img: photo("chicken-tandoori") },
    { n: 5, img: photo("mutton-rogan-josh") },
  ].map((s) => ({ title: c(`catering.service.${s.n}.title`), text: c(`catering.service.${s.n}.text`), image: s.img }));

  return (
    <>
      <PageHero
        eyebrow={c("catering.hero.eyebrow")}
        title={c("catering.hero.title")}
        text={c("catering.hero.text")}
        image="/images/site/catering.webp"
        imageAlt={lang === "ar" ? "أطباق ضيافة على طاولة بوفيه" : "Catering dishes on a buffet table"}
      >
        <div className="flex flex-wrap items-center gap-3">
          <a href="#quote" className="btn btn-sand action">
            {dict.common.requestQuote} <IconArrow size={17} />
          </a>
          <Link href={href(lang, "/book-meeting")} className="btn btn-ghost action">
            {dict.nav.meeting}
          </Link>
        </div>
      </PageHero>

      <section className="py-20 lg:py-28" aria-labelledby="services-title">
        <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
          <SectionTitle id="services-title" eyebrow={dict.nav.catering} title={c("catering.services.title")} />
          <div className="mt-12">
            <ServiceList services={services} />
          </div>
        </div>
      </section>

      <section className="px-3 sm:px-4">
        <div className="dark-card mx-auto grid max-w-[1600px] items-center gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1fr_1fr] lg:px-14 lg:py-20">
          <div>
            <p data-reveal className="eyebrow !text-sand">
              {c("catering.hero.eyebrow")}
            </p>
            <h2 data-reveal className="font-display text-display mt-4 text-white">
              {c("catering.custom.title")}
            </h2>
            <p data-reveal className="mt-5 max-w-[48ch] text-lg text-white/75">
              {c("catering.custom.text")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["chicken-karahi", "tandoori-prawns", "mutton-sheekh-kabab"].map((slug, i) => (
              <div key={slug} data-reveal="photo" className={`relative aspect-[3/4] overflow-hidden rounded-[20px] bg-ink-2 ${i === 1 ? "" : "translate-y-6"}`}>
                <Image src={photo(slug)} alt={findItem(menu, slug) ? pick(findItem(menu, slug)!, "name", lang) : ""} fill sizes="(max-width: 1024px) 30vw, 240px" quality={85} className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {packages.length ? (
        <section className="py-20 lg:py-28" aria-labelledby="packages-title">
          <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
            <SectionTitle id="packages-title" title={c("catering.packages.title")} />
            <div className={`mt-12 grid gap-4 ${packages.length === 1 ? "max-w-xl" : packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
              {packages.map((p) => {
                const includes = (lang === "ar" && p.includesAr ? p.includesAr : p.includesEn).split("\n").map((s) => s.trim()).filter(Boolean);
                const note = lang === "ar" && p.priceNoteAr ? p.priceNoteAr : p.priceNoteEn;
                return (
                  <article key={p.id} data-reveal className="card flex flex-col p-7 sm:p-8">
                    <h3 className="font-dish text-2xl text-ink">{pick(p, "name", lang)}</h3>
                    {p.priceHalalas != null ? <p className="mt-3 text-xl font-medium text-bronze">{formatPrice(p.priceHalalas, lang)}</p> : null}
                    {note ? <p className="meta mt-1">{note}</p> : null}
                    {p.minGuests ? <p className="meta mt-1">{lang === "ar" ? `الحد الأدنى ${p.minGuests} ضيفاً` : `Minimum ${p.minGuests} guests`}</p> : null}
                    {pick(p, "description", lang) ? <p className="mt-4 text-muted">{pick(p, "description", lang)}</p> : null}
                    {includes.length ? (
                      <ul className="mt-5 grid gap-2 border-t border-hair pt-5">
                        {includes.map((i) => (
                          <li key={i} className="flex gap-3 text-ink-3">
                            <IconCheck size={17} className="mt-1 shrink-0 text-bronze" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <a href="#quote" className="btn btn-outline action mt-auto self-start !mt-8">
                      {dict.common.requestQuote}
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="h-20 lg:h-28" />
      )}

      <section id="quote" className="scroll-mt-28 pb-20 lg:pb-28" aria-labelledby="quote-title">
        <div className="mx-auto grid max-w-[var(--container-site)] gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">{dict.nav.catering}</p>
            <h2 id="quote-title" className="font-display text-display mt-4 text-ink">
              {c("catering.cta.title")}
            </h2>
            <p className="mt-5 max-w-[40ch] text-lg text-muted">{c("catering.cta.text")}</p>
            <div className="mt-10 grid gap-3">
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-ink hover:text-bronze">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-card">
                  <IconWhatsApp size={19} />
                </span>
                <span dir="ltr">{displayPhone(settings.whatsapp)}</span>
              </a>
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-3 text-ink hover:text-bronze">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-card">
                  <IconPhone size={19} />
                </span>
                <span dir="ltr">{displayPhone(settings.phone)}</span>
              </a>
              <Link href={href(lang, "/book-meeting")} className="action mt-2 inline-flex min-h-11 items-center gap-2 self-start text-bronze hover:text-ink">
                {dict.nav.meeting} <IconArrow size={16} />
              </Link>
            </div>
          </div>
          <div className="card p-6 sm:p-10">
            <h3 className="font-display text-title text-ink">{c("catering.form.title")}</h3>
            <div className="mt-8">
              <CateringForm locale={lang} dict={dict} whatsapp={settings.whatsapp} packages={packages.map((p) => pick(p, "name", lang))} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
