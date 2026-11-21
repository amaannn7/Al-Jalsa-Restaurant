"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { waLink } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { IconWhatsApp } from "@/components/ui/Icons";

export function FloatingWhatsApp({ locale, whatsapp, label }: { locale: Locale; whatsapp: string; label: string }) {
  const { count } = useCart();
  const pathname = usePathname();
  const greeting = locale === "ar" ? "مرحباً، لدي استفسار." : "Hello, I have a question.";
  // Lift the button above the mobile order bar when the cart has items (except on the order page).
  const lifted = count > 0 && !pathname?.endsWith("/order");
  return (
    <a
      href={waLink(whatsapp, greeting)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: ${locale === "ar" ? "تواصل معنا" : "chat with us"}`}
      className={`group fixed end-4 z-40 grid h-14 w-14 place-items-center rounded-full border border-gold/60 bg-ink/90 text-gold shadow-[0_12px_30px_rgb(0_0_0/0.45)] backdrop-blur transition-all duration-500 hover:border-gold hover:bg-gold hover:text-ink sm:end-6 ${
        lifted ? "bottom-24 md:bottom-6" : "bottom-5 sm:bottom-6"
      }`}
    >
      <span className="absolute inset-0 rounded-full border border-gold/40 motion-safe:animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_3]" aria-hidden />
      <IconWhatsApp size={26} />
    </a>
  );
}
