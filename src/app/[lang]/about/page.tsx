import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getMenu, getSettings, t } from "@/lib/data";
import { findItem } from "@/lib/menu-helpers";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { ScrubText } from "@/components/motion/ScrubText";
import { EditorialBlocks } from "@/components/about/EditorialBlocks";
import { VisitBlock } from "@/components/site/VisitBlock";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMetadata({
    locale: lang,
    path: "/about",
    title: lang === "ar" ? "من نحن" : "About Us",
    description:
      lang === "ar"
        ? "مطعم الجلسة، مطعم متعدد المطابخ في شارع ابن النديم بحي المربع في الرياض. القائمة، تجربة الطعام، الموقع وساعات العمل."
        : "Al Jalsa, a multi-cuisine restaurant on Ibn Al Nadeem Street in Al Murabba, Riyadh. The menu, the dining experience, location and opening hours.",
  });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [content, menu, settings] = await Promise.all([getContent(), getMenu(), getSettings()]);
  const c = (k: string) => t(content, k, lang);
  const item = (slug: string) => findItem(menu, slug);
  const img = (slug: string) => item(slug)?.imageUrl ?? "/images/menu/shahi-chicken-biryani.webp";
  const cut = (slug: string) => {
    const i = item(slug);
    return i?.cutoutWhole ? i.cutoutUrl : null;
  };
  const heroPlate = item("mutton-maharaja");
  const alt = (slug: string) => {
    const i = item(slug);
    return i ? pick(i, "name", lang) : "";
  };

  return (
    <>
      <PageHero eyebrow={c("about.eyebrow")} title={c("about.title")} text={c("about.intro")} image={cut("mutton-maharaja")} imageAlt={heroPlate ? pick(heroPlate, "name", lang) : ""} />
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <span className="diamond mx-auto mb-10 block text-gold" aria-hidden />
          <ScrubText text={c("about.menu.text")} className="font-dish text-center text-[clamp(1.6rem,3.4vw,2.9rem)] leading-[1.3] text-ivory rtl:leading-[1.6]" />
        </div>
      </section>
      <section className="pb-24 pt-10 lg:pb-36">
        <EditorialBlocks
          blocks={[
            { title: c("about.menu.title"), text: c("about.menu.text"), image: img("butter-chicken"), alt: alt("butter-chicken"), plate: cut("garlic-naan") },
            { title: c("about.dining.title"), text: c("about.dining.text"), image: img("mutton-dum-biryani"), alt: alt("mutton-dum-biryani"), plate: cut("gulab-jamun") ?? cut("gajar-ka-halwa") },
            { title: c("about.gather.title"), text: c("about.gather.text"), image: img("chicken-tandoori"), alt: alt("chicken-tandoori"), plate: cut("paneer-butter-masala") },
          ]}
        />
      </section>
      <section className="border-t border-line/70 py-24 lg:py-32">
        <VisitBlock locale={lang} dict={dict} settings={settings} title={c("home.visit.title")} text={c("home.visit.text")} />
      </section>
    </>
  );
}
