import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getSettings, t } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { VisitBlock } from "@/components/site/VisitBlock";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/site/SocialLinks";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMetadata({
    locale: lang,
    path: "/contact",
    title: lang === "ar" ? "تواصل معنا" : "Contact Us",
    description:
      lang === "ar"
        ? "عنوان مطعم الجلسة ورقم الهاتف وواتساب وساعات العمل والاتجاهات في حي المربع، الرياض."
        : "Al Jalsa Restaurant address, phone, WhatsApp, opening hours and directions in Al Murabba, Riyadh.",
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [content, settings] = await Promise.all([getContent(), getSettings()]);
  return (
    <>
      <PageHero eyebrow={dict.nav.contact} title={t(content, "contact.title", lang)} text={t(content, "contact.text", lang)} image="/images/menu/chicken-karahi.webp" compact />
      <section className="pb-16 pt-20 lg:pt-28">
        <VisitBlock locale={lang} dict={dict} settings={settings} title={lang === "ar" ? settings.nameAr : settings.nameEn} />
      </section>
      <section className="pb-20 pt-8 lg:pb-28">
        <div className="mx-auto grid max-w-[var(--container-site)] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-display text-ink">{t(content, "contact.form.title", lang)}</h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="eyebrow">{dict.common.follow}</span>
              <SocialLinks socials={settings.socials} label={dict.common.follow} tone="light" />
            </div>
          </div>
          <div className="card p-6 sm:p-10">
            <ContactForm locale={lang} dict={dict} whatsapp={settings.whatsapp} />
          </div>
        </div>
      </section>
    </>
  );
}
