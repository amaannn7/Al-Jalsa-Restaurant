import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { Checkout } from "@/components/order/Checkout";

export async function generateMetadata({ params }: PageProps<"/[lang]/order">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMetadata({
    locale: lang,
    path: "/order",
    title: lang === "ar" ? "اطلب أونلاين" : "Order Online",
    description: lang === "ar" ? "جهّز طلبك من قائمة مطعم الجلسة وأرسله عبر واتساب للاستلام أو التوصيل." : "Build your order from the Al Jalsa Restaurant menu and send it on WhatsApp for takeaway or delivery.",
  });
}

export default async function OrderPage({ params }: PageProps<"/[lang]/order">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = await getSettings();
  return (
    <>
      <PageHero eyebrow={dict.nav.order} title={dict.checkout.title} text={dict.checkout.lead} compact />
      <div className="mx-auto max-w-[var(--container-site)] px-5 pb-28 sm:px-8">
        <Checkout
          locale={lang}
          dict={dict}
          whatsapp={settings.whatsapp}
          restaurantName={lang === "ar" ? settings.nameAr : settings.nameEn}
          takeawayEnabled={settings.takeawayEnabled}
          deliveryEnabled={settings.deliveryEnabled}
          deliveryFeeHalalas={settings.deliveryFeeHalalas}
          deliveryNote={lang === "ar" ? settings.deliveryNoteAr : settings.deliveryNoteEn}
        />
      </div>
    </>
  );
}
