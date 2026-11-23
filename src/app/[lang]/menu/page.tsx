import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getMenu, getSettings, t } from "@/lib/data";
import { IconArrow, IconClock } from "@/components/ui/Icons";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { PageHero } from "@/components/site/PageHero";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMetadata({
    locale: lang,
    path: "/menu",
    title: lang === "ar" ? "قائمة الطعام" : "Menu",
    description:
      lang === "ar"
        ? "قائمة مطعم الجلسة كاملة مع الأسعار والسعرات: مقبلات، مشويات، أطباق الجلسة الخاصة، أطباق باكستانية وصينية، خضار، أرز، خبز، حلويات ومشروبات. اطلب عبر واتساب."
        : "The full Al Jalsa Restaurant menu with prices and calories: appetizers, kebab, Jalsa specials, Pakistani and Chinese dishes, vegetables, rice, bread, desserts and drinks. Order on WhatsApp.",
  });
}

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [menu, content, settings] = await Promise.all([getMenu(), getContent(), getSettings()]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: lang === "ar" ? "قائمة مطعم الجلسة" : "Al Jalsa Restaurant menu",
    url: `${siteUrl}/${lang}/menu`,
    inLanguage: lang,
    hasMenuSection: menu.map((c) => ({
      "@type": "MenuSection",
      name: lang === "ar" ? c.nameAr : c.nameEn,
      hasMenuItem: c.items.map((i) => ({
        "@type": "MenuItem",
        name: lang === "ar" && i.nameAr ? i.nameAr : i.nameEn,
        description: (lang === "ar" ? i.descriptionAr : i.descriptionEn) || undefined,
        image: i.imageUrl ? `${siteUrl}${i.imageUrl.startsWith("/") ? i.imageUrl : `/${i.imageUrl}`}` : undefined,
        offers: i.variants
          .filter((v) => v.priceHalalas != null)
          .map((v) => ({
            "@type": "Offer",
            price: ((v.priceHalalas as number) / 100).toFixed(2),
            priceCurrency: "SAR",
            ...(v.nameEn ? { name: lang === "ar" && v.nameAr ? v.nameAr : v.nameEn } : {}),
          })),
      })),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <PageHero eyebrow={dict.nav.menu} title={t(content, "menu.title", lang)} text={t(content, "menu.text", lang)} image="/images/menu/bbq-mix-chicken-platter.webp" compact>
        {settings.buffetEnabled ? (
          <Link href={`${href(lang)}#buffet`} className="glass group inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full px-5 py-3 text-white/85 backdrop-blur transition-colors hover:bg-black/60">
            <span className="rounded-full bg-sand px-2.5 py-1 text-[0.8125rem] font-medium text-ink">{t(content, "buffet.title", lang)}</span>
            <span className="inline-flex items-center gap-2">
              <IconClock size={16} className="text-sand" /> {t(content, "buffet.schedule", lang)}
            </span>
            <span className="text-white">
              {dict.buffet.adult} {t(content, "buffet.adultPrice", lang)} · {dict.buffet.kids} {t(content, "buffet.kidsPrice", lang)}
            </span>
            <IconArrow size={16} className="text-sand transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        ) : null}
      </PageHero>
      <MenuExplorer locale={lang} dict={dict} menu={menu} note={t(content, "menu.note", lang)} />
    </>
  );
}
