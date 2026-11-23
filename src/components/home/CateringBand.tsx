import Image from "next/image";
import Link from "next/link";
import { IconArrow } from "@/components/ui/Icons";

/** Full-bleed photo card with the catering call to action. */
export function CateringBand({
  eyebrow,
  title,
  text,
  cta,
  secondary,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  text: string;
  cta: { href: string; label: string };
  secondary: { href: string; label: string };
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="px-3 py-10 sm:px-4 lg:py-14" aria-labelledby="catering-band-title">
      <div className="dark-card photo-scrim mx-auto flex min-h-[min(80svh,640px)] max-w-[1600px] items-end">
        <Image src={image} alt={imageAlt} fill sizes="100vw" quality={85} className="-z-20 object-cover" />
        <div className="w-full px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <p data-reveal className="eyebrow !text-sand">
            {eyebrow}
          </p>
          <h2 data-reveal id="catering-band-title" className="font-display text-display mt-4 max-w-[18ch] text-white [text-wrap:balance]">
            {title}
          </h2>
          <p data-reveal className="mt-5 max-w-[48ch] text-lg text-white/90">
            {text}
          </p>
          <div data-reveal className="mt-9 flex flex-wrap gap-3">
            <Link href={cta.href} className="btn btn-sand action">
              {cta.label} <IconArrow size={17} />
            </Link>
            <Link href={secondary.href} className="btn btn-ghost action">
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
