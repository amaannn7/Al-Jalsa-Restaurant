import Image from "next/image";
import type { ReactNode } from "react";

/** Inner-page header: a dark rounded card with a full-bleed photo, the header sits inside its top. */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt = "",
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  image?: string | null;
  imageAlt?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="sm:px-4 sm:pt-4">
      <div className={`dark-card max-sm:!rounded-none ${image ? "photo-scrim" : ""} flex items-end ${compact ? "min-h-[min(62svh,560px)]" : "min-h-[min(78svh,720px)]"}`}>
        {image ? (
          <Image src={image} alt={imageAlt} fill loading="eager" fetchPriority="high" sizes="100vw" quality={85} className="hero-zoom -z-20 object-cover" />
        ) : null}
        <div className="mx-auto w-full max-w-[var(--container-site)] px-6 pb-12 pt-32 sm:px-10 lg:pb-16">
          <p className="rise-fade eyebrow !text-sand">{eyebrow}</p>
          <h1 className="rise font-display text-hero mt-4 max-w-[18ch] text-white [text-wrap:balance]">{title}</h1>
          {text ? <p className="rise-fade mt-5 max-w-[52ch] text-lg text-white/90 [animation-delay:150ms]">{text}</p> : null}
          {children ? <div className="rise-fade mt-8 [animation-delay:250ms]">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
