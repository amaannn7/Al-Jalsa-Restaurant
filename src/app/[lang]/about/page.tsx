import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getMenu, getSettings, t } from "@/lib/data";
import { findItem } from "@/lib/menu-helpers";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
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
  const alt = (slug: string) => {
    const i = item(slug);
    return i ? pick(i, "name", lang) : "";
  };

  return (
    <>
      <PageHero eyebrow={c("about.eyebrow")} title={c("about.title")} text={c("about.intro")} image="/images/site/hero.webp" imageAlt={lang === "ar" ? "مائدة عامرة بالأطباق الهندية" : "A table spread with Indian dishes"} />
      <section className="pb-24 pt-20 lg:pb-32 lg:pt-28">
        <EditorialBlocks
          blocks={[
            { title: c("about.menu.title"), text: c("about.menu.text"), image: img("murgh-mastaan"), alt: alt("murgh-mastaan"), inset: { src: img("garlic-naan"), alt: alt("garlic-naan") } },
            { title: c("about.dining.title"), text: c("about.dining.text"), image: img("mutton-dum-biryani"), alt: alt("mutton-dum-biryani"), inset: { src: img("gulab-jamun"), alt: alt("gulab-jamun") } },
            { title: c("about.gather.title"), text: c("about.gather.text"), image: img("chicken-tandoori"), alt: alt("chicken-tandoori"), inset: { src: img("paneer-butter-masala"), alt: alt("paneer-butter-masala") } },
          ]}
        />
      </section>
      <section className="pb-20 lg:pb-28">
        <VisitBlock locale={lang} dict={dict} settings={settings} title={c("home.visit.title")} text={c("home.visit.text")} />
      </section>
    </>
  );
}
