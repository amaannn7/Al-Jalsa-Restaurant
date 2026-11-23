import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getContent, getMenu, getSettings, t } from "@/lib/data";
import { findItem } from "@/lib/menu-helpers";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { MeetingForm } from "@/components/forms/MeetingForm";
import { IconCalendar, IconUsers, IconWhatsApp } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/book-meeting">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMetadata({
    locale: lang,
    path: "/book-meeting",
    title: lang === "ar" ? "احجز استشارة ضيافة" : "Book a Catering Consultation",
    description:
      lang === "ar"
        ? "اطلب اجتماعاً أو مكالمة مع مطعم الجلسة لمناقشة طلبات الضيافة الكبيرة. يؤكد المطعم الموعد عبر واتساب."
        : "Ask for a meeting or call with Al Jalsa Restaurant to discuss a large catering order. The restaurant confirms the time on WhatsApp.",
  });
}

export default async function MeetingPage({ params }: PageProps<"/[lang]/book-meeting">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [content, settings, menu] = await Promise.all([getContent(), getSettings(), getMenu()]);
  const plate = findItem(menu, "shahi-chicken-biryani");
  const steps =
    lang === "ar"
      ? [
          { Icon: IconCalendar, title: "اختر الموعد", text: "حدد التاريخ والوقت المناسبين لك." },
          { Icon: IconWhatsApp, title: "أرسل الطلب", text: "تصل التفاصيل إلى المطعم عبر واتساب." },
          { Icon: IconUsers, title: "نؤكد معك", text: "يتواصل معك المطعم لتأكيد الموعد." },
        ]
      : [
          { Icon: IconCalendar, title: "Pick a time", text: "Choose the date and time that suits you." },
          { Icon: IconWhatsApp, title: "Send the request", text: "Your details reach the restaurant on WhatsApp." },
          { Icon: IconUsers, title: "We confirm", text: "The restaurant contacts you to confirm the meeting." },
        ];
  return (
    <>
      <PageHero eyebrow={dict.nav.meeting} title={t(content, "meeting.title", lang)} text={t(content, "meeting.text", lang)} image={plate?.imageUrl ?? "/images/site/hero.webp"} imageAlt={plate ? pick(plate, "name", lang) : ""} compact />
      <section className="pb-24 pt-20 lg:pb-28 lg:pt-28">
        <div className="mx-auto grid max-w-[var(--container-site)] gap-12 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <ol className="grid content-start gap-3">
            {steps.map(({ Icon, title, text }, i) => (
              <li key={title} className="card flex gap-5 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-linen text-ink">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="eyebrow">0{i + 1}</p>
                  <h2 className="font-dish mt-1 text-[1.35rem] text-ink">{title}</h2>
                  <p className="mt-1 text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="card p-6 sm:p-10">
            <MeetingForm locale={lang} dict={dict} whatsapp={settings.whatsapp} />
          </div>
        </div>
      </section>
    </>
  );
}
