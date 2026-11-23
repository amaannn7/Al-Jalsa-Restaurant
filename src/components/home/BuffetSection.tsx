import Image from "next/image";
import { IconClock, IconPin, IconWhatsApp } from "@/components/ui/Icons";

type Group = { title: string; items: string[] };
type Price = { price: string; regular: string };

/**
 * The restaurant's lunch buffet poster as a dark card: offer, prices (regular price crossed out),
 * a photo, and the dish lists.
 */
export function BuffetSection({
  eyebrow,
  title,
  schedule,
  adult,
  kids,
  labels,
  kidsAge,
  note,
  groups,
  directions,
  whatsapp,
  image,
}: {
  eyebrow: string;
  title: string;
  schedule: string;
  adult: Price;
  kids: Price;
  labels: { adult: string; kids: string; regular: string; directions: string; whatsapp: string };
  kidsAge: string;
  note: string;
  groups: Group[];
  directions: string;
  whatsapp: string;
  image: string;
}) {
  const price = (label: string, p: Price) => (
    <div className="rounded-[20px] bg-white/[0.06] p-5 ring-1 ring-white/10">
      <p className="text-sm text-white/65">{label}</p>
      <p className="font-display mt-1 text-[2.2rem] leading-none text-white">{p.price}</p>
      {p.regular ? (
        <p className="mt-2 text-sm text-white/55">
          <span className="sr-only">{labels.regular}: </span>
          <s>{p.regular}</s>
        </p>
      ) : null}
    </div>
  );
  return (
    <section id="buffet" className="scroll-mt-24 px-3 py-10 sm:px-4 lg:py-14" aria-labelledby="buffet-title">
      <div className="dark-card mx-auto grid max-w-[1600px] lg:grid-cols-2">
        <div className="relative min-h-[320px] lg:min-h-full">
          <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" quality={85} className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent lg:bg-gradient-to-r rtl:lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-ink/40" aria-hidden />
        </div>
        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <p className="eyebrow inline-flex rounded-full bg-sand px-3 py-1.5 !text-ink">{eyebrow}</p>
          <h2 id="buffet-title" className="font-display text-display mt-5 text-white">
            {title}
          </h2>
          <p className="mt-4 flex items-center gap-3 text-white/80">
            <IconClock size={19} className="shrink-0 text-sand" /> {schedule}
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            {price(labels.adult, adult)}
            {price(labels.kids, kids)}
          </div>
          <p className="mt-4 text-sm text-white/60">
            {kidsAge}. {note}
          </p>
          <div className="mt-10 grid gap-x-8 gap-y-7 border-t border-white/10 pt-8 sm:grid-cols-2">
            {groups
              .filter((g) => g.items.length)
              .map((g) => (
                <div key={g.title}>
                  <h3 className="eyebrow !text-sand">{g.title}</h3>
                  <p className="mt-2 text-white/80">{g.items.join(" · ")}</p>
                </div>
              ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-sand action">
              <IconWhatsApp size={17} /> {labels.whatsapp}
            </a>
            <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-ghost action">
              <IconPin size={17} /> {labels.directions}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
