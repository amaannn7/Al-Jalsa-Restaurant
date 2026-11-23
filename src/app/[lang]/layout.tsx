import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import "../globals.css";
import { arabicFonts, latinFonts } from "../fonts";
import { dirFor, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getMenu, getSettings, t } from "@/lib/data";
import { displayPhone } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CartProvider } from "@/store/cart";
import { CartDrawer } from "@/components/order/CartDrawer";
import { RevealObserver } from "@/components/motion/RevealObserver";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const brand = lang === "ar" ? "مطعم الجلسة" : "Al Jalsa Restaurant";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: brand, template: `%s | ${brand}` },
    applicationName: brand,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#16120f",
  colorScheme: "light",
};

/* Sets the .js class before paint so reveal styles only apply when JavaScript runs.
   If animations have not started after 3s, content is revealed anyway. The empty touch listener lets
   iOS Safari apply :active, which pauses the reviews marquee while a finger is on it. */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');document.addEventListener('touchstart',function(){},{passive:true});setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.add('reveal-fallback')},3000)})();`;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [settings, menu, content] = await Promise.all([getSettings(), getMenu(), getContent()]);
  const priceIndex = menu.flatMap((c) =>
    c.items.flatMap((i) =>
      i.variants.map((v) => ({ itemId: i.id, variantId: v.id, priceHalalas: v.priceHalalas, available: i.isAvailable })),
    ),
  );

  return (
    <html lang={lang} dir={dirFor(lang)} className={`${latinFonts} ${arabicFonts}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="action sr-only z-[100] rounded-full bg-ink px-5 py-3 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {dict.nav.skip}
        </a>
        <CartProvider priceIndex={priceIndex}>
          <RevealObserver />
          <Header
            locale={lang}
            dict={dict}
            contact={{
              phone: settings.phone,
              phoneLabel: displayPhone(settings.phone),
              address: lang === "ar" ? settings.addressAr : settings.addressEn,
              whatsappHref: waLink(settings.whatsapp),
            }}
          />
          <ViewTransition default="page">
            <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
              {children}
            </main>
          </ViewTransition>
          <Footer locale={lang} dict={dict} settings={settings} tagline={t(content, "home.hero.intro", lang)} />
          <aside aria-label={lang === "ar" ? "إجراءات سريعة" : "Quick actions"}>
            <FloatingWhatsApp locale={lang} whatsapp={settings.whatsapp} label={dict.common.whatsapp} />
            <CartDrawer
              locale={lang}
              dict={dict}
              deliveryEnabled={settings.deliveryEnabled}
              deliveryFeeHalalas={settings.deliveryFeeHalalas}
            />
          </aside>
        </CartProvider>
      </body>
    </html>
  );
}
