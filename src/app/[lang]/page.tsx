import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getGallery, getMenu, getReviews, getSettings, t } from "@/lib/data";
import { formatPrice, lowestPrice } from "@/lib/money";
import { allItems, hasPhoto, PLATE_PREFERENCES, pickPlate } from "@/lib/menu-helpers";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedRail } from "@/components/home/FeaturedRail";
import { Gallery } from "@/components/home/Gallery";
import { Reviews } from "@/components/home/Reviews";
import { CateringBand } from "@/components/home/CateringBand";
import { BuffetSection } from "@/components/home/BuffetSection";
import { waLink } from "@/lib/whatsapp";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { VisitBlock } from "@/components/site/VisitBlock";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const content = await getContent();
  return {
    ...pageMetadata({ locale: lang, path: "", title: t(content, "seo.home.title", lang), description: t(content, "seo.home.description", lang) }),
    title: { absolute: t(content, "seo.home.title", lang) },
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [menu, content, settings, gallery, reviews] = await Promise.all([getMenu(), getContent(), getSettings(), getGallery(), getReviews()]);
  const c = (key: string) => t(content, key, lang);
  const name = (i: { nameEn: string; nameAr: string }) => (lang === "ar" && i.nameAr ? i.nameAr : i.nameEn);

  const used = new Set<string>();
  const heroItems = PLATE_PREFERENCES.hero.map((p) => pickPlate(menu, p, used)).filter(Boolean) as NonNullable<ReturnType<typeof pickPlate>>[];
  const storyItems = PLATE_PREFERENCES.story.map((p) => pickPlate(menu, p, used));
  const heroPlate = (i: (typeof heroItems)[number]) => {
    const low = lowestPrice(i.variants);
    return {
      slug: i.slug,
      src: i.cutoutUrl ?? i.imageUrl ?? "",
      name: name(i),
      description: pick(i, "description", lang),
      price: low == null ? dict.common.priceOnRequest : `${i.variants.length > 1 ? `${dict.common.from} ` : ""}${formatPrice(low, lang)}`,
    };
  };

  // Plates only for sections with real photos; the rest are listed as links (no fake imagery).
  const otherCategories = menu
    .filter((cat) => cat.items.length && !hasPhoto(cat.items))
    .map((cat) => ({ slug: cat.slug, name: pick(cat, "name", lang), href: href(lang, `/menu#${cat.slug}`), count: cat.items.length }));
  const categoryRows = menu
    .filter((cat) => cat.items.length && hasPhoto(cat.items))
    .map((cat) => {
      const plate = pickPlate(menu, PLATE_PREFERENCES.category[cat.slug] ?? [], used, cat.slug) ?? cat.items[0];
      return {
        slug: cat.slug,
        name: pick(cat, "name", lang),
        description: pick(cat, "description", lang),
        count: `${cat.items.length} ${dict.menu.dishes}`,
        href: href(lang, `/menu#${cat.slug}`),
        plate,
        plateName: name(plate),
      };
    });

  const featured = allItems(menu).filter((i) => i.isFeatured);
  const cateringPhoto = allItems(menu).find((i) => i.slug === "mutton-dum-biryani")?.imageUrl ?? allItems(menu).find((i) => i.imageUrl)?.imageUrl ?? "/images/menu/shahi-chicken-biryani.webp";

  const highlights = [1, 2, 3, 4].map((n) => ({ title: c(`highlight.${n}.title`), text: c(`highlight.${n}.text`) }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/#restaurant`,
    name: settings.nameEn,
    alternateName: settings.nameAr,
    url: `${siteUrl}/${lang}`,
    telephone: settings.phone,
    image: `${siteUrl}/og-image.jpg`,
    logo: `${siteUrl}/brand/logo-full.png`,
    servesCuisine: ["Indian", "Indo-Chinese", "Grill"],
    menu: `${siteUrl}/${lang}/menu`,
    hasMenu: `${siteUrl}/${lang}/menu`,
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ibn Al Nadeem Street",
      addressLocality: "Riyadh",
      addressRegion: "Al Murabba",
      postalCode: "12626",
      addressCountry: "SA",
    },
    openingHoursSpecification: settings.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][h.day],
        opens: h.open,
        closes: h.close,
      })),
    sameAs: Object.values(settings.socials).filter((u) => u.startsWith("http")),
    ...(settings.googleRating != null && settings.googleReviewCount != null
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: settings.googleRating, reviewCount: settings.googleReviewCount } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      {heroItems.length === 2 ? (
        <Hero
          eyebrow={c("home.hero.eyebrow")}
          title={lang === "ar" ? settings.nameAr : "Al Jalsa"}
          nameOther={lang === "ar" ? "Al Jalsa" : settings.nameAr}
          tagline={c("home.hero.tagline")}
          intro={c("home.hero.intro")}
          scrollLine={c("home.hero.scrollLine")}
          left={heroPlate(heroItems[0])}
          right={heroPlate(heroItems[1])}
          ctas={{
            order: { href: href(lang, "/menu"), label: dict.common.orderNow },
            menu: { href: href(lang, "/menu"), label: dict.common.viewMenu },
            catering: { href: href(lang, "/catering"), label: dict.common.cateringCta },
          }}
        />
      ) : null}

      <Story
        eyebrow={c("home.story.eyebrow")}
        panels={[1, 2, 3].map((n, i) => {
          const item = storyItems[i];
          return {
            title: c(`home.story.${n}.title`),
            text: c(`home.story.${n}.text`),
            image: item?.cutoutUrl ?? item?.imageUrl ?? "/brand/logo-mark-light.png",
            alt: item ? name(item) : "",
          };
        })}
      />

      <section className="py-24 lg:py-32" aria-labelledby="categories-title">
        <SectionTitle id="categories-title" title={c("home.categories.title")} text={c("home.categories.text")} />
        <CategoryShowcase rows={categoryRows} viewLabel={dict.common.viewCategory} more={{ title: c("home.categories.more"), links: otherCategories, dishes: dict.menu.dishes }} />
      </section>

      {featured.length ? (
        <FeaturedRail
          locale={lang}
          title={c("home.featured.title")}
          text={c("home.featured.text")}
          items={featured}
          labels={{ add: dict.menu.add, added: dict.menu.added, priceOnRequest: dict.common.priceOnRequest, from: dict.common.from, unavailable: dict.common.unavailable }}
        />
      ) : null}

      {settings.buffetEnabled ? (
        <BuffetSection
          eyebrow={c("buffet.eyebrow")}
          title={c("buffet.title")}
          schedule={c("buffet.schedule")}
          adult={{ price: c("buffet.adultPrice"), regular: c("buffet.adultRegular") }}
          kids={{ price: c("buffet.kidsPrice"), regular: c("buffet.kidsRegular") }}
          kidsAge={c("buffet.kidsAge")}
          note={c("buffet.note")}
          labels={{ adult: dict.buffet.adult, kids: dict.buffet.kids, regular: dict.buffet.regular, directions: dict.common.directions, whatsapp: dict.common.whatsapp }}
          groups={(["salad", "starters", "bbq", "main", "desserts"] as const).map((k) => ({
            title: dict.buffet[k],
            items: c(`buffet.${k}`).split("\n").map((x) => x.trim()).filter(Boolean),
          }))}
          plate={allItems(menu).find((i) => i.slug === "shahi-chicken-biryani")?.cutoutUrl ?? null}
          directions={settings.mapsUrl}
          whatsapp={waLink(settings.whatsapp, lang === "ar" ? "مرحباً، أود الاستفسار عن بوفيه الغداء." : "Hello, I would like to ask about the lunch buffet.")}
        />
      ) : null}

      <section className="border-y border-line/70 bg-ink/60" aria-label={lang === "ar" ? "لمحات" : "Highlights"}>
        <Reveal className="mx-auto grid max-w-[var(--container-site)] sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {highlights.map((h, i) => (
            <div key={i} data-reveal className={`border-line/70 px-6 py-12 sm:px-8 lg:py-16 ${i ? "border-t sm:border-t-0" : ""} ${i % 2 ? "sm:border-s" : ""} ${i > 1 ? "sm:border-t lg:border-t-0" : ""} ${i ? "lg:border-s" : ""}`}>
              <span className="diamond block text-gold" aria-hidden />
              <h3 className="font-display mt-6 text-[1.35rem] uppercase text-ivory">{h.title}</h3>
              <p className="mt-2 text-sand">{h.text}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {gallery.length ? (
        <section className="py-24 lg:py-36" aria-labelledby="gallery-title">
          <SectionTitle id="gallery-title" title={c("home.gallery.title")} />
          <Gallery images={gallery} locale={lang} />
        </section>
      ) : null}

      <section id="reviews" className="py-20 lg:py-28">
        <Reviews
          reviews={reviews}
          title={c("home.reviews.title")}
          emptyText={c("home.reviews.empty")}
          mapsUrl={settings.mapsUrl}
          readLabel={dict.common.readReviews}
          rating={settings.googleRating}
          ratingCount={settings.googleReviewCount}
          checkedOn={settings.ratingCheckedOn}
          locale={lang}
        />
      </section>

      <CateringBand
        eyebrow={dict.nav.catering}
        title={c("catering.cta.title")}
        text={c("catering.cta.text")}
        cta={{ href: href(lang, "/catering#quote"), label: dict.common.requestQuote }}
        secondary={{ href: href(lang, "/book-meeting"), label: dict.nav.meeting }}
        image={cateringPhoto}
        imageAlt={lang === "ar" ? "لحم دوم برياني" : "Mutton dum biryani"}
      />

      <section className="py-24 lg:py-32">
        <VisitBlock locale={lang} dict={dict} settings={settings} title={c("home.visit.title")} text={c("home.visit.text")} />
      </section>
    </>
  );
}
