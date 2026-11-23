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
      className={`group fixed end-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_12px_30px_rgb(0_0_0/0.25)] transition-all duration-500 hover:bg-[#186640] sm:end-6 ${
        lifted ? "bottom-24 md:bottom-6" : "bottom-5 sm:bottom-6"
      }`}
    >
            <IconWhatsApp size={26} />
    </a>
  );
}
