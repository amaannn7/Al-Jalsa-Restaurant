import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getGallery, getMenu, getReviews, getSettings, t } from "@/lib/data";
import { formatPrice, lowestPrice } from "@/lib/money";
import { allItems, PLATE_PREFERENCES } from "@/lib/menu-helpers";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import type { MenuItemData } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { Kitchen } from "@/components/home/Kitchen";
import { SignatureDishes } from "@/components/home/SignatureDishes";
import { CategoryGrid, type CategoryCard } from "@/components/home/CategoryGrid";
import { BuffetSection } from "@/components/home/BuffetSection";
import { Gallery } from "@/components/home/Gallery";
import { Reviews } from "@/components/home/Reviews";
import { CateringBand } from "@/components/home/CateringBand";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { VisitBlock } from "@/components/site/VisitBlock";

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
  const items = allItems(menu);
  const name = (i: { nameEn: string; nameAr: string }) => (lang === "ar" && i.nameAr ? i.nameAr : i.nameEn);
  const priceLabel = (i: MenuItemData) => {
    const low = lowestPrice(i.variants);
    return low == null ? dict.common.priceOnRequest : `${i.variants.length > 1 ? `${dict.common.from} ` : ""}${formatPrice(low, lang)}`;
  };
  /** First dish with a photo among the preferred slugs (then any dish with a photo). */
  const photoOf = (slugs: string[], fallback = true) =>
    slugs.map((s) => items.find((i) => i.slug === s && i.imageUrl)).find(Boolean) ?? (fallback ? items.find((i) => i.imageUrl) : undefined);

  const featured = items.filter((i) => i.isFeatured && i.isAvailable);
  const cards: CategoryCard[] = menu
    .filter((cat) => cat.items.length)
    .map((cat) => {
      const prefs = PLATE_PREFERENCES.category[cat.slug] ?? [];
      const withPhoto = prefs.map((s) => cat.items.find((i) => i.slug === s && i.imageUrl)).find(Boolean) ?? cat.items.find((i) => i.imageUrl);
      return {
        slug: cat.slug,
        name: pick(cat, "name", lang),
        description: pick(cat, "description", lang),
        count: `${cat.items.length} ${dict.menu.dishes}`,
        href: href(lang, `/menu#${cat.slug}`),
        image: withPhoto?.imageUrl ?? null,
      };
    });

  // Hero carousel: one dish from each menu section (not the featured ones, which have their own section).
  const featuredSlugs = new Set(featured.slice(0, 6).map((i) => i.slug));
  const signatures = menu
    .map((cat) => {
      const prefs = PLATE_PREFERENCES.category[cat.slug] ?? [];
      return (
        prefs.map((s) => cat.items.find((i) => i.slug === s && i.imageUrl && i.isAvailable && !featuredSlugs.has(i.slug))).find(Boolean) ??
        cat.items.find((i) => i.imageUrl && i.isAvailable && !featuredSlugs.has(i.slug))
      );
    })
    .filter((i): i is MenuItemData => !!i)
    .slice(0, 8)
    .map((i) => ({
      slug: i.slug,
      name: name(i),
      text: (lang === "ar" && i.descriptionAr ? i.descriptionAr : i.descriptionEn) ?? "",
      price: priceLabel(i),
      image: i.imageUrl!,
      href: href(lang, `/menu#${menu.find((c) => c.items.includes(i))?.slug ?? ""}`),
    }));

  const story = PLATE_PREFERENCES.story.map((p) => photoOf(p));
  const bandDish = photoOf(["shahi-chicken-biryani"]);

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
      <Hero
        eyebrow={c("home.hero.eyebrow")}
        title={c("home.hero.title")}
        intro={c("home.hero.intro")}
        image="/images/site/hero-2.webp"
        imageAlt={lang === "ar" ? "أطباق هندية في أوانٍ نحاسية مع خبز" : "Indian dishes in brass bowls with bread"}
        menu={{ href: href(lang, "/menu"), label: dict.common.viewMenu }}
        whatsapp={{ href: waLink(settings.whatsapp, lang === "ar" ? "مرحباً، أود تقديم طلب." : "Hello, I would like to place an order."), label: dict.common.orderWhatsApp }}
        visit={{ href: settings.mapsUrl, label: dict.common.visitLocation }}
        signatures={signatures}
        carouselLabels={{ title: dict.common.signature, view: dict.common.viewInMenu, previous: dict.common.previous, next: dict.common.next }}
        band={{
          image: bandDish?.imageUrl ?? "/images/site/hero.webp",
          imageAlt: bandDish ? name(bandDish) : "",
          href: href(lang, "/about"),
          hrefLabel: dict.common.ourStory,
          lead: c("home.hero.scrollLine"),
          text: c("home.intro.text"),
        }}
      />

      {featured.length ? (
        <SignatureDishes
          locale={lang}
          eyebrow={c("home.featured.eyebrow")}
          title={c("home.featured.title")}
          text={c("home.featured.text")}
          items={featured}
          menuHref={href(lang, "/menu")}
          labels={{ add: dict.menu.add, added: dict.menu.added, priceOnRequest: dict.common.priceOnRequest, from: dict.common.from, unavailable: dict.common.unavailable, fullMenu: dict.common.viewMenu }}
        />
      ) : null}

      <Kitchen
        eyebrow={c("home.story.eyebrow")}
        title={c("about.menu.title")}
        pillars={[1, 2, 3].map((n, i) => {
          const item = story[i];
          return { title: c(`home.story.${n}.title`), text: c(`home.story.${n}.text`), image: item?.imageUrl ?? "/images/site/hero.webp", alt: item ? name(item) : "" };
        })}
        more={{ href: href(lang, "/about"), label: dict.common.ourStory }}
      />

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
          directions={settings.mapsUrl}
          whatsapp={waLink(settings.whatsapp, lang === "ar" ? "مرحباً، أود الاستفسار عن بوفيه الغداء." : "Hello, I would like to ask about the lunch buffet.")}
          image="/images/site/buffet.webp"
        />
      ) : null}

      <CategoryGrid eyebrow={c("home.categories.eyebrow")} title={c("home.categories.title")} text={c("home.categories.text")} cards={cards} />

      <section id="reviews" className="scroll-mt-24 py-10 lg:py-14">
        <Reviews
          reviews={reviews}
          eyebrow={c("home.reviews.eyebrow")}
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
        image="/images/site/catering.webp"
        imageAlt={lang === "ar" ? "أطباق ضيافة على طاولة بوفيه" : "Catering dishes on a buffet table"}
      />

      {gallery.length ? (
        <section className="py-20 lg:py-28" aria-labelledby="gallery-title">
          <div className="mx-auto max-w-[var(--container-site)] px-5 sm:px-8">
            <SectionTitle id="gallery-title" eyebrow={c("home.gallery.eyebrow")} title={c("home.gallery.title")} />
            <Gallery images={gallery} locale={lang} />
          </div>
        </section>
      ) : null}

      <section className="pb-20 pt-4 lg:pb-28">
        <VisitBlock locale={lang} dict={dict} settings={settings} title={c("home.visit.title")} text={c("home.visit.text")} />
      </section>
    </>
  );
}
