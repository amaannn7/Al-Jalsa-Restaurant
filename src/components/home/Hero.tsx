import Image from "next/image";
import Link from "next/link";
import { IconArrow, IconArrowUpRight, IconCutlery, IconWhatsApp } from "@/components/ui/Icons";
import { SignatureCarousel, type Signature } from "./SignatureCarousel";

/**
 * Home hero (reference layout): a dark rounded card with a full-bleed food photo, headline and
 * calls to action on the start side, the signature-dish carousel on the end side, and a white
 * band underneath with a round photo and two short lines.
 */
export function Hero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  menu,
  whatsapp,
  visit,
  signatures,
  carouselLabels,
  band,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  menu: { href: string; label: string };
  whatsapp: { href: string; label: string };
  visit: { href: string; label: string };
  signatures: Signature[];
  carouselLabels: { title: string; view: string; previous: string; next: string };
  band: { image: string; imageAlt: string; href: string; hrefLabel: string; lead: string; text: string };
}) {
  return (
    <section className="sm:px-4 sm:pt-4">
      <div className="overflow-hidden bg-card sm:rounded-[28px]">
        <div className="dark-card photo-scrim !rounded-none">
          <Image src={image} alt={imageAlt} fill loading="eager" fetchPriority="high" sizes="100vw" quality={85} className="hero-zoom -z-20 object-cover object-[center_70%]" />
          <div className="mx-auto grid min-h-[min(100svh-6rem,860px)] max-w-[1600px] items-end gap-12 px-6 pb-10 pt-32 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:pb-14">
            <div className="max-w-[640px]">
              <p className="rise-fade eyebrow !text-sand">{eyebrow}</p>
              <h1 className="rise font-display text-hero mt-5 text-white [text-wrap:balance]">{title}</h1>
              <p className="rise-fade mt-6 max-w-[44ch] text-lg text-white/90 [animation-delay:120ms]">{intro}</p>
              <div className="rise-fade mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:200ms]">
                <Link href={menu.href} className="btn btn-sand action">
                  {menu.label} <IconArrow size={17} />
                </Link>
                <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="action group inline-flex items-center gap-3 text-white">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-white/40 transition-colors group-hover:bg-white group-hover:text-ink">
                    <IconWhatsApp size={19} />
                  </span>
                  {whatsapp.label}
                </a>
              </div>
              <a
                href={visit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rise-fade action group mt-12 inline-flex items-center gap-4 text-white [animation-delay:280ms] lg:mt-16"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white group-hover:text-ink">
                  <IconArrowUpRight size={22} />
                </span>
                <span className="max-w-[9rem] leading-snug">{visit.label}</span>
              </a>
            </div>
            <div className="rise-fade hidden justify-self-end [animation-delay:350ms] lg:block">
              <SignatureCarousel items={signatures} labels={carouselLabels} />
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_auto_1.35fr] lg:gap-10 lg:px-14 lg:py-10">
          <div className="flex items-center gap-6">
            <Link href={band.href} className="group relative block shrink-0" aria-label={band.hrefLabel}>
              <span className="relative block h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
                <Image src={band.image} alt={band.imageAlt} fill sizes="112px" quality={85} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="absolute -bottom-1 -end-3 grid h-12 w-12 place-items-center rounded-full bg-ink text-white ring-4 ring-card transition-colors group-hover:bg-bronze">
                <IconArrowUpRight size={18} />
              </span>
            </Link>
            <p className="max-w-[26ch] text-[1.05rem] leading-snug text-ink-3">{band.lead}</p>
          </div>
          <span className="hidden h-20 w-px bg-hair lg:block" aria-hidden />
          <div className="flex items-center gap-6">
            <IconCutlery size={44} className="hidden shrink-0 text-ink sm:block" />
            <p className="font-display text-[clamp(1.25rem,2vw,1.7rem)] leading-snug text-ink">{band.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
