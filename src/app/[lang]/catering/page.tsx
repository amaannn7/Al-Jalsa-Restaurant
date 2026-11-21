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
import { PhotoBand } from "@/components/catering/PhotoBand";
import { CateringForm } from "@/components/forms/CateringForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/motion/Reveal";
import { IconArrow, IconPhone, IconWhatsApp } from "@/components/ui/Icons";

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
  const heroPlate = findItem(menu, "bbq-mix-platter");
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
        image={heroPlate?.cutoutWhole ? heroPlate.cutoutUrl : null}
        imageAlt={heroPlate ? pick(heroPlate, "name", lang) : ""}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="#quote" className="btn btn-gold action">
            {dict.common.requestQuote}
          </a>
          <Link href={href(lang, "/book-meeting")} className="action link-underline inline-flex items-center justify-center gap-2 px-2 py-3 text-ivory">
            {dict.nav.meeting} <IconArrow size={16} />
          </Link>
        </div>
      </PageHero>

      <section className="py-16 lg:py-24" aria-labelledby="services-title">
        <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
          <h2 id="services-title" className="eyebrow mb-8 flex items-center gap-3">
            <span className="diamond" aria-hidden /> {c("catering.services.title")}
          </h2>
          <ServiceList services={services} />
        </div>
      </section>

      <PhotoBand
        images={[
          { src: photo("mutton-dum-biryani"), alt: lang === "ar" ? "لحم دوم برياني" : "Mutton dum biryani" },
          { src: photo("chicken-tandoori"), alt: lang === "ar" ? "دجاج تندوري" : "Chicken tandoori" },
          { src: photo("garlic-naan"), alt: lang === "ar" ? "نان بالثوم" : "Garlic naan" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <span data-reveal className="diamond mx-auto block text-gold" aria-hidden />
          <h2 data-reveal className="font-display text-display mt-6 uppercase">
            {c("catering.custom.title")}
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-[52ch] text-lg text-sand">
            {c("catering.custom.text")}
          </p>
        </Reveal>
      </section>

      {packages.length ? (
        <section className="pb-24" aria-labelledby="packages-title">
          <SectionTitle id="packages-title" title={c("catering.packages.title")} />
          <Reveal className={`mx-auto mt-14 grid max-w-[var(--container-site)] gap-5 px-5 sm:px-8 ${packages.length === 1 ? "max-w-xl" : packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {packages.map((p) => {
              const includes = (lang === "ar" && p.includesAr ? p.includesAr : p.includesEn).split("\n").map((s) => s.trim()).filter(Boolean);
              const note = lang === "ar" && p.priceNoteAr ? p.priceNoteAr : p.priceNoteEn;
              return (
                <article key={p.id} data-reveal className="flex flex-col border border-line bg-ink-2/80 p-8">
                  <h3 className="font-dish text-2xl">{pick(p, "name", lang)}</h3>
                  {p.priceHalalas != null ? <p className="mt-3 text-xl text-gold">{formatPrice(p.priceHalalas, lang)}</p> : null}
                  {note ? <p className="meta mt-1">{note}</p> : null}
                  {p.minGuests ? (
                    <p className="meta mt-1">
                      {lang === "ar" ? `الحد الأدنى ${p.minGuests} ضيفاً` : `Minimum ${p.minGuests} guests`}
                    </p>
                  ) : null}
                  {pick(p, "description", lang) ? <p className="mt-4 text-sand">{pick(p, "description", lang)}</p> : null}
                  {includes.length ? (
                    <ul className="mt-5 grid gap-2 border-t border-line pt-5">
                      {includes.map((i) => (
                        <li key={i} className="flex gap-3 text-sand">
                          <span className="diamond mt-2 !h-1.5 !w-1.5 text-gold" aria-hidden />
                          {i}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <a href="#quote" className="btn btn-line action mt-auto self-start !mt-8">
                    {dict.common.requestQuote}
                  </a>
                </article>
              );
            })}
          </Reveal>
        </section>
      ) : null}

      <section id="quote" className="band-maroon scroll-mt-20 border-y border-gold/25 py-20 lg:py-28" aria-labelledby="quote-title">
        <div className="mx-auto grid max-w-[var(--container-site)] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow !text-gold-soft">{dict.nav.catering}</p>
            <h2 id="quote-title" className="font-display text-display mt-5 uppercase">
              {c("catering.cta.title")}
            </h2>
            <p className="mt-6 max-w-[40ch] text-ivory/85">{c("catering.cta.text")}</p>
            <div className="mt-10 grid gap-4 border-t border-gold/25 pt-8">
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-ivory transition-colors hover:text-gold-soft">
                <IconWhatsApp size={20} /> <span dir="ltr">{displayPhone(settings.whatsapp)}</span>
              </a>
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-3 text-ivory transition-colors hover:text-gold-soft">
                <IconPhone size={20} /> <span dir="ltr">{displayPhone(settings.phone)}</span>
              </a>
              <Link href={href(lang, "/book-meeting")} className="action link-underline mt-2 inline-flex items-center gap-2 self-start text-gold-soft">
                {dict.nav.meeting} <IconArrow size={16} />
              </Link>
            </div>
          </div>
          <div className="border border-gold/25 bg-ink/70 p-6 sm:p-10">
            <h3 className="font-display text-title uppercase">{c("catering.form.title")}</h3>
            <div className="mt-8">
              <CateringForm locale={lang} dict={dict} whatsapp={settings.whatsapp} packages={packages.map((p) => pick(p, "name", lang))} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
